import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import { api } from "@/lib/api";

const initialForm = { item_id: "", qty: "", unit_price: "", reason: "", date: "" };

export function MaterialExpensePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
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
      setItems(response.data.items || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleItemChange = async (itemId) => {
    setForm((prev) => ({ ...prev, item_id: itemId, unit_price: "" }));
    if (itemId) {
      console.log("Fetching latest price for item:", itemId);
      try {
        const response = await api.get(`/inventory/latest-price/${itemId}`);
        console.log("Latest price response:", response);
        const price = response.data?.price;
        if (price !== undefined && price !== null) {
          setForm((prev) => ({ ...prev, unit_price: String(price) }));
          if (Number(price) > 0) {
            toast.info(`Harga satuan otomatis: Rp ${Number(price).toLocaleString("id-ID")}`);
          }
        }

      } catch (error) {
        console.error("Failed to fetch latest price", error);
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.item_id || !form.qty || !form.unit_price) {
        toast.error("Item, qty, dan harga satuan wajib diisi.");
        return;
      }
      
      const totalExpense = Number(form.qty) * Number(form.unit_price);
      
      await api.post("/inventory/material-expenses", {
        item_id: form.item_id,
        qty: Number(form.qty),
        unit_price: Number(form.unit_price),
        total_expense: totalExpense,
        reason: form.reason || null,
        date: form.date,
      });
      
      toast.success("Pengeluaran bahan berhasil dicatat.");
      navigate("/inventori");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalExpense = form.qty && form.unit_price ? (Number(form.qty) * Number(form.unit_price)).toLocaleString("id-ID") : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/inventori")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Pengeluaran Bahan</h1>
          <p className="text-sm text-muted-foreground">Catat pengeluaran/biaya bahan untuk keperluan bisnis.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Pengeluaran Bahan</CardTitle>
          <CardDescription>Catat pengeluaran bahan. Harga akan otomatis terisi jika item pernah dibeli sebelumnya.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Item" required>
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={form.item_id}
                  onChange={(e) => handleItemChange(e.target.value)}
                >
                  <option value="">Pilih item</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.current_stock} {item.unit})
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Qty" required>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0"
                  value={form.qty}
                  onChange={(e) => setForm((prev) => ({ ...prev, qty: e.target.value }))}
                />
              </FormField>
              <FormField label="Harga Satuan (Rp)" required>
                <Input
                  type="number"
                  min="0"
                  placeholder="Masukkan harga satuan"
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

            <FormField label="Alasan/Keterangan">
              <Textarea
                placeholder="Contoh: Pembelian bahan baku, Perbaikan peralatan, dll"
                value={form.reason}
                onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              />
            </FormField>

            {/* Total Expense Summary */}
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
              <p className="text-2xl font-bold">Rp {totalExpense}</p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
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
