# Settings Page Fix - Pengaturan Tidak Muncul

## Masalah
Halaman pengaturan tidak muncul dan stuck di loading state dengan pesan "Memuat pengaturan...".

## Penyebab
1. **Response Structure Mismatch**: Frontend mengharapkan `response.data.data` tetapi backend mengembalikan `response.data`
2. **Tidak Ada Error Handling**: Jika API gagal, halaman tetap stuck di loading tanpa menampilkan error
3. **Backend Tidak Berjalan**: Backend mungkin tidak running di port 4001

## Solusi

### 1. Perbaikan Frontend (SettingsPage.jsx)

#### Error State Management
```javascript
const [error, setError] = useState(null);
```

#### Improved loadSettings Function
```javascript
const loadSettings = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await api.get("/settings");
    if (response && response.data) {
      const data = response.data;  // Langsung ambil dari response.data
      setSettings({
        work_start_time: data.work_start_time || "08:00:00",
        tolerance_minutes: data.tolerance_minutes !== undefined ? data.tolerance_minutes : 15,
      });
    } else {
      // Use default values if no data
      setSettings({
        work_start_time: "08:00:00",
        tolerance_minutes: 15,
      });
    }
  } catch (error) {
    console.error("Error loading settings:", error);
    setError(error.message || "Gagal memuat pengaturan");
    // Use default values if error
    setSettings({
      work_start_time: "08:00:00",
      tolerance_minutes: 15,
    });
    toast.error("Gagal memuat pengaturan, menggunakan nilai default");
  } finally {
    setLoading(false);
  }
};
```

#### Error Display UI
```javascript
if (error && !settings) {
  return (
    <div className="flex h-64 items-center justify-center flex-col gap-4">
      <p className="text-red-600">❌ {error}</p>
      <Button onClick={loadSettings}>Coba Lagi</Button>
    </div>
  );
}
```

#### Updated Business Name
```javascript
const payload = {
  business_name: currentData.business_name || "Rumah Kue Nuraisah",
  // ... rest of payload
};
```

### 2. Backend Configuration

#### Port Configuration (backend/.env)
```env
PORT=4001
FRONTEND_URL=http://localhost:5172,http://localhost:5173,http://localhost:5174
```

#### API Endpoint (frontend/.env)
```env
VITE_API_BASE_URL=http://localhost:4001/api
```

### 3. Cara Menjalankan

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Backend akan berjalan di `http://localhost:4001`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:5173` (atau port lain jika 5173 sudah digunakan)

## Hasil Perbaikan

### Sebelum
- ❌ Halaman stuck di "Memuat pengaturan..."
- ❌ Tidak ada feedback jika API gagal
- ❌ Tidak bisa retry jika error

### Sesudah
- ✅ Menampilkan form pengaturan dengan benar
- ✅ Menampilkan error message jika API gagal
- ✅ Tombol "Coba Lagi" untuk retry
- ✅ Fallback ke nilai default jika API gagal
- ✅ Toast notification untuk user feedback
- ✅ Loading state yang proper

## Testing

### 1. Test Normal Flow
1. Pastikan backend running di port 4001
2. Buka halaman Pengaturan
3. Seharusnya muncul form dengan jam kerja saat ini

### 2. Test Error Handling
1. Matikan backend
2. Buka halaman Pengaturan
3. Seharusnya muncul error message dan tombol "Coba Lagi"
4. Nyalakan backend
5. Klik "Coba Lagi"
6. Form seharusnya muncul

### 3. Test Save Functionality
1. Ubah jam kerja (misal: 09:00)
2. Ubah toleransi (misal: 30 menit)
3. Klik "Simpan Pengaturan"
4. Refresh halaman
5. Pengaturan seharusnya tetap tersimpan (tidak kembali ke default)

## Troubleshooting

### Masalah: "Request timeout. Server tidak merespon."
**Solusi**: Backend tidak running. Jalankan `npm run dev` di folder backend.

### Masalah: "Gagal memuat pengaturan"
**Solusi**: 
1. Check browser console untuk error detail
2. Pastikan backend running di port 4001
3. Pastikan VITE_API_BASE_URL di frontend/.env benar
4. Check CORS configuration di backend

### Masalah: Pengaturan kembali ke default setelah refresh
**Solusi**: 
1. Check browser console saat save
2. Pastikan user memiliki role "owner"
3. Check database apakah data tersimpan
4. Pastikan tidak ada error di backend logs

## File yang Diubah

1. `frontend/src/pages/SettingsPage.jsx`
   - Added error state management
   - Fixed response structure handling
   - Added error display UI
   - Updated business name default
   - Improved loading state logic

## API Endpoint

### GET /api/settings
**Response:**
```json
{
  "data": {
    "id": 1,
    "business_name": "Rumah Kue Nuraisah",
    "latitude": 0,
    "longitude": 0,
    "attendance_radius_meters": 100,
    "work_start_time": "08:00:00",
    "tolerance_minutes": 15,
    "timezone": "Asia/Jakarta"
  }
}
```

### PUT /api/settings
**Request:**
```json
{
  "business_name": "Rumah Kue Nuraisah",
  "latitude": 0,
  "longitude": 0,
  "attendance_radius_meters": 100,
  "work_start_time": "09:00:00",
  "tolerance_minutes": 30
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "business_name": "Rumah Kue Nuraisah",
    "work_start_time": "09:00:00",
    "tolerance_minutes": 30,
    // ... other fields
  }
}
```

## Catatan Penting

1. **Backend Harus Running**: Pastikan backend selalu running saat menggunakan aplikasi
2. **Role Owner**: Hanya user dengan role "owner" yang bisa mengubah pengaturan
3. **Default Values**: Jika API gagal, aplikasi akan menggunakan nilai default (08:00, 15 menit)
4. **Error Feedback**: User akan mendapat feedback yang jelas jika terjadi error
5. **Retry Mechanism**: User bisa retry jika terjadi error tanpa perlu refresh halaman
