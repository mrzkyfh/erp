import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { api } from "@/lib/api";

const initialForm = { item_id: "", qty: "", reason: "", date: "" };

export function UseStockPage() {
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

  const selectedItem = items.find((item) => item.id === form.item_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.item_id || !form.qty || !form.reason) {
        toast.error("Item, qty, dan alasan penggunaan wajib diisi.");
        return;
      }
      if (!form.date) {
        toast.error("Tanggal wajib diisi.");
        return;
      }
      if (selectedItem && Number(form.qty) > Number(selectedItem.current_stock)) {
        toast.error(`Stok tidak cukup. Tersedia: ${selectedItem.current_stock} ${selectedItem.unit}`);
        return;
      }
      await api.post("/inventory/usages", {
        ...form,
        qty: Number(form.qty),
      });
      toast.success("Penggunaan stok berhasil dicatat.");
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
          <h1 className="text-2xl font-bold">Penggunaan Stok</h1>
          <p className="text-sm text-muted-foreground">Setiap penggunaan akan langsung mengurangi stok item terkait.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Penggunaan Stok</CardTitle>
          <CardDescription>Catat penggunaan stok untuk mengurangi inventori.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Item" required>
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={form.item_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, item_id: e.target.value }))}
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
                  min="1"
                  max={selectedItem ? Number(selectedItem.current_stock) : undefined}
                  placeholder="0"
                  value={form.qty}
                  onChange={(e) => setForm((prev) => ({ ...prev, qty: e.target.value }))}
                />
                {selectedItem && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Stok tersedia: {selectedItem.current_stock} {selectedItem.unit}
                  </p>
                )}
              </FormField>
              <FormField label="Alasan" required>
                <Input
                  placeholder="Contoh: Produksi, Rusak, Hilang"
                  value={form.reason}
                  onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
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
                {loading ? "Menyimpan..." : "Simpan Penggunaan"}
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
