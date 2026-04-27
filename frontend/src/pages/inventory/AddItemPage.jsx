import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { api } from "@/lib/api";

const initialForm = { name: "", category_id: "", unit: "pcs", current_stock: "", min_stock: "" };

export function AddItemPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get("/inventory/overview");
      setCategories(response.data.categories || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.name) {
        toast.error("Nama item wajib diisi.");
        return;
      }
      await api.post("/inventory/items", {
        ...form,
        category_id: form.category_id || null,
        current_stock: Number(form.current_stock || 0),
        min_stock: Number(form.min_stock || 0),
      });
      toast.success("Item inventori berhasil ditambahkan.");
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
          <h1 className="text-2xl font-bold">Tambah Item Inventori</h1>
          <p className="text-sm text-muted-foreground">Atur stok awal dan batas minimum untuk alert.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Tambah Item</CardTitle>
          <CardDescription>Lengkapi semua field untuk menambahkan item baru ke inventori.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nama Item" required>
                <Input
                  placeholder="Contoh: Beras, Minyak, Gula"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </FormField>
              <FormField label="Kategori">
                <select
                  className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={form.category_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                >
                  <option value="">Tanpa kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Satuan" required>
                <Input
                  placeholder="Contoh: pcs, kg, liter"
                  value={form.unit}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                />
              </FormField>
              <FormField label="Stok Awal" required>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.current_stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, current_stock: e.target.value }))}
                />
              </FormField>
              <FormField label="Stok Minimum" required>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.min_stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, min_stock: e.target.value }))}
                />
              </FormField>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Item"}
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
