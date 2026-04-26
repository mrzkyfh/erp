import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDateTimeID, formatRupiah } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export function PayrollPage() {
  const profile = useAuthStore((state) => state.profile);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [periods, setPeriods] = useState([]);
  const [preview, setPreview] = useState([]);
  const [busy, setBusy] = useState(false);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Penggajian Otomatis</CardTitle>
            <CardDescription>Formula: gaji pokok + tunjangan - denda - potongan.</CardDescription>
          </div>
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
          {["owner", "manager"].includes(profile?.role) ? (
            <div className="flex items-end">
              <Button
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
                {busy ? "Menghitung..." : "Proses Payroll"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Preview & Riwayat</CardTitle>
            <CardDescription>Slip gaji akan terlihat oleh karyawan setelah dikonfirmasi.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Karyawan</TH>
                <TH>Gaji Pokok</TH>
                <TH>Tunjangan</TH>
                <TH>Denda</TH>
                <TH>Potongan</TH>
                <TH>Gaji Bersih</TH>
                <TH>Status</TH>
                <TH>Dibayar</TH>
              </TR>
            </THead>
            <TBody>
              {preview.map((item) => (
                <TR key={item.id}>
                  <TD>{item.employee_name}</TD>
                  <TD>{formatRupiah(item.base_salary)}</TD>
                  <TD>{formatRupiah(item.allowance)}</TD>
                  <TD>{formatRupiah(item.total_fines)}</TD>
                  <TD>{formatRupiah(item.deductions)}</TD>
                  <TD className="font-semibold">{formatRupiah(item.net_salary)}</TD>
                  <TD>
                    <Badge tone={item.is_paid ? "success" : "warning"}>{item.is_paid ? "Dibayar" : "Menunggu"}</Badge>
                  </TD>
                  <TD>
                    {item.paid_at ? (
                      formatDateTimeID(item.paid_at)
                    ) : profile?.role === "owner" ? (
                      <Button
                        size="sm"
                        onClick={async () => {
                          try {
                            await api.post(`/payroll/details/${item.id}/pay`, {});
                            toast.success("Pembayaran payroll dikonfirmasi.");
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
              ))}
            </TBody>
          </Table>
          {profile?.role === "karyawan" && !preview.length ? (
            <p className="mt-4 text-sm text-muted-foreground">Slip gaji akan muncul setelah owner mengonfirmasi pembayaran.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Periode Payroll</CardTitle>
            <CardDescription>Status pemrosesan payroll per bulan.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {periods.map((period) => (
            <div key={period.id} className="rounded-2xl border border-border bg-white p-4">
              <p className="font-medium">
                {period.month}/{period.year}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Status: {period.status}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Diproses {period.processed_at ? formatDateTimeID(period.processed_at) : "-"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

