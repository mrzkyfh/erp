# 🔗 Integrasi Lengkap: Gaji, Absensi, dan Lembur

## 🎯 Overview

Sistem ini mengintegrasikan 3 fitur utama:
1. **Absensi Reguler** → Kehadiran harian
2. **Lembur** → Jam kerja tambahan
3. **Payroll** → Perhitungan gaji bulanan

Semua data saling terhubung dan otomatis dihitung saat proses gaji.

---

## 📊 Alur Data Lengkap

```
┌─────────────────┐
│   KARYAWAN      │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│  ABSENSI        │                  │  LEMBUR         │
│  REGULER        │                  │                 │
├─────────────────┤                  ├─────────────────┤
│ • Check-in QR   │                  │ • Start lembur  │
│ • Check-out     │                  │ • End lembur    │
│ • Status: hadir │                  │ • Approval      │
│   telat, izin   │                  │ • Status:       │
│ • Denda telat   │                  │   approved      │
└────────┬────────┘                  └────────┬────────┘
         │                                     │
         │                                     │
         └─────────────┬───────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  PAYROLL        │
              │  (Gaji Bulanan) │
              ├─────────────────┤
              │ 1. Hitung       │
              │    kehadiran    │
              │ 2. Hitung jam   │
              │    kerja        │
              │ 3. Hitung jam   │
              │    lembur       │
              │ 4. Ambil        │
              │    komponen     │
              │    gaji         │
              │ 5. Kalikan      │
              │    sesuai unit  │
              │ 6. Total gaji   │
              └─────────────────┘
```

---

## 🔢 Perhitungan Gaji Lengkap

### **Komponen Gaji (Salary Types)**

| Nama Komponen | Unit | Contoh Nominal | Dihitung Dari |
|---------------|------|----------------|---------------|
| Gaji Pokok | `per_kehadiran` | Rp 100.000 | Jumlah hari hadir |
| Uang Makan | `per_kehadiran` | Rp 15.000 | Jumlah hari hadir |
| Uang Transport | `per_kehadiran` | Rp 15.000 | Jumlah hari hadir |
| Upah Per Jam | `per_jam` | Rp 25.000 | Total jam kerja reguler |
| **Uang Lembur** | `per_jam_lembur` | Rp 15.000 | Total jam lembur approved |
| Tunjangan Tetap | `fixed` | Rp 500.000 | Tetap per bulan |

### **Konfigurasi Per Karyawan**

Setiap karyawan bisa punya nominal berbeda di `employee_salary_components`:

```sql
-- Karyawan A (Senior)
employee_id: emp-001
- Gaji Pokok: Rp 150.000/hari (custom)
- Uang Lembur: Rp 25.000/jam (custom)

-- Karyawan B (Junior)
employee_id: emp-002
- Gaji Pokok: Rp 100.000/hari (default)
- Uang Lembur: Rp 10.000/jam (custom)

-- Karyawan C (belum diatur)
employee_id: emp-003
- Semua pakai default dari salary_types
```

---

## 💡 Contoh Perhitungan Lengkap

### **Karyawan: Budi (Senior)**

**Konfigurasi Gaji:**
- Gaji Pokok: Rp 150.000/hari (custom)
- Uang Makan: Rp 15.000/hari (default)
- Uang Lembur: Rp 25.000/jam (custom)

**Data Januari 2025:**

#### **1. Absensi Reguler**
```
Tanggal | Check-in | Check-out | Status | Jam Kerja
--------|----------|-----------|--------|----------
2 Jan   | 08:00    | 17:00     | Hadir  | 9 jam
3 Jan   | 08:20    | 17:00     | Telat  | 8.67 jam (denda Rp 10.000)
4 Jan   | 08:00    | 17:00     | Hadir  | 9 jam
...
31 Jan  | 08:00    | 17:00     | Hadir  | 9 jam

Total: 22 hari hadir (termasuk telat)
Total jam kerja: 198 jam
```

#### **2. Lembur**
```
Tanggal | Mulai | Selesai | Jam   | Status   | Pendapatan
--------|-------|---------|-------|----------|------------
5 Jan   | 18:00 | 21:00   | 3 jam | Approved | Rp 75.000
12 Jan  | 19:00 | 21:30   | 2.5 jam | Approved | Rp 62.500
20 Jan  | 18:00 | 19:00   | 1 jam | Pending  | Rp 0 (belum approved)
25 Jan  | 18:00 | 20:00   | 2 jam | Rejected | Rp 0 (ditolak)

Total jam lembur approved: 5.5 jam
```

#### **3. Perhitungan Payroll**

```javascript
// Proses gaji Januari 2025
const employee = "Budi";

// A. Komponen per kehadiran
const gaji_pokok = 22 hari × Rp 150.000 = Rp 3.300.000
const uang_makan = 22 hari × Rp 15.000  = Rp 330.000

// B. Komponen per jam (jika ada)
// (Budi tidak pakai komponen per_jam)

// C. Komponen lembur
const uang_lembur = 5.5 jam × Rp 25.000 = Rp 137.500

// D. Total allowances
const total_allowances = Rp 3.300.000 + Rp 330.000 + Rp 137.500
                       = Rp 3.767.500

// E. Potongan
const denda_telat = Rp 10.000 (1x telat)
const deductions = Rp 10.000

// F. Gaji bersih
const net_salary = Rp 3.767.500 - Rp 10.000
                 = Rp 3.757.500
```

**Slip Gaji Budi - Januari 2025:**
```
┌─────────────────────────────────────────┐
│ SLIP GAJI - JANUARI 2025                │
│ Nama: Budi                              │
├─────────────────────────────────────────┤
│ PENDAPATAN:                             │
│ • Gaji Pokok (22 hari)    Rp 3.300.000 │
│ • Uang Makan (22 hari)    Rp   330.000 │
│ • Uang Lembur (5.5 jam)   Rp   137.500 │
├─────────────────────────────────────────┤
│ Total Pendapatan          Rp 3.767.500 │
├─────────────────────────────────────────┤
│ POTONGAN:                               │
│ • Denda Telat (1x)        Rp    10.000 │
├─────────────────────────────────────────┤
│ Total Potongan            Rp    10.000 │
├─────────────────────────────────────────┤
│ GAJI BERSIH               Rp 3.757.500 │
└─────────────────────────────────────────┘
```

---

## 🔄 Backend Logic (Payroll Service)

```javascript
// backend/src/services/payroll-service.js
export async function processPayroll(month, year, processedBy) {
  const period = await getOrCreatePeriod(month, year, processedBy);
  const range = monthRange(month, year);

  // 1. Get all active employees
  const { data: employees } = await supabaseAdmin
    .from("employees")
    .select("*")
    .eq("status", "aktif");

  for (const employee of employees) {
    // 2. Count attendances (hadir + telat)
    const { data: attendanceLogs } = await supabaseAdmin
      .from("attendance_logs")
      .select("check_in_at, check_out_at")
      .eq("employee_id", employee.id)
      .in("status", ["hadir", "telat"])
      .gte("check_in_at", range.start)
      .lte("check_in_at", range.end);

    const attendancesCount = attendanceLogs.length;
    
    // 3. Calculate total hours worked (regular)
    let totalHours = 0;
    attendanceLogs.forEach(log => {
      if (log.check_in_at && log.check_out_at) {
        const diffMs = new Date(log.check_out_at) - new Date(log.check_in_at);
        const diffHours = diffMs / (1000 * 60 * 60);
        totalHours += Math.max(0, diffHours);
      }
    });

    // 4. Calculate total overtime hours (approved only)
    const { data: overtimeLogs } = await supabaseAdmin
      .from("overtime_logs")
      .select("total_hours")
      .eq("employee_id", employee.id)
      .eq("status", "approved") // ⚠️ HANYA APPROVED
      .gte("date", range.start.split('T')[0])
      .lte("date", range.end.split('T')[0]);

    const totalOvertimeHours = overtimeLogs.reduce(
      (sum, log) => sum + Number(log.total_hours || 0), 
      0
    );

    // 5. Get salary components FOR THIS EMPLOYEE
    const { data: empComponents } = await supabaseAdmin
      .from("employee_salary_components")
      .select("amount, salary_types(*)")
      .eq("employee_id", employee.id);

    // 6. Calculate each component
    const payrollItems = [];
    let totalAllowances = 0;

    for (const component of empComponents) {
      let count = 1;
      let totalAmount = 0;

      if (component.salary_types.unit === 'per_kehadiran') {
        // Gaji per hari hadir
        count = attendancesCount;
        totalAmount = component.amount * count;
      } 
      else if (component.salary_types.unit === 'per_jam') {
        // Upah per jam kerja reguler
        count = Math.round(totalHours * 100) / 100;
        totalAmount = component.amount * count;
      } 
      else if (component.salary_types.unit === 'per_jam_lembur') {
        // ⚠️ UPAH LEMBUR (custom per karyawan)
        count = Math.round(totalOvertimeHours * 100) / 100;
        totalAmount = component.amount * count;
      } 
      else {
        // Fixed (tetap bulanan)
        count = 1;
        totalAmount = component.amount;
      }

      payrollItems.push({
        salary_type_id: component.salary_types.id,
        name: component.salary_types.name,
        amount: component.amount,
        unit: component.salary_types.unit,
        count: count,
        total_amount: Math.round(totalAmount)
      });

      totalAllowances += totalAmount;
    }

    // 7. Calculate deductions
    const deductions = employee.default_deduction || 0;
    const netSalary = Math.round(totalAllowances - deductions);

    // 8. Save payroll detail
    await supabaseAdmin.from("payroll_details").upsert({
      period_id: period.id,
      employee_id: employee.id,
      total_allowances: Math.round(totalAllowances),
      deductions,
      net_salary: netSalary,
    });

    // 9. Save payroll items (breakdown)
    await supabaseAdmin.from("payroll_items").insert(
      payrollItems.map(item => ({
        ...item,
        payroll_detail_id: detail.id
      }))
    );
  }
}
```

---

## ✅ Validasi & Testing

### **Test Case 1: Karyawan dengan Lembur Approved**
```
Input:
- Kehadiran: 20 hari
- Lembur approved: 5 jam @ Rp 15.000/jam
- Gaji pokok: Rp 100.000/hari

Expected Output:
- Gaji pokok: 20 × Rp 100.000 = Rp 2.000.000
- Uang lembur: 5 × Rp 15.000 = Rp 75.000
- Total: Rp 2.075.000
```

### **Test Case 2: Karyawan dengan Lembur Pending**
```
Input:
- Kehadiran: 20 hari
- Lembur pending: 5 jam (belum approved)
- Gaji pokok: Rp 100.000/hari

Expected Output:
- Gaji pokok: 20 × Rp 100.000 = Rp 2.000.000
- Uang lembur: Rp 0 (pending tidak dihitung)
- Total: Rp 2.000.000
```

### **Test Case 3: Karyawan dengan Custom Rate**
```
Input:
- Kehadiran: 22 hari
- Lembur approved: 10 jam
- Gaji pokok custom: Rp 150.000/hari
- Upah lembur custom: Rp 25.000/jam

Expected Output:
- Gaji pokok: 22 × Rp 150.000 = Rp 3.300.000
- Uang lembur: 10 × Rp 25.000 = Rp 250.000
- Total: Rp 3.550.000
```

---

## 🔧 Troubleshooting

### **Lembur tidak masuk payroll**
✅ **Solusi:**
1. Pastikan status lembur = `approved`
2. Pastikan tanggal lembur dalam range bulan yang diproses
3. Pastikan karyawan punya komponen `per_jam_lembur` di `employee_salary_components`

### **Upah lembur salah**
✅ **Solusi:**
1. Cek `employee_salary_components` untuk karyawan tersebut
2. Jika tidak ada custom, akan pakai default dari `salary_types`
3. Verifikasi dengan query:
```sql
SELECT 
  p.full_name,
  esc.amount as upah_lembur_custom,
  st.amount as upah_lembur_default
FROM employees e
JOIN profiles p ON e.profile_id = p.id
LEFT JOIN employee_salary_components esc ON e.id = esc.employee_id
LEFT JOIN salary_types st ON esc.salary_type_id = st.id AND st.unit = 'per_jam_lembur'
WHERE e.id = 'employee-id';
```

### **Gaji tidak sesuai**
✅ **Solusi:**
1. Cek `payroll_items` untuk breakdown detail
2. Verifikasi setiap komponen:
   - `per_kehadiran` → count harus = jumlah hari hadir
   - `per_jam` → count harus = total jam kerja
   - `per_jam_lembur` → count harus = total jam lembur approved
   - `fixed` → count harus = 1

---

## 📋 Checklist Integrasi

- [ ] Salary types sudah lengkap (termasuk `per_jam_lembur`)
- [ ] Employee salary components sudah diatur per karyawan
- [ ] Absensi reguler berjalan normal
- [ ] Lembur bisa start/end dan approval
- [ ] Payroll menghitung kehadiran dengan benar
- [ ] Payroll menghitung jam kerja dengan benar
- [ ] Payroll menghitung jam lembur approved dengan benar
- [ ] Slip gaji menampilkan breakdown lengkap
- [ ] Test dengan berbagai skenario (approved/pending/rejected)

---

## 🎓 Best Practice

1. **Approve lembur sebelum proses gaji** → Hindari pending saat payroll
2. **Set custom rate untuk karyawan spesial** → Senior/manager dapat lebih
3. **Review payroll items** → Pastikan breakdown benar sebelum paid
4. **Backup data** → Sebelum proses gaji bulanan
5. **Dokumentasi perubahan** → Catat jika ada perubahan upah

---

## 🚀 Summary

**Integrasi Lengkap:**
```
Absensi → Kehadiran harian → Gaji per hari/jam
Lembur → Jam tambahan → Upah lembur (jika approved)
Payroll → Gabung semua → Gaji bersih bulanan
```

**Key Points:**
- ✅ Setiap karyawan bisa punya upah berbeda
- ✅ Lembur harus approved untuk masuk gaji
- ✅ Perhitungan otomatis saat proses payroll
- ✅ Breakdown detail di payroll_items
