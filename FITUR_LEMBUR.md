# 📋 Dokumentasi Fitur Lembur (Overtime)

## 🎯 Overview

Fitur Lembur adalah sistem pencatatan jam kerja lembur yang **terpisah** dari absensi reguler. Sistem ini mendukung:
- ✅ Check-in/check-out lembur oleh karyawan
- ✅ Approval/rejection oleh owner/manager
- ✅ Perhitungan otomatis jam lembur
- ✅ Integrasi dengan payroll (upah lembur terpisah)

---

## 🆚 Perbedaan Absensi Reguler vs Lembur

| Aspek | Absensi Reguler | Lembur |
|-------|----------------|--------|
| **Tujuan** | Catat kehadiran harian | Catat jam kerja tambahan |
| **QR Code** | Ya (owner buat sesi) | Tidak (langsung start/end) |
| **Approval** | Otomatis | Perlu approval owner |
| **Perhitungan** | Per hari hadir / per jam kerja | Per jam lembur approved |
| **Denda** | Ada (jika telat) | Tidak ada |
| **Status** | hadir, telat, izin, alpha | pending, approved, rejected |

---

## 🏗️ Arsitektur Sistem

### **Database Schema**

#### **overtime_logs**
```sql
- id: uuid (primary key)
- employee_id: uuid (referensi ke employees)
- date: date (tanggal lembur)
- start_time: timestamptz (waktu mulai lembur)
- end_time: timestamptz (waktu selesai lembur)
- total_hours: numeric(10,2) (total jam, dihitung otomatis)
- reason: text (alasan lembur)
- approved_by: uuid (owner/manager yang approve)
- approved_at: timestamptz (waktu approval)
- status: text (pending, approved, rejected)
- notes: text (catatan dari approver)
```

#### **salary_types (updated)**
Ditambahkan unit baru: `per_jam_lembur`
```sql
- unit: enum ('per_kehadiran', 'per_jam', 'per_jam_lembur', 'fixed')
```

**Contoh data:**
```sql
INSERT INTO salary_types (name, amount, unit) VALUES
('Uang Lembur', 10000, 'per_jam_lembur');
```

---

## 🔄 Alur Kerja (Workflow)

### **A. Karyawan**

#### 1. **Mulai Lembur**
```
Karyawan → Isi alasan lembur → Klik "Mulai Lembur" → 
Backend catat start_time → Status: pending
```

**Backend Logic:**
```javascript
export async function startOvertime(profile, payload) {
  const employee = await getEmployeeByProfileId(profile.id);

  // Cek apakah sudah ada sesi lembur aktif hari ini
  const { data: activeOvertime } = await supabaseAdmin
    .from("overtime_logs")
    .select("id")
    .eq("employee_id", employee.id)
    .eq("date", todayDate())
    .is("end_time", null)
    .maybeSingle();

  if (activeOvertime) {
    throw new AppError("Anda masih memiliki sesi lembur aktif.", 409);
  }

  // Buat log lembur baru
  const { data } = await supabaseAdmin
    .from("overtime_logs")
    .insert({
      employee_id: employee.id,
      date: todayDate(),
      start_time: nowJakarta().toISOString(),
      reason: payload.reason || "Lembur",
      status: "pending",
    })
    .select("*")
    .single();

  return data;
}
```

#### 2. **Selesai Lembur**
```
Karyawan → Klik "Selesai Lembur" → 
Backend catat end_time → Hitung total_hours → 
Menunggu approval owner
```

**Backend Logic:**
```javascript
export async function endOvertime(profile) {
  const employee = await getEmployeeByProfileId(profile.id);

  // Cari sesi lembur aktif
  const { data: overtime } = await supabaseAdmin
    .from("overtime_logs")
    .select("*")
    .eq("employee_id", employee.id)
    .eq("date", todayDate())
    .is("end_time", null)
    .single();

  if (!overtime) {
    throw new AppError("Sesi lembur aktif tidak ditemukan.", 404);
  }

  const endTime = nowJakarta().toISOString();
  const startTime = new Date(overtime.start_time);
  const endTimeDate = new Date(endTime);
  
  // Hitung total jam
  const diffMs = endTimeDate - startTime;
  const totalHours = Math.max(0, diffMs / (1000 * 60 * 60));
  const roundedHours = Math.round(totalHours * 100) / 100;

  // Update log
  const { data } = await supabaseAdmin
    .from("overtime_logs")
    .update({
      end_time: endTime,
      total_hours: roundedHours,
    })
    .eq("id", overtime.id)
    .select("*")
    .single();

  return data;
}
```

**Contoh Perhitungan:**
- Mulai: 18:00
- Selesai: 20:30
- Total: 2.5 jam
- Upah Rp 10.000/jam → **Rp 25.000** (jika approved)

---

### **B. Owner/Manager**

#### 1. **Lihat Pengajuan Lembur**
Owner bisa filter berdasarkan status:
- **Pending** → Belum di-review
- **Approved** → Sudah disetujui (masuk payroll)
- **Rejected** → Ditolak (tidak masuk payroll)

#### 2. **Approve/Reject Lembur**
```
Owner → Lihat detail lembur → Klik "Setuju" atau "Tolak" → 
Backend update status + approved_by + approved_at
```

**Backend Logic:**
```javascript
export async function approveOvertime(profile, overtimeId, payload) {
  if (profile.role !== "owner" && profile.role !== "manager") {
    throw new AppError("Hanya owner/manager yang bisa approve.", 403);
  }

  const { data } = await supabaseAdmin
    .from("overtime_logs")
    .update({
      status: payload.status, // 'approved' or 'rejected'
      approved_by: profile.id,
      approved_at: nowJakarta().toISOString(),
      notes: payload.notes,
    })
    .eq("id", overtimeId)
    .select("*")
    .single();

  return data;
}
```

---

## 🔗 Integrasi dengan Payroll

### **Perhitungan Upah Lembur**

Lembur **hanya dihitung jika status = 'approved'**:

```javascript
// backend/src/services/payroll-service.js
export async function processPayroll(month, year, processedBy) {
  for (const employee of employees) {
    // 1. Hitung jam lembur yang approved
    const { data: overtimeLogs } = await supabaseAdmin
      .from("overtime_logs")
      .select("total_hours")
      .eq("employee_id", employee.id)
      .eq("status", "approved") // ⚠️ Hanya yang approved
      .gte("date", range.start.split('T')[0])
      .lte("date", range.end.split('T')[0]);

    const totalOvertimeHours = overtimeLogs.reduce(
      (sum, log) => sum + Number(log.total_hours || 0), 
      0
    );
    const roundedOvertimeHours = Math.round(totalOvertimeHours * 100) / 100;

    // 2. Hitung komponen gaji
    for (const type of salaryComponents) {
      if (type.unit === 'per_jam_lembur') {
        // Komponen khusus lembur
        count = roundedOvertimeHours;
        totalAmount = Number(type.amount) * count;
      }
      // ... komponen lain
    }
  }
}
```

**Contoh Perhitungan Gaji:**

**Karyawan A - Januari 2025:**
- Gaji Pokok: Rp 3.000.000 (fixed)
- Uang Makan: Rp 15.000 × 22 hari = Rp 330.000
- **Lembur Approved:**
  - Tanggal 5: 2 jam
  - Tanggal 12: 3.5 jam
  - Tanggal 20: 1.5 jam
  - **Total: 7 jam**
- Upah Lembur: Rp 10.000/jam × 7 jam = **Rp 70.000**

**Total Gaji:** Rp 3.000.000 + Rp 330.000 + Rp 70.000 = **Rp 3.400.000**

---

## 📊 Contoh Skenario

### **Skenario 1: Lembur Disetujui**
1. **Senin, 18:00** → Karyawan A mulai lembur (alasan: "Menyelesaikan laporan")
2. **Senin, 21:00** → Karyawan A selesai lembur (3 jam)
3. **Selasa, 09:00** → Owner approve lembur
4. **Akhir bulan** → Payroll dihitung: 3 jam × Rp 10.000 = **Rp 30.000 masuk gaji**

### **Skenario 2: Lembur Ditolak**
1. **Rabu, 17:00** → Karyawan B mulai lembur (alasan: "Lembur")
2. **Rabu, 18:00** → Karyawan B selesai lembur (1 jam)
3. **Kamis, 10:00** → Owner reject lembur (notes: "Tidak ada pekerjaan urgent")
4. **Akhir bulan** → Payroll dihitung: **Rp 0** (tidak masuk gaji)

### **Skenario 3: Lembur Pending**
1. **Jumat, 19:00** → Karyawan C mulai lembur
2. **Jumat, 22:00** → Karyawan C selesai lembur (3 jam)
3. **Akhir bulan** → Owner belum review
4. **Payroll** → **Rp 0** (pending tidak dihitung, harus approved dulu)

---

## 🔐 Security & Permissions

### **Row Level Security (RLS)**

```sql
-- Karyawan hanya bisa lihat log sendiri, owner/manager lihat semua
CREATE POLICY "overtime_logs_select" ON overtime_logs
FOR SELECT USING (
  is_manager_or_owner() OR employee_id = current_employee_id()
);

-- Karyawan bisa insert log sendiri
CREATE POLICY "overtime_logs_insert" ON overtime_logs
FOR INSERT WITH CHECK (
  is_manager_or_owner() OR employee_id = current_employee_id()
);

-- Karyawan bisa update log sendiri (untuk end overtime)
CREATE POLICY "overtime_logs_update" ON overtime_logs
FOR UPDATE USING (
  is_manager_or_owner() OR employee_id = current_employee_id()
);

-- Hanya owner bisa delete
CREATE POLICY "overtime_logs_delete_owner" ON overtime_logs
FOR DELETE USING (is_owner());
```

---

## 🚀 API Endpoints

```javascript
// GET /api/overtime
// Query params: ?status=pending&startDate=2025-01-01&endDate=2025-01-31
// Response: Array of overtime logs

// POST /api/overtime/start
// Body: { reason: "Menyelesaikan laporan" }
// Response: Created overtime log

// POST /api/overtime/end
// Body: {}
// Response: Updated overtime log with total_hours

// POST /api/overtime/manual (owner only)
// Body: { employee_id, date, start_time, end_time, reason }
// Response: Created overtime log

// PATCH /api/overtime/:id/approve (owner only)
// Body: { status: "approved" | "rejected", notes: "..." }
// Response: Updated overtime log

// DELETE /api/overtime/:id (owner only)
// Response: { success: true }
```

---

## 📱 Frontend Components

### **OvertimePage.jsx**

**Fitur untuk Karyawan:**
- ✅ Form mulai lembur (dengan alasan)
- ✅ Indikator sesi aktif (animasi pulse)
- ✅ Tombol selesai lembur
- ✅ Riwayat lembur sendiri dengan status

**Fitur untuk Owner:**
- ✅ Filter by status (all, pending, approved, rejected)
- ✅ Tabel semua lembur karyawan
- ✅ Tombol approve/reject untuk pending
- ✅ Lihat detail jam, alasan, dan approver

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│  Karyawan   │
└──────┬──────┘
       │
       │ 1. Mulai Lembur (reason)
       ▼
┌─────────────────────┐
│ overtime_logs       │
│  - start_time: now  │
│  - status: pending  │
│  - end_time: null   │
└──────┬──────────────┘
       │
       │ 2. Selesai Lembur
       ▼
┌─────────────────────┐
│ overtime_logs       │
│  - end_time: now    │
│  - total_hours: 2.5 │
│  - status: pending  │
└──────┬──────────────┘
       │
       │ 3. Owner Review
       ▼
┌─────────────┐
│   Owner     │
│  (Approve)  │
└──────┬──────┘
       │
       │ 4. Update status
       ▼
┌─────────────────────┐
│ overtime_logs       │
│  - status: approved │
│  - approved_by: ... │
│  - approved_at: now │
└──────┬──────────────┘
       │
       │ 5. Payroll Process
       ▼
┌─────────────────────┐
│ payroll_items       │
│  - name: Uang Lembur│
│  - count: 2.5 jam   │
│  - total: Rp 25.000 │
└─────────────────────┘
```

---

## 🎯 Kesimpulan

**Fitur Lembur:**

1. ✅ **Terpisah dari absensi reguler** → Tidak pakai QR, langsung start/end
2. ✅ **Approval system** → Owner harus approve agar masuk payroll
3. ✅ **Perhitungan otomatis** → Total jam dihitung dari start_time - end_time
4. ✅ **Integrasi payroll** → Hanya lembur approved yang dihitung
5. ✅ **Role-based access** → Karyawan lihat sendiri, owner lihat semua
6. ✅ **Flexible unit** → per_jam_lembur terpisah dari per_jam reguler

**Perbedaan Utama:**
- **Absensi Reguler:** Untuk kehadiran harian (hadir/telat/izin/alpha)
- **Lembur:** Untuk jam kerja tambahan (pending/approved/rejected)

**Teknologi:**
- Backend: Node.js + Hono + Supabase
- Database: PostgreSQL (Supabase)
- Frontend: React + Vite + TailwindCSS
