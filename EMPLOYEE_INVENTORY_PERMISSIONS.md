# Employee Inventory Permissions - Karyawan Bisa Menambah Stock

## Perubahan
Karyawan sekarang memiliki akses yang sama dengan owner untuk menambah stock barang dan mencatat pengeluaran bahan.

## Permission Matrix

### Sebelum Perubahan ❌

| Fitur | Owner | Karyawan |
|-------|-------|----------|
| Lihat Inventory | ✅ | ✅ |
| Tambah Item Baru | ✅ | ❌ |
| Hapus Item | ✅ | ❌ |
| Tambah Supplier | ✅ | ❌ |
| Hapus Supplier | ✅ | ❌ |
| **Tambah Stock (Purchase)** | ✅ | ❌ |
| Gunakan Stock (Usage) | ✅ | ✅ |
| Hapus Usage | ✅ | ❌ |
| **Catat Pengeluaran Bahan** | ✅ | ❌ |

### Setelah Perubahan ✅

| Fitur | Owner | Karyawan |
|-------|-------|----------|
| Lihat Inventory | ✅ | ✅ |
| Tambah Item Baru | ✅ | ❌ |
| Hapus Item | ✅ | ❌ |
| Tambah Supplier | ✅ | ❌ |
| Hapus Supplier | ✅ | ❌ |
| **Tambah Stock (Purchase)** | ✅ | ✅ ⭐ |
| Gunakan Stock (Usage) | ✅ | ✅ |
| Hapus Usage | ✅ | ❌ |
| **Catat Pengeluaran Bahan** | ✅ | ✅ ⭐ |

## Detail Perubahan

### 1. Tambah Stock (Purchase) - `/api/inventory/purchases`

**Sebelum:**
```javascript
router.post(
  "/purchases",
  requireRoles("owner"),  // ❌ Hanya owner
  validateBody(...),
  storePurchase,
);
```

**Sesudah:**
```javascript
router.post(
  "/purchases",
  // ✅ Semua role yang terautentikasi bisa akses
  validateBody(...),
  storePurchase,
);
```

**Fungsi:**
- Menambah stock barang dari supplier
- Mencatat pembelian dengan harga
- Otomatis update current_stock di inventory_items

**Request Body:**
```json
{
  "supplier_id": "uuid-supplier",
  "item_id": "uuid-item",
  "qty": 100,
  "unit_price": 5000,
  "date": "2026-04-28"
}
```

### 2. Catat Pengeluaran Bahan - `/api/inventory/material-expenses`

**Sebelum:**
```javascript
router.post(
  "/material-expenses",
  requireRoles("owner"),  // ❌ Hanya owner
  validateBody(...),
  storeMaterialExpense,
);
```

**Sesudah:**
```javascript
router.post(
  "/material-expenses",
  // ✅ Semua role yang terautentikasi bisa akses
  validateBody(...),
  storeMaterialExpense,
);
```

**Fungsi:**
- Mencatat pengeluaran untuk bahan baku
- Tidak mengurangi stock (hanya pencatatan biaya)
- Untuk tracking pengeluaran operasional

**Request Body:**
```json
{
  "item_id": "uuid-item",
  "qty": 10,
  "unit_price": 5000,
  "total_expense": 50000,
  "reason": "Pembelian bahan tambahan",
  "date": "2026-04-28"
}
```

## Fitur yang Tetap Restricted (Owner Only)

### 1. Tambah Item Baru - `/api/inventory/items`
**Alasan:** Menambah item baru mempengaruhi struktur inventory, sebaiknya dikontrol oleh owner.

### 2. Hapus Item - `DELETE /api/inventory/items/:id`
**Alasan:** Penghapusan item adalah operasi permanen yang berisiko.

### 3. Tambah Supplier - `/api/inventory/suppliers`
**Alasan:** Manajemen supplier sebaiknya dikontrol oleh owner.

### 4. Hapus Supplier - `DELETE /api/inventory/suppliers/:id`
**Alasan:** Penghapusan supplier adalah operasi permanen.

### 5. Hapus Usage - `DELETE /api/inventory/usages/:id`
**Alasan:** Menghapus usage akan restore stock, operasi sensitif.

## Use Cases

### Use Case 1: Karyawan Menerima Barang dari Supplier
**Scenario:** Supplier mengirim barang, karyawan yang menerima dan mencatat.

**Flow:**
1. Karyawan login ke aplikasi
2. Buka halaman Inventory
3. Klik "Pembelian"
4. Pilih supplier dan item
5. Input jumlah dan harga
6. Simpan

**Sebelumnya:** Karyawan harus menunggu owner untuk mencatat ❌
**Sekarang:** Karyawan bisa langsung mencatat ✅

### Use Case 2: Karyawan Mencatat Pengeluaran Bahan
**Scenario:** Karyawan membeli bahan tambahan untuk produksi.

**Flow:**
1. Karyawan login ke aplikasi
2. Buka halaman Inventory
3. Klik "Pengeluaran"
4. Pilih item dan input detail
5. Simpan

**Sebelumnya:** Karyawan harus lapor ke owner ❌
**Sekarang:** Karyawan bisa langsung mencatat ✅

## Security & Audit Trail

### Tracking
Semua transaksi tetap tercatat dengan `created_by`:
```sql
created_by uuid references public.profiles(id)
```

### Audit
Owner bisa melihat siapa yang melakukan transaksi:
- Lihat history purchases dengan nama user
- Lihat history material expenses dengan nama user
- Filter berdasarkan user jika diperlukan

### Validation
Tetap ada validasi di backend:
- Qty harus positif
- Unit price tidak boleh negatif
- Supplier dan item harus exist
- Date wajib diisi

## Testing

### Test 1: Karyawan Tambah Stock
1. Login sebagai karyawan
2. POST `/api/inventory/purchases`
```json
{
  "supplier_id": "valid-uuid",
  "item_id": "valid-uuid",
  "qty": 50,
  "unit_price": 10000,
  "date": "2026-04-28"
}
```
3. Expected: Status 201, stock bertambah

### Test 2: Karyawan Catat Pengeluaran
1. Login sebagai karyawan
2. POST `/api/inventory/material-expenses`
```json
{
  "item_id": "valid-uuid",
  "qty": 5,
  "unit_price": 8000,
  "total_expense": 40000,
  "reason": "Beli bahan tambahan",
  "date": "2026-04-28"
}
```
3. Expected: Status 201, pengeluaran tercatat

### Test 3: Karyawan Tidak Bisa Hapus Item
1. Login sebagai karyawan
2. DELETE `/api/inventory/items/:id`
3. Expected: Status 403 Forbidden

## Migration Notes

### Database
Tidak ada perubahan di database schema. Semua table sudah support multi-user dengan `created_by` field.

### Frontend
Tidak perlu perubahan di frontend. UI sudah ada, hanya permission backend yang berubah.

### Deployment
1. Deploy backend dengan perubahan routes
2. Restart backend service
3. Test dengan akun karyawan
4. Verifikasi audit trail tetap berfungsi

## Rollback Plan

Jika perlu rollback, kembalikan permission:

```javascript
// Rollback: Tambahkan kembali requireRoles("owner")
router.post(
  "/purchases",
  requireRoles("owner"),  // Restore owner-only
  validateBody(...),
  storePurchase,
);

router.post(
  "/material-expenses",
  requireRoles("owner"),  // Restore owner-only
  validateBody(...),
  storeMaterialExpense,
);
```

## Benefits

### Untuk Karyawan
✅ Lebih mandiri dalam operasional harian
✅ Tidak perlu menunggu owner untuk input data
✅ Bisa langsung mencatat saat menerima barang
✅ Lebih efisien dalam bekerja

### Untuk Owner
✅ Tidak perlu input semua data sendiri
✅ Bisa fokus ke hal strategis
✅ Tetap bisa monitor semua transaksi
✅ Audit trail tetap lengkap

### Untuk Bisnis
✅ Data lebih real-time
✅ Operasional lebih cepat
✅ Mengurangi bottleneck
✅ Meningkatkan akurasi data

## File yang Diubah

1. `backend/src/routes/inventory-routes.js`
   - Removed `requireRoles("owner")` from `/purchases` endpoint
   - Removed `requireRoles("owner")` from `/material-expenses` endpoint
   - Updated comments to reflect new permissions

## Related Documentation

- `supabase/migrations/004_allow_employee_inventory_access.sql` - Database migration (jika ada)
- `DELETE_FUNCTIONALITY.md` - Dokumentasi fitur delete (owner only)
- `INVENTORY_MOBILE_FIX.md` - UI inventory di mobile

## Notes

- Permission changes hanya di backend routes
- Frontend UI sudah support, tidak perlu perubahan
- Database schema sudah support multi-user
- Audit trail tetap berfungsi dengan `created_by` field
- Owner tetap punya kontrol penuh untuk operasi delete dan create master data
