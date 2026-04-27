import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDateID, formatRupiah } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function InventoryPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isKaryawan = profile?.role === "karyawan";
  
  const [overview, setOverview] = useState({
    items: [],
    categories: [],
    suppliers: [],
    purchases: [],
    usages: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk filter tanggal riwayat transaksi
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [filteredUsages, setFilteredUsages] = useState([]);

  const filteredItems = overview.items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadData = async () => {
    try {
      const response = await api.get("/inventory/overview");
      setOverview(response.data);
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  // Filter transaksi berdasarkan tanggal yang dipilih
  useEffect(() => {
    if (selectedDate) {
      const filtered = overview.purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date).toISOString().split('T')[0];
        return purchaseDate === selectedDate;
      });
      setFilteredPurchases(filtered);
      
      const filteredUsage = overview.usages.filter(usage => {
        const usageDate = new Date(usage.date).toISOString().split('T')[0];
        return usageDate === selectedDate;
      });
      setFilteredUsages(filteredUsage);
    } else {
      setFilteredPurchases(overview.purchases);
      setFilteredUsages(overview.usages);
    }
  }, [selectedDate, overview.purchases, overview.usages]);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Quick Actions - Mobile Optimized */}
      <Card>
        <CardHeader>
          <CardTitle>Kelola Inventori</CardTitle>
          <CardDescription>
            {isKaryawan 
              ? "Catat transaksi pembelian, penggunaan, dan pengeluaran bahan."
              : "Tambah item, supplier, atau catat transaksi."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {/* Owner only: Item & Supplier */}
            {!isKaryawan && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => navigate("/inventori/tambah-item")}
                  className="flex-col h-auto py-3 gap-1"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Item</span>
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => navigate("/inventori/tambah-supplier")}
                  className="flex-col h-auto py-3 gap-1"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Supplier</span>
                </Button>
              </>
            )}
            
            {/* All roles: Pembelian, Penggunaan, Pengeluaran */}
            <Button 
              size="sm" 
              onClick={() => navigate("/inventori/pembelian")}
              className="flex-col h-auto py-3 gap-1"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Pembelian</span>
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate("/inventori/penggunaan")}
              className="flex-col h-auto py-3 gap-1"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Penggunaan</span>
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate("/inventori/pengeluaran")}
              className={`flex-col h-auto py-3 gap-1 ${isKaryawan ? '' : 'col-span-2 sm:col-span-1'}`}
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs">Pengeluaran</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stock List - Visible for all roles - APPEARS FIRST */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Stock</CardTitle>
          <CardDescription>
            {searchQuery ? `Hasil pencarian: "${searchQuery}"` : "Stok saat ini dan status ketersediaan bahan."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Hapus
              </Button>
            )}
          </div>

          {/* Stock Table */}
          <Table>
            <THead>
              <TR>
                <TH>Item</TH>
                <TH>Stok</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TR key={item.id}>
                    <TD>{item.name}</TD>
                    <TD>
                      {item.current_stock} {item.unit}
                    </TD>
                    <TD>
                      <Badge tone={Number(item.current_stock) <= Number(item.min_stock) ? "warning" : "success"}>
                        {Number(item.current_stock) <= Number(item.min_stock) ? "Perlu restock" : "Aman"}
                      </Badge>
                    </TD>
                  </TR>
                ))
              ) : (
                <TR>
                  <TD colSpan="3" className="text-center text-muted-foreground">
                    {searchQuery ? "Tidak ada item yang cocok" : "Tidak ada item"}
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      {/* History - Visible for all roles */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>Pilih tanggal untuk melihat transaksi pada hari tersebut.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date Picker */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="h-5 w-5 text-slate-600" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const today = new Date();
                  setSelectedDate(today.toISOString().split('T')[0]);
                }}
                className="flex-1 sm:flex-none"
              >
                Hari Ini
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDate("")}
                className="flex-1 sm:flex-none"
              >
                Semua
              </Button>
            </div>
          </div>
          
          {/* Transaction Summary */}
          {selectedDate && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
              <p className="text-sm text-blue-900">
                📅 Menampilkan transaksi pada <strong>{formatDateID(selectedDate)}</strong>
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {filteredPurchases.length} pembelian • {filteredUsages.length} penggunaan
              </p>
            </div>
          )}

          {/* Transactions Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-900">
                Pembelian {selectedDate ? `(${filteredPurchases.length})` : ''}
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map((purchase) => (
                    <div key={purchase.id} className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="font-medium text-slate-900">{purchase.supplier?.name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {formatDateID(purchase.date)} • {formatRupiah(purchase.total_amount)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">
                    {selectedDate ? "Tidak ada pembelian pada tanggal ini" : "Tidak ada pembelian"}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-900">
                Penggunaan {selectedDate ? `(${filteredUsages.length})` : ''}
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsages.length > 0 ? (
                  filteredUsages.map((usage) => (
                    <div key={usage.id} className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="font-medium text-slate-900">{usage.item?.name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {usage.qty} {usage.item?.unit} • {usage.reason}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4 text-center">
                    {selectedDate ? "Tidak ada penggunaan pada tanggal ini" : "Tidak ada penggunaan"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

