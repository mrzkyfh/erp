import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const UNIT_LABELS = {
  per_kehadiran: "Perkehadiran",
  per_jam: "Perjam",
  fixed: "Tetap (Bulanan)",
};

export function SalarySettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [salaryTypes, setSalaryTypes] = useState([]);

  useEffect(() => {
    loadSalaryTypes();
  }, []);

  const loadSalaryTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/salary-types");
      setSalaryTypes(response.data || []);
    } catch (error) {
      toast.error("Gagal memuat pengaturan gaji");
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = () => {
    setSalaryTypes((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, name: "", amount: 0, unit: "per_kehadiran", isNew: true },
    ]);
  };

  const handleRemoveType = async (type) => {
    if (type.isNew) {
      setSalaryTypes((prev) => prev.filter((t) => t.id !== type.id));
      return;
    }

    if (!confirm(`Hapus jenis gaji "${type.name}"?`)) return;

    try {
      await api.delete(`/salary-types/${type.id}`);
      toast.success("Jenis gaji berhasil dihapus");
      loadSalaryTypes();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateField = (id, field, value) => {
    setSalaryTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      for (const type of salaryTypes) {
        if (!type.name) continue;

        const payload = {
          name: type.name,
          amount: Number(type.amount),
          unit: type.unit,
        };

        if (type.isNew) {
          await api.post("/salary-types", payload);
        } else {
          await api.put(`/salary-types/${type.id}`, payload);
        }

      }
      toast.success("Pengaturan gaji berhasil disimpan");
      loadSalaryTypes();
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/penggajian")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Gaji</h1>
          <p className="text-sm text-muted-foreground">Kelola kategori dan nilai gaji karyawan.</p>
        </div>
      </div>

      <Card className="border-none shadow-soft overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle>Komponen Gaji</CardTitle>
          <CardDescription>
            Tentukan nilai nominal dan unit perhitungan untuk setiap komponen gaji.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {salaryTypes.map((type) => (
              <div key={type.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <Input
                      variant="ghost"
                      className="text-sm font-semibold p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50"
                      placeholder="Nama Komponen (misal: Uang Makan)"
                      value={type.name}
                      onChange={(e) => handleUpdateField(type.id, "name", e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8 p-0"
                    onClick={() => handleRemoveType(type)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                      Rp
                    </div>
                    <Input
                      type="number"
                      className="pl-10 h-11 bg-muted/30 border-none rounded-xl"
                      value={type.amount}
                      onChange={(e) => handleUpdateField(type.id, "amount", e.target.value)}
                    />
                  </div>
                  <div className="w-[140px]">
                    <select
                      className="h-11 w-full rounded-xl bg-muted/50 border-none px-3 text-sm font-medium focus:ring-2 focus:ring-primary"
                      value={type.unit}
                      onChange={(e) => handleUpdateField(type.id, "unit", e.target.value)}
                    >
                      <option value="per_kehadiran">Perkehadiran</option>
                      <option value="per_jam">Perjam</option>
                      <option value="fixed">Tetap</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {salaryTypes.length === 0 && !loading && (
            <div className="p-12 text-center text-muted-foreground">
              <p>Belum ada komponen gaji. Klik tombol di bawah untuk menambah.</p>
            </div>
          )}

          <div className="p-4 bg-muted/5">
            <Button
              variant="ghost"
              className="w-full justify-start text-primary hover:text-primary hover:bg-primary/5 gap-2 font-semibold"
              onClick={handleAddType}
            >
              <Plus className="h-5 w-5 bg-primary text-white rounded-full p-0.5" />
              Tambahkan Jenis Gaji
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
        onClick={handleSaveAll}
        disabled={saving}
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </div>
  );
}
