import { useEffect, useState } from "react";
import { BriefcaseBusiness, CircleDollarSign, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDateID, formatRupiah, getRoleLabel } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

const icons = [Users, ShieldCheck, CircleDollarSign, BriefcaseBusiness];

export function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await api.get("/dashboard/summary");
        setSummary(response.data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  const cards = [
    {
      label: "Karyawan Aktif",
      value: summary?.employeesActive ?? 0,
      note: "Total tim yang masih aktif",
    },
    {
      label: "Hadir Hari Ini",
      value: summary?.presentToday ?? 0,
      note: "Termasuk karyawan yang telat",
    },
    {
      label: "Payroll Bulan Ini",
      value: formatRupiah(summary?.payrollThisMonth ?? 0),
      note: "Estimasi gaji bersih berjalan",
    },
    {
      label: "Item Stok Minimum",
      value: summary?.lowStockItems ?? 0,
      note: "Perlu pembelian ulang",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-slate-900 text-white">
        <CardContent className="grid gap-5 p-6 md:grid-cols-[1.2fr,0.8fr]">
          <div>
            <Badge className="bg-white/10 text-white">Role aktif: {getRoleLabel(profile?.role)}</Badge>
            <h3 className="mt-4 text-3xl font-bold">
              Selamat datang, {profile?.full_name?.split(" ")[0] || "Pengguna"}.
            </h3>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Ringkasan cepat</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Periode payroll aktif</span>
                <span>{summary?.currentPeriod || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>Check-in terakhir</span>
                <span>{summary?.lastAttendance ? formatDateID(summary.lastAttendance, "dd/MM/yyyy HH:mm") : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>Pengaturan lokasi</span>
                <span>{summary?.businessRadius || 100} meter</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = icons[index];
          return (
            <Card key={card.label}>
              <CardContent className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <h4 className="mt-3 text-3xl font-bold">{loading ? "..." : card.value}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{card.note}</p>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Absensi Hari Ini</CardTitle>
              <CardDescription>Pergerakan absensi terbaru yang masuk secara realtime.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(summary?.latestAttendances ?? []).length ? (
              summary.latestAttendances.map((log) => (
                <div key={log.id} className="rounded-2xl border border-border bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{log.employee_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Check-in {formatDateID(log.check_in_at, "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <Badge tone={log.status === "telat" ? "warning" : "success"}>{log.status}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada data absensi hari ini.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Fokus Operasional</CardTitle>
              <CardDescription>Daftar item yang perlu perhatian dalam waktu dekat.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(summary?.alerts ?? []).length ? (
              summary.alerts.map((alert) => (
                <div key={alert.title} className="rounded-2xl border border-border bg-white p-4">
                  <p className="font-medium">{alert.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Tidak ada alert prioritas tinggi saat ini.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

