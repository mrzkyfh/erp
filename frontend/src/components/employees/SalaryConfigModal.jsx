import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatRupiah } from "@/lib/utils";

export function SalaryConfigModal({ employee, onClose, onSave }) {
  const [salaryTypes, setSalaryTypes] = useState([]);
  const [config, setConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [employee.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [typesRes, configRes] = await Promise.all([
        api.get("/salary-types"),
        api.get(`/employees/${employee.id}/salary-config`),
      ]);
      setSalaryTypes(typesRes.data || []);
      
      // Map existing config or initialize empty
      const existingConfig = (configRes.data || []).map(c => ({
        salary_type_id: c.salary_type_id,
        amount: c.amount,
        name: c.salary_type?.name,
        unit: c.salary_type?.unit
      }));
      setConfig(existingConfig);
    } catch (error) {
      toast.error("Gagal memuat konfigurasi gaji");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComponent = (type) => {
    if (config.find(c => c.salary_type_id === type.id)) {
      toast.error("Komponen ini sudah ditambahkan");
      return;
    }
    setConfig(prev => [...prev, {
      salary_type_id: type.id,
      amount: type.amount,
      name: type.name,
      unit: type.unit
    }]);
  };

  const handleRemoveComponent = (id) => {
    setConfig(prev => prev.filter(c => c.salary_type_id !== id));
  };

  const handleUpdateAmount = (id, amount) => {
    setConfig(prev => prev.map(c => 
      c.salary_type_id === id ? { ...c, amount: Number(amount) } : c
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/employees/${employee.id}/salary-config`, {
        components: config
      });
      toast.success("Konfigurasi gaji karyawan berhasil disimpan");
      onSave();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-6 bg-muted/30">
          <div>
            <h2 className="text-xl font-bold">Atur Gaji: {employee.profile?.full_name}</h2>
            <p className="text-sm text-muted-foreground">Sesuaikan komponen gaji khusus untuk karyawan ini.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-[200px,1fr] h-[400px]">
          {/* Sidebar: Available Types */}
          <div className="border-r border-border bg-muted/10 p-4 overflow-y-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Pilih Komponen</p>
            <div className="space-y-2">
              {salaryTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleAddComponent(type)}
                  className="w-full flex items-center gap-2 p-3 text-left text-sm font-medium rounded-xl hover:bg-primary/5 hover:text-primary transition border border-transparent hover:border-primary/20"
                >
                  <Plus className="h-4 w-4" />
                  {type.name}
                </button>
              ))}
            </div>
          </div>

          {/* Main: Configured Components */}
          <div className="p-6 overflow-y-auto space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Komponen Aktif</p>
            {config.map(item => (
              <div key={item.salary_type_id} className="group relative rounded-2xl border border-border p-4 bg-white hover:border-primary/30 transition shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">Unit: {item.unit?.replace('_', ' ')}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive opacity-0 group-hover:opacity-100 transition"
                    onClick={() => handleRemoveComponent(item.salary_type_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-primary">Rp</div>
                  <Input
                    type="number"
                    className="pl-10 h-10 rounded-xl bg-muted/30 border-none focus:ring-2 focus:ring-primary"
                    value={item.amount}
                    onChange={(e) => handleUpdateAmount(item.salary_type_id, e.target.value)}
                  />
                </div>
              </div>
            ))}

            {config.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-border rounded-3xl">
                <p className="text-muted-foreground">Belum ada komponen gaji yang dipilih untuk karyawan ini.</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border p-6 bg-muted/30 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>Batal</Button>
          <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Konfigurasi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
