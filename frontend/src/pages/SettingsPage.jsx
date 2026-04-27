import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/FormField";
import { api } from "@/lib/api";

export function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/settings");
      if (response.data && response.data.data) {
        const data = response.data.data;
        setSettings({
          work_start_time: data.work_start_time || "08:00:00",
          tolerance_minutes: data.tolerance_minutes !== undefined ? data.tolerance_minutes : 15,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      // Use default values if error
      setSettings({
        work_start_time: "08:00:00",
        tolerance_minutes: 15,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (settings.tolerance_minutes < 0) {
        toast.error("Toleransi telat tidak boleh negatif.");
        return;
      }

      // Get current settings first to preserve other fields
      let currentData = {};
      try {
        const currentResponse = await api.get("/settings");
        currentData = currentResponse.data?.data || {};
      } catch (error) {
        console.error("Error loading current settings:", error);
        // Use defaults if can't load current settings
      }

      // Merge with new work time settings, ensure all required fields exist
      const payload = {
        business_name: currentData.business_name || "Bisnis Anda",
        latitude: currentData.latitude !== undefined ? currentData.latitude : 0,
        longitude: currentData.longitude !== undefined ? currentData.longitude : 0,
        attendance_radius_meters: currentData.attendance_radius_meters || 100,
        work_start_time: settings.work_start_time,
        tolerance_minutes: settings.tolerance_minutes,
      };

      await api.put("/settings", payload);
      toast.success("Pengaturan jam kerja berhasil disimpan.");
      
      // Reload settings to ensure we have the latest data
      await loadSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(error.message || "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8 text-slate-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Jam Kerja</h1>
          <p className="text-sm text-slate-600">Atur jam mulai kerja dan toleransi keterlambatan.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Pengaturan Jam Kerja */}
        <Card>
          <CardHeader>
            <CardTitle>Jam Kerja</CardTitle>
            <CardDescription>Tentukan jam mulai kerja dan toleransi keterlambatan karyawan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Jam Mulai Kerja" required>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="08"
                  className="w-20"
                  value={parseInt(settings.work_start_time?.substring(0, 2) || "08")}
                  onChange={(e) => {
                    const hours = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
                    const minutes = settings.work_start_time?.substring(3, 5) || "00";
                    setSettings((prev) => ({ 
                      ...prev, 
                      work_start_time: `${String(hours).padStart(2, "0")}:${minutes}:00` 
                    }));
                  }}
                />
                <span className="text-lg font-medium">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="00"
                  className="w-20"
                  value={parseInt(settings.work_start_time?.substring(3, 5) || "00")}
                  onChange={(e) => {
                    const hours = settings.work_start_time?.substring(0, 2) || "08";
                    const minutes = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                    setSettings((prev) => ({ 
                      ...prev, 
                      work_start_time: `${hours}:${String(minutes).padStart(2, "0")}:00` 
                    }));
                  }}
                />
                <span className="text-sm text-muted-foreground ml-2">
                  (Format 24 jam)
                </span>
              </div>
            </FormField>

            <FormField label="Toleransi Keterlambatan (menit)" required>
              <Input
                type="number"
                min="0"
                placeholder="15"
                value={settings.tolerance_minutes}
                onChange={(e) => setSettings((prev) => ({ ...prev, tolerance_minutes: parseInt(e.target.value) || 0 }))}
              />
            </FormField>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm">
              <p className="font-medium text-blue-900">📋 Contoh Perhitungan:</p>
              <div className="mt-2 space-y-1">
                <p className="text-blue-700">
                  Jam mulai: <strong>{settings.work_start_time?.substring(0, 5) || "08:00"}</strong>
                </p>
                <p className="text-blue-700">
                  Toleransi: <strong>{settings.tolerance_minutes} menit</strong>
                </p>
                <p className="text-blue-700 mt-2">
                  Batas telat:{" "}
                  <strong>
                    {(() => {
                      const [hours, minutes] = (settings.work_start_time?.substring(0, 5) || "08:00").split(":");
                      const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + settings.tolerance_minutes;
                      const newHours = Math.floor(totalMinutes / 60);
                      const newMinutes = totalMinutes % 60;
                      return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(2, "0")}`;
                    })()}
                  </strong>
                </p>
              </div>
              <p className="text-blue-600 text-xs mt-3">
                Karyawan yang check-in setelah batas telat akan tercatat sebagai "Telat".
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>
          </CardContent>
        </Card>

        {/* Informasi & Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi</CardTitle>
            <CardDescription>Panduan penggunaan pengaturan jam kerja.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-medium mb-2 text-slate-900">🕐 Jam Mulai Kerja</p>
              <p className="text-sm text-slate-600">
                Waktu standar dimulainya jam kerja. Digunakan sebagai acuan untuk menentukan status keterlambatan
                karyawan.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-medium mb-2 text-slate-900">⏱️ Toleransi Keterlambatan</p>
              <p className="text-sm text-slate-600">
                Waktu tambahan (dalam menit) setelah jam mulai kerja. Karyawan yang check-in dalam periode toleransi
                masih dianggap "Hadir", bukan "Telat".
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-medium mb-2 text-slate-900">📊 Status Absensi</p>
              <ul className="text-sm text-slate-600 space-y-1 mt-2">
                <li>• <strong>Hadir</strong>: Check-in sebelum batas telat</li>
                <li>• <strong>Telat</strong>: Check-in setelah batas telat</li>
                <li>• <strong>Izin</strong>: Karyawan mengajukan izin</li>
                <li>• <strong>Alpha</strong>: Tidak hadir tanpa keterangan</li>
              </ul>
            </div>

            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="font-medium text-green-900 mb-2">✅ Jam Kerja Saat Ini</p>
              <p className="text-sm text-green-700">
                Jam kerja telah diatur mulai pukul <strong>{settings.work_start_time?.substring(0, 5) || "08:00"}</strong> dengan toleransi keterlambatan <strong>{settings.tolerance_minutes} menit</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
