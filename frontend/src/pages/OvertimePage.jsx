import { useCallback, useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDateTimeID, formatDateID, formatRupiah } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export function OvertimePage() {
  const profile = useAuthStore((state) => state.profile);
  const isOwner = profile?.role === "owner";
  
  const [logs, setLogs] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected

  const loadData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      
      const response = await api.get(`/overtime?${params.toString()}`);
      setLogs(response.data);
      
      // Find active session (started but not ended)
      const active = response.data.find(
        log => !log.end_time && log.employee_name === profile?.full_name
      );
      setActiveSession(active || null);
    } catch (error) {
      toast.error(error.message);
    }
  }, [filter, profile?.full_name]);

  // Calculate total earnings and hours
  const stats = {
    totalEarnings: logs
      .filter(log => log.status === "approved")
      .reduce((sum, log) => sum + (log.total_earning || 0), 0),
    pendingEarnings: logs
      .filter(log => log.status === "pending")
      .reduce((sum, log) => sum + (log.total_earning || 0), 0),
    totalHours: logs.reduce((sum, log) => sum + (log.total_hours || 0), 0),
    ratePerHour: logs.length > 0 ? logs[0].rate_per_hour : 0,
    approvedCount: logs.filter(log => log.status === "approved").length,
    pendingCount: logs.filter(log => log.status === "pending").length,
    rejectedCount: logs.filter(log => log.status === "rejected").length,
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const startOvertime = async () => {
    if (!reason.trim()) {
      toast.error("Alasan lembur wajib diisi.");
      return;
    }
    
    setBusy(true);
    try {
      await api.post("/overtime/start", { reason });
      toast.success("Sesi lembur dimulai.");
      setReason("");
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const endOvertime = async () => {
    setBusy(true);
    try {
      await api.post("/overtime/end", {});
      toast.success("Sesi lembur selesai. Menunggu approval.");
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const approveOvertime = async (id, status, notes = "") => {
    setBusy(true);
    try {
      await api.patch(`/overtime/${id}/approve`, { status, notes });
      toast.success(status === "approved" ? "Lembur disetujui." : "Lembur ditolak.");
      await loadData();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { tone: "warning", label: "Pending", icon: AlertCircle },
      approved: { tone: "success", label: "Disetujui", icon: CheckCircle },
      rejected: { tone: "danger", label: "Ditolak", icon: XCircle },
    };
    const { tone, label, icon: Icon } = config[status] || config.pending;
    return (
      <Badge tone={tone}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards - Untuk Karyawan */}
      {!isOwner && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-700">Upah Per Jam</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600">
                {formatRupiah(stats.ratePerHour)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-700">Pendapatan Disetujui</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600">
                {formatRupiah(stats.totalEarnings)}
              </CardTitle>
              <p className="text-xs text-green-600 mt-1">{stats.approvedCount} lembur</p>
            </CardHeader>
          </Card>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-amber-700">Menunggu Approval</CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-600">
                {formatRupiah(stats.pendingEarnings)}
              </CardTitle>
              <p className="text-xs text-amber-600 mt-1">{stats.pendingCount} pending</p>
            </CardHeader>
          </Card>
          <Card className="border-slate-200 bg-slate-50/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-700">Total Jam</CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">
                {stats.totalHours.toFixed(1)} jam
              </CardTitle>
              <p className="text-xs text-slate-600 mt-1">{logs.length} sesi</p>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Owner Stats */}
      {isOwner && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Lembur</CardDescription>
              <CardTitle className="text-2xl">{logs.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-amber-700">Pending</CardDescription>
              <CardTitle className="text-2xl text-amber-600">{stats.pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-700">Disetujui</CardDescription>
              <CardTitle className="text-2xl text-green-600">{stats.approvedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-red-700">Ditolak</CardDescription>
              <CardTitle className="text-2xl text-red-600">{stats.rejectedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Karyawan: Start/End Overtime */}
        {!isOwner && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Absensi Lembur
              </CardTitle>
              <CardDescription>
                Mulai sesi saat mulai lembur, akhiri saat selesai
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSession ? (
                <div className="rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-full bg-green-500 p-2">
                      <Clock className="h-5 w-5 text-white animate-pulse" />
                    </div>
                    <div>
                      <p className="font-bold text-green-900">Sesi Lembur Aktif</p>
                      <p className="text-xs text-green-700">Sedang berjalan</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Mulai:</span>
                      <span className="font-semibold text-green-900">
                        {formatDateTimeID(activeSession.start_time)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-green-700">Alasan:</span>
                      <p className="font-medium text-green-900 mt-1">{activeSession.reason}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={endOvertime} 
                    disabled={busy} 
                    variant="secondary" 
                    className="w-full bg-white hover:bg-green-50 border-green-300"
                  >
                    Selesai Lembur
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-slate-700">
                      Alasan Lembur <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Contoh: Menyelesaikan laporan bulanan, deadline proyek, dll"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <Button 
                    onClick={startOvertime} 
                    disabled={busy || !reason.trim()} 
                    className="w-full"
                    size="lg"
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Mulai Lembur
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Owner: Filter */}
        {isOwner && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Filter Lembur</CardTitle>
              <CardDescription>Kelola pengajuan lembur karyawan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={filter === "all" ? "default" : "outline"}
                  onClick={() => setFilter("all")}
                  className="w-full"
                >
                  Semua ({logs.length})
                </Button>
                <Button
                  size="sm"
                  variant={filter === "pending" ? "default" : "outline"}
                  onClick={() => setFilter("pending")}
                  className="w-full"
                >
                  Pending ({stats.pendingCount})
                </Button>
                <Button
                  size="sm"
                  variant={filter === "approved" ? "default" : "outline"}
                  onClick={() => setFilter("approved")}
                  className="w-full"
                >
                  Disetujui ({stats.approvedCount})
                </Button>
                <Button
                  size="sm"
                  variant={filter === "rejected" ? "default" : "outline"}
                  onClick={() => setFilter("rejected")}
                  className="w-full"
                >
                  Ditolak ({stats.rejectedCount})
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rekap Lembur */}
        <Card className={isOwner ? "lg:col-span-2" : "lg:col-span-2"}>
          <CardHeader>
            <CardTitle>Riwayat Lembur</CardTitle>
            <CardDescription>
              {isOwner 
                ? `Menampilkan ${logs.length} pengajuan lembur` 
                : `Total ${logs.length} sesi lembur Anda`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <THead>
                  <TR>
                    {isOwner && <TH className="min-w-[120px]">Karyawan</TH>}
                    <TH className="min-w-[100px]">Tanggal</TH>
                    <TH>Mulai</TH>
                    <TH>Selesai</TH>
                    <TH>Jam</TH>
                    <TH className="min-w-[120px]">Pendapatan</TH>
                    <TH className="min-w-[150px]">Alasan</TH>
                    <TH>Status</TH>
                    {isOwner && <TH className="min-w-[140px]">Aksi</TH>}
                  </TR>
                </THead>
                <TBody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <TR key={log.id}>
                        {isOwner && <TD className="font-medium">{log.employee_name}</TD>}
                        <TD>{formatDateID(log.date)}</TD>
                        <TD className="font-mono text-sm">
                          {new Date(log.start_time).toLocaleTimeString("id-ID", { 
                            hour: "2-digit", 
                            minute: "2-digit" 
                          })}
                        </TD>
                        <TD className="font-mono text-sm">
                          {log.end_time 
                            ? new Date(log.end_time).toLocaleTimeString("id-ID", { 
                                hour: "2-digit", 
                                minute: "2-digit" 
                              })
                            : <span className="text-slate-400">-</span>}
                        </TD>
                        <TD>
                          {log.total_hours ? (
                            <span className="font-semibold text-slate-900">
                              {log.total_hours} jam
                            </span>
                          ) : <span className="text-slate-400">-</span>}
                        </TD>
                        <TD>
                          {log.total_earning > 0 ? (
                            <div>
                              <span className={`font-bold text-sm ${
                                log.status === 'approved' 
                                  ? 'text-green-600' 
                                  : log.status === 'rejected'
                                  ? 'text-red-500'
                                  : 'text-slate-500'
                              }`}>
                                {formatRupiah(log.total_earning)}
                              </span>
                            </div>
                          ) : <span className="text-slate-400">-</span>}
                        </TD>
                        <TD>
                          <div className="max-w-[200px] truncate text-sm" title={log.reason}>
                            {log.reason}
                          </div>
                        </TD>
                        <TD>{getStatusBadge(log.status)}</TD>
                        {isOwner && (
                          <TD>
                            {log.status === "pending" && log.end_time && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => approveOvertime(log.id, "approved")}
                                  disabled={busy}
                                  className="text-xs"
                                >
                                  ✓ Setuju
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => approveOvertime(log.id, "rejected")}
                                  disabled={busy}
                                  className="text-xs"
                                >
                                  ✗ Tolak
                                </Button>
                              </div>
                            )}
                            {log.status === "pending" && !log.end_time && (
                              <span className="text-xs text-amber-600 font-medium">
                                ⏳ Belum selesai
                              </span>
                            )}
                            {log.status === "approved" && (
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Disetujui
                              </span>
                            )}
                            {log.status === "rejected" && (
                              <span className="text-xs text-red-600 font-medium">
                                ✗ Ditolak
                              </span>
                            )}
                          </TD>
                        )}
                      </TR>
                    ))
                  ) : (
                    <TR>
                      <TD colSpan={isOwner ? 9 : 8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Clock className="h-12 w-12" />
                          <p className="font-medium">Belum ada data lembur</p>
                          <p className="text-sm">
                            {isOwner 
                              ? "Belum ada karyawan yang mengajukan lembur" 
                              : "Mulai sesi lembur untuk mencatat jam kerja tambahan"}
                          </p>
                        </div>
                      </TD>
                    </TR>
                  )}
                </TBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
