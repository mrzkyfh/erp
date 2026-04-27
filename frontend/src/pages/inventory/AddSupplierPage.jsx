import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import { api } from "@/lib/api";

const initialForm = { name: "", contact_phone: "", email: "", address: "" };

export function AddSupplierPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!form.name) {
        toast.error("Nama supplier wajib diisi.");
        return;
      }
      await api.post("/inventory/suppliers", form);
      toast.success("Supplier berhasil ditambahkan.");
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
          <h1 className="text-2xl font-bold">Tambah Supplier</h1>
          <p className="text-sm text-muted-foreground">Simpan vendor utama untuk pembelian stok.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Tambah Supplier</CardTitle>
          <CardDescription>Lengkapi data supplier untuk memudahkan pembelian stok.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Nama Supplier" required>
                <Input
                  placeholder="Contoh: PT Maju Jaya"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </FormField>
              <FormField label="Nomor HP">
                <Input
                  placeholder="Contoh: 081234567890"
                  value={form.contact_phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, contact_phone: e.target.value }))}
                />
              </FormField>
              <FormField label="Email">
                <Input
                  type="email"
                  placeholder="Contoh: supplier@mail.com"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </FormField>
            </div>

            <FormField label="Alamat">
              <Textarea
                placeholder="Alamat lengkap supplier"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </FormField>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Supplier"}
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
