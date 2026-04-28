import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDateTimeID, formatRupiah } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export function PayrollPage() {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [periods, setPeriods] = useState([]);
  const [preview, setPreview] = useState([]);
  const [busy, setBusy] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const loadData = async () => {
    try {
      const response = await api.get("/payroll/periods", { month, year });
      setPeriods(response.data.periods);
      setPreview(response.data.details);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [month, year]);

  const isAdmin = ["owner", "manager"].includes(profile?.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Penggajian</h1>
          <p className="text-sm text-muted-foreground">Sistem penggajian otomatis terintegrasi absensi.</p>
        </div>
        {isAdmin && (
          <Button variant="outline" className="gap-2" onClick={() => navigate("/penggajian/pengaturan")}>
            <Settings className="h-4 w-4" />
            Pengaturan Gaji
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proses Payroll</CardTitle>
          <CardDescription>Pilih periode untuk menghitung atau melihat riwayat gaji.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[180px,180px,1fr]">
          <label className="space-y-2">
            <span className="text-sm font-medium">Bulan</span>
            <select
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, index) => String(index + 1)).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Tahun</span>
            <select
              className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {Array.from({ length: 5 }, (_, index) => String(new Date().getFullYear() - 2 + index)).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          {isAdmin ? (
            <div className="flex items-end">
              <Button
                className="w-full md:w-auto"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const response = await api.post("/payroll/process", {
                      month: Number(month),
                      year: Number(year),
                    });
                    setPreview(response.data.details);
                    toast.success("Payroll berhasil dihitung.");
                    await loadData();
                  } catch (error) {
                    toast.error(error.message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Menghitung..." : "Hitung Payroll Periode Ini"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Gaji Karyawan</CardTitle>
          <CardDescription>Klik baris untuk melihat rincian kehadiran dan komponen gaji.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <THead>
              <TR>
                <TH className="w-10"></TH>
                <TH>Karyawan</TH>
                <TH>Total Gaji</TH>
                <TH>Status</TH>
                <TH>Aksi</TH>
              </TR>
            </THead>
            <TBody>
              {preview.map((item) => (
                <>
                  <TR 
                    key={item.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                  >
                    <TD>
                      {expandedRow === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </TD>
                    <TD className="font-medium">{item.employee_name}</TD>
                    <TD className="font-bold text-primary">{formatRupiah(item.net_salary)}</TD>
                    <TD>
                      <Badge tone={item.is_paid ? "success" : "warning"}>
                        {item.is_paid ? "Sudah Dibayar" : "Menunggu"}
                      </Badge>
                    </TD>
                    <TD onClick={(e) => e.stopPropagation()}>
                      {item.is_paid ? (
                        <span className="text-xs text-muted-foreground">{formatDateTimeID(item.paid_at)}</span>
                      ) : profile?.role === "owner" ? (
                        <Button
                          size="sm"
                          onClick={async () => {
                            if (!confirm("Konfirmasi pembayaran gaji ini?")) return;
                            try {
                              await api.post(`/payroll/details/${item.id}/pay`, {});
                              toast.success("Pembayaran berhasil dikonfirmasi.");
                              await loadData();
                            } catch (error) {
                              toast.error(error.message);
                            }
                          }}
                        >
                          Konfirmasi
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TD>
                  </TR>
                  {expandedRow === item.id && (
                    <TR className="bg-muted/30">
                      <TD colSpan={7} className="p-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-bold mb-2 uppercase tracking-wider text-muted-foreground">Rincian Komponen</p>
                            <div className="space-y-2">
                              {item.items?.map((comp) => (
                                <div key={comp.id} className="flex justify-between text-sm border-b border-border/50 pb-1">
                                  <span>{comp.name} ({comp.count} {comp.unit === 'per_jam' ? 'Jam' : 'Kehadiran'})</span>
                                  <span className="font-medium">{formatRupiah(comp.total_amount)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between text-sm font-bold pt-2">
                                <span>Total Kotor</span>
                                <span>{formatRupiah(item.total_allowances)}</span>
                              </div>
                            </div>
                            <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                              <p className="text-xs text-primary font-bold uppercase mb-1">Gaji Bersih Diterima</p>
                              <p className="text-2xl font-bold text-primary">{formatRupiah(item.net_salary)}</p>
                            </div>
                          </div>
                        </div>
                      </TD>
                    </TR>
                  )}
                </>
              ))}
              {preview.length === 0 && (
                <TR>
                  <TD colSpan={5} className="text-center py-12 text-muted-foreground">
                    Belum ada data payroll untuk periode ini.
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
