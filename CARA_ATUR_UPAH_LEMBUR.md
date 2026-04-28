# 💰 Cara Atur Upah Lembur Per Karyawan

## 🎯 Overview

Setiap karyawan bisa punya **upah lembur berbeda-beda**. Sistem akan:
1. Cek apakah karyawan punya konfigurasi upah lembur custom
2. Jika ada → pakai upah custom
3. Jika tidak → pakai upah default dari `salary_types`

---

## 📋 Cara Setting Upah Lembur

### **Opsi 1: Via Halaman Data Karyawan (Recommended)**

1. Login sebagai **Owner**
2. Buka menu **Karyawan** → **Data Karyawan**
3. Klik karyawan yang ingin diatur
4. Klik **Atur Gaji** atau **Edit Komponen Gaji**
5. Cari komponen **"Uang Lembur"**
6. Isi nominal per jam (contoh: Rp 15.000)
7. Klik **Simpan**

**Contoh:**
- Karyawan A (Senior): Rp 20.000/jam
- Karyawan B (Junior): Rp 10.000/jam
- Karyawan C (belum diatur): Rp 8.000/jam (default)

---

### **Opsi 2: Via Database (Supabase)**

Jika belum ada UI untuk atur gaji, bisa langsung via SQL:

#### **1. Cek ID Salary Type untuk Lembur**
```sql
SELECT id, name, amount, unit 
FROM salary_types 
WHERE unit = 'per_jam_lembur';
```

Output:
```
id: abc-123-def
name: Uang Lembur
amount: 8000
unit: per_jam_lembur
```

#### **2. Cek ID Karyawan**
```sql
SELECT e.id, p.full_name 
FROM employees e
JOIN profiles p ON e.profile_id = p.id;
```

Output:
```
id: emp-456-xyz
full_name: John Doe
```

#### **3. Set Upah Lembur Custom**
```sql
-- Insert atau update upah lembur karyawan
INSERT INTO employee_salary_components (employee_id, salary_type_id, amount)
VALUES (
  'emp-456-xyz',  -- ID karyawan
  'abc-123-def',  -- ID salary type lembur
  15000           -- Upah per jam (Rp 15.000)
)
ON CONFLICT (employee_id, salary_type_id) 
DO UPDATE SET amount = 15000;
```

#### **4. Verifikasi**
```sql
SELECT 
  p.full_name,
  st.name as komponen,
  esc.amount as upah_per_jam
FROM employee_salary_components esc
JOIN employees e ON esc.employee_id = e.id
JOIN profiles p ON e.profile_id = p.id
JOIN salary_types st ON esc.salary_type_id = st.id
WHERE st.unit = 'per_jam_lembur';
```

Output:
```
full_name: John Doe
komponen: Uang Lembur
upah_per_jam: 15000
```

---

## 🔄 Cara Kerja Sistem

### **Skenario 1: Karyawan dengan Upah Custom**

**Data:**
- Karyawan: Budi
- Upah lembur custom: Rp 20.000/jam
- Lembur: 3 jam

**Perhitungan:**
```
3 jam × Rp 20.000 = Rp 60.000
```

### **Skenario 2: Karyawan tanpa Upah Custom**

**Data:**
- Karyawan: Ani
- Upah lembur custom: (tidak ada)
- Upah default: Rp 8.000/jam
- Lembur: 2.5 jam

**Perhitungan:**
```
2.5 jam × Rp 8.000 = Rp 20.000
```

---

## 📊 Integrasi dengan Payroll

Saat proses gaji bulanan:

```javascript
// backend/src/services/payroll-service.js
for (const employee of employees) {
  // 1. Hitung jam lembur approved
  const totalOvertimeHours = 7; // contoh
  
  // 2. Ambil komponen gaji karyawan (termasuk upah lembur custom)
  const { data: empComponents } = await supabaseAdmin
    .from("employee_salary_components")
    .select("amount, salary_types(*)")
    .eq("employee_id", employee.id);
  
  // 3. Cari komponen lembur
  const overtimeComponent = empComponents.find(
    c => c.salary_types.unit === 'per_jam_lembur'
  );
  
  // 4. Hitung upah lembur
  if (overtimeComponent) {
    const overtimePay = totalOvertimeHours * overtimeComponent.amount;
    // Rp 7 jam × Rp 20.000 = Rp 140.000
  }
}
```

---

## 🎯 Contoh Lengkap

### **Setup Awal:**

**1. Buat Salary Type Lembur (sudah ada dari migration):**
```sql
INSERT INTO salary_types (name, amount, unit) 
VALUES ('Uang Lembur', 8000, 'per_jam_lembur');
```

**2. Set Upah Custom untuk 3 Karyawan:**

```sql
-- Karyawan Senior (Rp 25.000/jam)
INSERT INTO employee_salary_components (employee_id, salary_type_id, amount)
VALUES ('emp-001', 'salary-type-lembur-id', 25000);

-- Karyawan Mid (Rp 15.000/jam)
INSERT INTO employee_salary_components (employee_id, salary_type_id, amount)
VALUES ('emp-002', 'salary-type-lembur-id', 15000);

-- Karyawan Junior (tidak diset, pakai default Rp 8.000/jam)
```

### **Hasil di Halaman Lembur:**

**Karyawan Senior:**
```
┌─────────────────────────────┐
│ Upah Lembur Per Jam         │
│ Rp 25.000                   │ ← Custom rate
└─────────────────────────────┘
```

**Karyawan Junior:**
```
┌─────────────────────────────┐
│ Upah Lembur Per Jam         │
│ Rp 8.000                    │ ← Default rate
└─────────────────────────────┘
```

---

## 🔧 Troubleshooting

### **Upah lembur tidak muncul / Rp 0**
→ Pastikan salary type dengan unit `per_jam_lembur` sudah ada:
```sql
SELECT * FROM salary_types WHERE unit = 'per_jam_lembur';
```

### **Semua karyawan dapat upah yang sama**
→ Belum ada konfigurasi custom, semua pakai default. Set custom per karyawan.

### **Upah lembur tidak masuk payroll**
→ Pastikan lembur sudah di-approve owner (status = 'approved')

---

## ✅ Checklist

- [ ] Salary type lembur sudah ada (`per_jam_lembur`)
- [ ] Set upah default di `salary_types`
- [ ] Set upah custom per karyawan di `employee_salary_components`
- [ ] Test lembur → lihat upah per jam di summary card
- [ ] Test payroll → upah lembur masuk ke gaji

---

## 🎓 Best Practice

1. **Set default rate** yang wajar (Rp 8.000 - Rp 10.000)
2. **Set custom rate** untuk karyawan senior/spesial
3. **Review berkala** upah lembur setiap 6 bulan
4. **Dokumentasi** siapa dapat upah berapa dan kenapa

**Contoh Struktur:**
- Junior: Rp 8.000/jam (default)
- Mid: Rp 15.000/jam (custom)
- Senior: Rp 25.000/jam (custom)
- Manager: Rp 35.000/jam (custom)
