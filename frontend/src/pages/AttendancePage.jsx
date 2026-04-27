import { useCallback, useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDateTimeID, getStatusBadgeTone } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useRealtimeAttendance } from "@/hooks/useRealtimeAttendance";

export function AttendancePage() {
  const profile = useAuthStore((state) => state.profile);
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [qrToken, setQrToken] = useState("");
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [logsResponse, sessionsResponse] = await Promise.all([
        api.get("/attendance/logs"),
        api.get("/attendance/sessions/active"),
      ]);
      setLogs(logsResponse.data);
      setSessions(sessionsResponse.data);
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useRealtimeAttendance(() => {
    loadData();
  });


  const createSession = async () => {
    setBusy(true);
    try {
      const response = await api.post("/attendance/sessions", {});
      toast.success("Sesi absensi baru berhasil dibuat.");
      setQrToken(response.data.qr_token);
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const runAttendance = async (type) => {
    setBusy(true);
    try {
      const payload = {};
      if (type === "check-in") {
        payload.qr_token = qrToken || (sessions && sessions.length > 0 ? sessions[0].qr_token : null);
      }
      
      await api.post(`/attendance/${type}`, payload);
      toast.success(type === "check-in" ? "Check-in berhasil." : "Check-out berhasil.");
      setQrToken("");
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };


  const submitPermission = async () => {
    setBusy(true);
    try {
      await api.post("/attendance/permission", {
        status: "izin",
        reason: "Pengajuan izin dari aplikasi.",
      });
      toast.success("Pengajuan izin berhasil dikirim.");
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Absensi Berbasis QR</CardTitle>
              <CardDescription>
                Sesi QR aktif berlaku 24 jam. Karyawan dapat absen dengan scan QR atau token.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* QR Code Display - Visible to all roles */}
            <div className="rounded-3xl border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">QR Absensi Harian</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.role === "owner"
                      ? "Buat sesi absensi baru untuk hari ini jika belum ada."
                      : "Scan QR code untuk absensi atau gunakan token manual."}
                  </p>
                </div>
                {profile?.role === "owner" && (
                  <Button onClick={createSession} disabled={busy}>
                    <QrCode className="h-4 w-4" />
                    Buat QR
                  </Button>
                )}
              </div>
              {sessions[0] ? (
                <div className="mt-4 flex flex-col items-center gap-3 rounded-3xl bg-muted p-4">
                  <QRCodeSVG value={sessions[0].qr_token} size={200} />
                  <p className="text-center text-sm">
                    Token: <span className="font-semibold">{sessions[0].qr_token}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Berlaku sampai {formatDateTimeID(sessions[0].expires_at)}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-3xl bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {profile?.role === "owner"
                      ? "Belum ada sesi QR. Klik 'Buat QR' untuk membuat sesi baru."
                      : "Menunggu manager membuat sesi QR untuk hari ini."}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3 rounded-3xl border border-border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Absensi Mandiri</p>
                  <p className="text-sm text-muted-foreground">Isi token QR jika scan belum terhubung langsung.</p>
                </div>
              </div>
              <Input
                placeholder="Tempel token QR di sini"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => runAttendance("check-in")} disabled={busy}>
                  Check-in
                </Button>
                <Button variant="secondary" onClick={() => runAttendance("check-out")} disabled={busy}>
                  Check-out
                </Button>
                <Button variant="outline" onClick={submitPermission} disabled={busy}>
                  Ajukan Izin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Rekap Absensi</CardTitle>
              <CardDescription>Daftar check-in, check-out, dan status keterlambatan terbaru.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>Karyawan</TH>
                  <TH>Masuk</TH>
                  <TH>Keluar</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {logs.map((log) => (
                  <TR key={log.id}>
                    <TD>{log.employee_name}</TD>
                    <TD>{formatDateTimeID(log.check_in_at)}</TD>
                    <TD>{formatDateTimeID(log.check_out_at)}</TD>
                    <TD>
                      <Badge tone={getStatusBadgeTone(log.status)}>{log.status}</Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

