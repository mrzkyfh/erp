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
      {/* Stock List - Visible for all roles - APPEARS FIRST */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Stock</CardTitle>
              <CardDescription>
                {searchQuery ? `Hasil pencarian: "${searchQuery}"` : "Stok saat ini dan status ketersediaan bahan."}
              </CardDescription>
            </div>
            {!isKaryawan && (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => navigate("/inventori/tambah-item")}>
                  <Plus className="h-4 w-4" />
                  Item
                </Button>
                <Button size="sm" onClick={() => navigate("/inventori/tambah-supplier")}>
                  <Plus className="h-4 w-4" />
                  Supplier
                </Button>
                <Button size="sm" onClick={() => navigate("/inventori/pembelian")}>
                  <Plus className="h-4 w-4" />
                  Pembelian
                </Button>
                <Button size="sm" onClick={() => navigate("/inventori/penggunaan")}>
                  <Plus className="h-4 w-4" />
                  Penggunaan
                </Button>
                <Button size="sm" onClick={() => navigate("/inventori/pengeluaran")}>
                  <Plus className="h-4 w-4" />
                  Pengeluaran
                </Button>
              </div>
            )}
          </div>
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

      {/* Action Buttons - Visible for all roles to record usage */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>Catat penggunaan stok bahan baku.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/inventori/penggunaan")} className="w-full" variant="outline">
            <Plus className="h-4 w-4" />
            Catat Penggunaan Stok
          </Button>
        </CardContent>
      </Card>

      {/* History - Visible for all roles */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>Histori pembelian dan penggunaan stok terbaru.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 xl:grid-cols-2">
          <div>
            <p className="mb-3 font-medium">Pembelian Terbaru</p>
            <div className="space-y-3">
              {overview.purchases.length > 0 ? (
                overview.purchases.map((purchase) => (
                  <div key={purchase.id} className="rounded-2xl border border-border bg-white p-4">
                    <p className="font-medium">{purchase.supplier?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateID(purchase.date)} • {formatRupiah(purchase.total_amount)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada pembelian</p>
              )}
            </div>
          </div>
          <div>
            <p className="mb-3 font-medium">Penggunaan Terbaru</p>
            <div className="space-y-3">
              {overview.usages.length > 0 ? (
                overview.usages.map((usage) => (
                  <div key={usage.id} className="rounded-2xl border border-border bg-white p-4">
                    <p className="font-medium">{usage.item?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {usage.qty} {usage.item?.unit} • {usage.reason}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Tidak ada penggunaan</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

