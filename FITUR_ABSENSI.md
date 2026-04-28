# 📋 Dokumentasi Fitur Absensi

## 🎯 Overview

Fitur Absensi adalah sistem pencatatan kehadiran karyawan berbasis **QR Code** dengan integrasi real-time dan otomatis terhubung ke sistem penggajian. Sistem ini mendukung check-in, check-out, pengajuan izin, dan deteksi keterlambatan otomatis.

---

## 🏗️ Arsitektur Sistem

### **Database Schema**

#### 1. **business_settings**
Menyimpan konfigurasi bisnis untuk absensi:
```sql
- work_start_time: time (default: 08:00:00)
- tolerance_minutes: integer (default: 15 menit)
- attendance_radius_meters: integer (default: 100m)
- latitude, longitude: numeric (lokasi kantor)
- timezone: text (default: Asia/Jakarta)
```

#### 2. **attendance_sessions**
Sesi QR code harian untuk absensi:
```sql
- id: uuid (primary key)
- date: date (tanggal sesi)
- qr_token: uuid (token unik untuk scan)
- expires_at: timestamptz (berlaku 24 jam)
- created_by: uuid (owner/manager yang membuat)
```

#### 3. **attendance_logs**
Catatan absensi karyawan:
```sql
- id: uuid (primary key)
- employee_id: uuid (referensi ke employees)
- session_id: uuid (referensi ke attendance_sessions)
- check_in_at: timestamptz (waktu masuk)
- check_out_at: timestamptz (waktu keluar)
- status: enum ('hadir', 'telat', 'izin', 'alpha')
- permission_reason: text (alasan izin)
- latitude, longitude: numeric (lokasi absen)
- distance_meters: numeric (jarak dari kantor)
```

#### 4. **fine_types**
Jenis denda otomatis:
```sql
- name: text (nama denda)
- amount: numeric (nominal denda)
- is_auto: boolean (otomatis atau manual)
- trigger_type: text ('late', 'alpha', 'sop')
```

#### 5. **employee_fines**
Catatan denda karyawan:
```sql
- employee_id: uuid
- fine_type_id: uuid
- amount: numeric
- reason: text
- date: date
```

---

## 🔄 Alur Kerja (Workflow)

### **A. Owner/Manager**

#### 1. **Membuat Sesi QR Harian**
```
Owner → Klik "Buat QR" → Backend generate UUID token → 
QR Code ditampilkan (berlaku 24 jam)
```

**Backend Logic:**
```javascript
// backend/src/services/attendance-service.js
export async function generateAttendanceSession(createdBy) {
  const { data } = await supabaseAdmin
    .from("attendance_sessions")
    .insert({
      date: todayDate(),
      qr_token: randomUUID(),
      expires_at: nowJakarta().add(24, "hour").toISOString(),
      created_by: createdBy,
    })
    .select("*")
    .single();
  return data;
}
```

#### 2. **Melihat Rekap Absensi**
- Owner bisa melihat **semua karyawan**
- Karyawan hanya bisa melihat **absensi sendiri**

---

### **B. Karyawan**

#### 1. **Check-in (Masuk)**
```
Karyawan → Scan QR / Input Token → Backend validasi → 
Cek keterlambatan → Simpan log + auto denda (jika telat)
```

**Backend Logic:**
```javascript
export async function checkInAttendance(profile, payload) {
  const employee = await getEmployeeByProfileId(profile.id);
  const settings = await getBusinessSettings();
  const session = await findActiveSession(payload.qr_token);
  
  // Cek apakah sudah check-in hari ini
  const existingLog = await supabaseAdmin
    .from("attendance_logs")
    .select("id")
    .eq("employee_id", employee.id)
    .gte("check_in_at", nowJakarta().startOf("day").toISOString())
    .lte("check_in_at", nowJakarta().endOf("day").toISOString())
    .maybeSingle();

  if (existingLog) {
    throw new AppError("Anda sudah melakukan check-in hari ini.", 409);
  }

  // Deteksi keterlambatan
  const status = isLate(
    currentTime, 
    settings.work_start_time, 
    settings.tolerance_minutes
  ) ? "telat" : "hadir";

  // Simpan log
  const { data } = await supabaseAdmin
    .from("attendance_logs")
    .insert({
      employee_id: employee.id,
      session_id: session.id,
      check_in_at: currentTime,
      status,
    })
    .select("*")
    .single();

  // Auto denda jika telat
  if (status === "telat") {
    await createAutoFine(employee.id, "late");
  }

  return data;
}
```

**Logika Keterlambatan:**
```javascript
// backend/src/utils/time.js
export function isLate(checkInTime, workStartTime, toleranceMinutes) {
  const checkIn = dayjs(checkInTime);
  const [hour, minute] = workStartTime.split(":");
  const workStart = checkIn.hour(hour).minute(minute).second(0);
  const toleranceEnd = workStart.add(toleranceMinutes, "minute");
  
  return checkIn.isAfter(toleranceEnd);
}
```

**Contoh:**
- Jam kerja: 08:00
- Toleransi: 15 menit
- Check-in 08:16 → **TELAT** → Auto denda Rp 10.000

#### 2. **Check-out (Pulang)**
```
Karyawan → Klik "Check-out" → Backend cari log check-in hari ini → 
Update check_out_at
```

**Backend Logic:**
```javascript
export async function checkOutAttendance(profile) {
  const employee = await getEmployeeByProfileId(profile.id);
  
  // Cari log check-in hari ini yang belum check-out
  const { data: log } = await supabaseAdmin
    .from("attendance_logs")
    .select("*")
    .eq("employee_id", employee.id)
    .gte("check_in_at", nowJakarta().startOf("day").toISOString())
    .is("check_out_at", null)
    .single();

  if (!log) {
    throw new AppError("Check-in hari ini belum ditemukan.", 404);
  }

  // Update check-out
  const { data } = await supabaseAdmin
    .from("attendance_logs")
    .update({ check_out_at: nowJakarta().toISOString() })
    .eq("id", log.id)
    .select("*")
    .single();

  return data;
}
```

#### 3. **Ajukan Izin**
```
Karyawan → Klik "Ajukan Izin" → Backend buat log dengan status "izin"
```

**Backend Logic:**
```javascript
export async function submitPermission(profile, payload) {
  const employee = await getEmployeeByProfileId(profile.id);
  
  const { data } = await supabaseAdmin
    .from("attendance_logs")
    .insert({
      employee_id: employee.id,
      check_in_at: nowJakarta().toISOString(),
      status: "izin",
      permission_reason: payload.reason,
    })
    .select("*")
    .single();

  return data;
}
```

---

## 🔗 Integrasi dengan Sistem Lain

### **1. Integrasi dengan Penggajian (Payroll)**

Absensi **langsung mempengaruhi** perhitungan gaji karyawan:

#### **A. Perhitungan Kehadiran**
```javascript
// backend/src/services/payroll-service.js
export async function processPayroll(month, year, processedBy) {
  // 1. Ambil semua karyawan aktif
  const { data: employees } = await supabaseAdmin
    .from("employees")
    .select("*")
    .eq("status", "aktif");

  for (const employee of employees) {
    // 2. Hitung jumlah kehadiran bulan ini
    const { data: attendanceLogs } = await supabaseAdmin
      .from("attendance_logs")
      .select("check_in_at, check_out_at")
      .eq("employee_id", employee.id)
      .in("status", ["hadir", "telat"])  // Izin & alpha tidak dihitung
      .gte("check_in_at", range.start)
      .lte("check_in_at", range.end);

    const attendancesCount = attendanceLogs.length;
    
    // 3. Hitung total jam kerja
    let totalHours = 0;
    attendanceLogs.forEach(log => {
      if (log.check_in_at && log.check_out_at) {
        const diffMs = new Date(log.check_out_at) - new Date(log.check_in_at);
        const diffHours = diffMs / (1000 * 60 * 60);
        totalHours += Math.max(0, diffHours);
      }
    });

    // 4. Hitung gaji berdasarkan komponen
    const { data: salaryComponents } = await supabaseAdmin
      .from("employee_salary_components")
      .select("*, salary_types(*)")
      .eq("employee_id", employee.id);

    let totalAllowances = 0;

    for (const component of salaryComponents) {
      let totalAmount = 0;

      if (component.salary_types.unit === 'per_kehadiran') {
        // Gaji per kehadiran: Rp 50.000 x 22 hari = Rp 1.100.000
        totalAmount = component.amount * attendancesCount;
      } else if (component.salary_types.unit === 'per_jam') {
        // Gaji per jam: Rp 20.000 x 176 jam = Rp 3.520.000
        totalAmount = component.amount * totalHours;
      } else {
        // Gaji tetap bulanan: Rp 3.000.000
        totalAmount = component.amount;
      }

      totalAllowances += totalAmount;
    }

    // 5. Kurangi denda
    const deductions = employee.default_deduction || 0;
    const netSalary = totalAllowances - deductions;

    // 6. Simpan detail payroll
    await supabaseAdmin.from("payroll_details").upsert({
      period_id: period.id,
      employee_id: employee.id,
      total_allowances: totalAllowances,
      deductions,
      net_salary: netSalary,
    });
  }
}
```

**Contoh Perhitungan:**

**Karyawan A (Gaji Harian):**
- Komponen: Gaji Harian Rp 100.000 (per_kehadiran)
- Kehadiran Januari: 22 hari (hadir + telat)
- Denda telat: 3x @ Rp 10.000 = Rp 30.000
- **Gaji bersih:** (22 × Rp 100.000) - Rp 30.000 = **Rp 2.170.000**

**Karyawan B (Gaji Per Jam):**
- Komponen: Upah Per Jam Rp 25.000 (per_jam)
- Total jam kerja Januari: 176 jam
- Denda: Rp 0
- **Gaji bersih:** 176 × Rp 25.000 = **Rp 4.400.000**

**Karyawan C (Gaji Bulanan):**
- Komponen: Gaji Pokok Rp 5.000.000 (bulanan)
- Kehadiran tidak mempengaruhi (tetap dibayar penuh)
- Denda: Rp 0
- **Gaji bersih:** **Rp 5.000.000**

#### **B. Denda Otomatis**
Denda dari keterlambatan **langsung masuk** ke `employee_fines` dan **dikurangkan** dari gaji:

```javascript
async function createAutoFine(employeeId, triggerType) {
  // Cari jenis denda otomatis
  const { data: fineType } = await supabaseAdmin
    .from("fine_types")
    .select("*")
    .eq("trigger_type", triggerType)
    .eq("is_auto", true)
    .single();

  if (!fineType) return;

  // Buat denda
  await supabaseAdmin.from("employee_fines").insert({
    employee_id: employeeId,
    fine_type_id: fineType.id,
    amount: fineType.amount,
    reason: `Denda otomatis: ${fineType.name}`,
    date: todayDate(),
  });
}
```

---

### **2. Real-time Updates**

Menggunakan **Supabase Realtime** untuk update otomatis tanpa refresh:

```javascript
// frontend/src/hooks/useRealtimeAttendance.js
export function useRealtimeAttendance(onReceive) {
  useEffect(() => {
    const channel = supabase
      .channel("attendance-live")
      .on(
        "postgres_changes",
        {
          event: "*",  // INSERT, UPDATE, DELETE
          schema: "public",
          table: "attendance_logs",
        },
        (payload) => onReceive?.(payload),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onReceive]);
}
```

**Cara Kerja:**
1. Karyawan A check-in → Database insert log baru
2. Supabase broadcast event ke semua client yang subscribe
3. Owner/Manager melihat **update langsung** di tabel rekap absensi

---

### **3. Integrasi dengan Dashboard**

Dashboard menampilkan statistik absensi real-time:

```javascript
// backend/src/services/dashboard-service.js
export async function getDashboardStats() {
  // Hitung kehadiran hari ini
  const { data: todayAttendance } = await supabaseAdmin
    .from("attendance_logs")
    .select("status")
    .gte("check_in_at", nowJakarta().startOf("day").toISOString())
    .lte("check_in_at", nowJakarta().endOf("day").toISOString());

  const stats = {
    hadir: todayAttendance.filter(a => a.status === "hadir").length,
    telat: todayAttendance.filter(a => a.status === "telat").length,
    izin: todayAttendance.filter(a => a.status === "izin").length,
    alpha: todayAttendance.filter(a => a.status === "alpha").length,
  };

  return stats;
}
```

---

## 🔐 Security & Permissions

### **Row Level Security (RLS)**

#### 1. **attendance_sessions**
```sql
-- Semua user bisa lihat sesi yang masih aktif
CREATE POLICY "attendance_sessions_select" ON attendance_sessions
FOR SELECT USING (
  is_manager_or_owner() OR expires_at >= now()
);

-- Hanya owner/manager bisa buat sesi
CREATE POLICY "attendance_sessions_manage" ON attendance_sessions
FOR ALL USING (is_manager_or_owner());
```

#### 2. **attendance_logs**
```sql
-- Karyawan hanya bisa lihat log sendiri, owner/manager lihat semua
CREATE POLICY "attendance_logs_select" ON attendance_logs
FOR SELECT USING (
  is_manager_or_owner() OR employee_id = current_employee_id()
);

-- Karyawan bisa insert log sendiri
CREATE POLICY "attendance_logs_insert" ON attendance_logs
FOR INSERT WITH CHECK (
  is_manager_or_owner() OR employee_id = current_employee_id()
);
```

---

## 📱 Frontend Components

### **AttendancePage.jsx**

**Fitur untuk Owner:**
- ✅ Buat sesi QR baru
- ✅ Lihat QR code aktif
- ✅ Lihat rekap absensi semua karyawan
- ✅ Real-time update

**Fitur untuk Karyawan:**
- ✅ Lihat QR code aktif (dibuat owner)
- ✅ Input token manual untuk check-in
- ✅ Check-in / Check-out
- ✅ Ajukan izin
- ✅ Lihat riwayat absensi sendiri

---

## 🚀 API Endpoints

### **Backend Routes**

```javascript
// backend/src/routes/attendance-routes.js
router.get("/sessions/active", activeSessions);        // GET semua sesi aktif
router.post("/sessions", createSession);               // POST buat sesi baru (owner only)
router.get("/logs", attendanceLogs);                   // GET rekap absensi
router.post("/check-in", checkIn);                     // POST check-in
router.post("/check-out", checkOut);                   // POST check-out
router.post("/permission", permission);                // POST ajukan izin
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Owner     │
│  (Manager)  │
└──────┬──────┘
       │
       │ 1. Buat QR Session
       ▼
┌─────────────────────┐
│ attendance_sessions │
│  - qr_token: UUID   │
│  - expires_at: +24h │
└──────┬──────────────┘
       │
       │ 2. QR ditampilkan
       ▼
┌─────────────┐
│  Karyawan   │
│  (Scan QR)  │
└──────┬──────┘
       │
       │ 3. Check-in dengan token
       ▼
┌─────────────────────┐
│ Backend Validation  │
│  - Cek sesi aktif?  │
│  - Sudah check-in?  │
│  - Telat?           │
└──────┬──────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│ attendance_  │  │ employee_    │
│ logs         │  │ fines        │
│ (status:     │  │ (jika telat) │
│  hadir/telat)│  └──────────────┘
└──────┬───────┘
       │
       │ 4. Real-time broadcast
       ▼
┌─────────────┐
│  Dashboard  │
│  & Payroll  │
└─────────────┘
```

---

## 🎯 Kesimpulan

**Fitur Absensi terintegrasi dengan:**

1. ✅ **Payroll System** → Kehadiran mempengaruhi gaji (per hari/jam/bulan)
2. ✅ **Fine System** → Denda otomatis untuk keterlambatan
3. ✅ **Dashboard** → Statistik kehadiran real-time
4. ✅ **Real-time Updates** → Supabase Realtime untuk update langsung
5. ✅ **Role-based Access** → Owner lihat semua, karyawan lihat sendiri
6. ✅ **QR Code System** → Absensi cepat dan aman dengan token 24 jam

**Teknologi yang digunakan:**
- Backend: Node.js + Hono + Supabase
- Frontend: React + Vite + TailwindCSS
- Database: PostgreSQL (Supabase)
- Real-time: Supabase Realtime (WebSocket)
- QR Code: qrcode.react
