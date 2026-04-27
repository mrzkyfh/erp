import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";
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

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Quick Actions for Owner/Manager - Mobile Optimized */}
      {!isKaryawan && (
        <Card>
          <CardHeader>
            <CardTitle>Kelola Inventori</CardTitle>
            <CardDescription>Tambah item, supplier, atau catat transaksi.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
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
                className="flex-col h-auto py-3 gap-1 col-span-2 sm:col-span-1"
              >
                <Plus className="h-5 w-5" />
                <span className="text-xs">Pengeluaran</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Action Buttons - Visible for Karyawan to record usage */}
      {isKaryawan && (
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Catat penggunaan stok bahan baku.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/inventori/penggunaan")} 
              className="w-full flex-col h-auto py-4 gap-2" 
              variant="outline"
            >
              <Plus className="h-6 w-6" />
              <span>Catat Penggunaan Stok</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History - Visible for all roles */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>Histori pembelian dan penggunaan stok terbaru.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900">Pembelian Terbaru</p>
            <div className="space-y-2">
              {overview.purchases.length > 0 ? (
                overview.purchases.map((purchase) => (
                  <div key={purchase.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="font-medium text-slate-900">{purchase.supplier?.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDateID(purchase.date)} • {formatRupiah(purchase.total_amount)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 py-4 text-center">Tidak ada pembelian</p>
              )}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-900">Penggunaan Terbaru</p>
            <div className="space-y-2">
              {overview.usages.length > 0 ? (
                overview.usages.map((usage) => (
                  <div key={usage.id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="font-medium text-slate-900">{usage.item?.name}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {usage.qty} {usage.item?.unit} • {usage.reason}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 py-4 text-center">Tidak ada penggunaan</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

