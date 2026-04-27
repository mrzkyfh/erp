import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { api } from "@/lib/api";

const initialForm = { supplier_id: "", item_id: "", qty: "", unit_price: "", date: "" };

export function PurchaseStockPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadData();
    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    setForm((prev) => ({ ...prev, date: today }));
  }, []);

  const loadData = async () => {
    try {
      const response = await api.get("/inventory/overview");
      setSuppliers(response.data.suppliers || []);
      setItems(response.data.items || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.supplier_id || !form.item_id || !form.qty) {
        toast.error("Supplier, item, dan qty wajib diisi.");
        return;
      }
      await api.post("/inventory/purchases", {
        ...form,
        qty: Number(form.qty),
        unit_price: Number(form.unit_price || 0),
      });
      toast.success("Pembelian stok berhasil dicatat.");
      navigate("/inventori");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/inventori")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Pembelian Stok</h1>
          <p className="text-sm text-muted-foreground">Konfirmasi pembelian akan menambah stok item otomatis.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Pembelian Stok</CardTitle>
          <CardDescription>Catat pembelian stok dari supplier untuk menambah inventori.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Supplier" required>
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={form.supplier_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, supplier_id: e.target.value }))}
                >
                  <option value="">Pilih supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Item" required>
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={form.item_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, item_id: e.target.value }))}
                >
                  <option value="">Pilih item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Qty" required>
                <Input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={form.qty}
                  onChange={(e) => setForm((prev) => ({ ...prev, qty: e.target.value }))}
                />
              </FormField>
              <FormField label="Harga Satuan" required>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.unit_price}
                  onChange={(e) => setForm((prev) => ({ ...prev, unit_price: e.target.value }))}
                />
              </FormField>
              <FormField label="Tanggal" required>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </FormField>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Pembelian"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/inventori")}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
