# Cara Deploy Ulang Backend untuk Fix Settings Endpoint

## Platform: Cloudflare Workers

Backend Anda menggunakan Cloudflare Workers. Endpoint `/api/settings` tidak ditemukan karena backend belum di-deploy ulang setelah file `business-settings-routes.js` ditambahkan.

## Langkah-Langkah Deploy

### 1. Pastikan Semua Perubahan Sudah di Push
```bash
# Cek status git
git status

# Jika ada perubahan yang belum di-commit:
git add .
git commit -m "Fix settings endpoint"
git push origin main
```

### 2. Deploy Backend ke Cloudflare Workers
```bash
# Masuk ke folder backend
cd backend

# Deploy menggunakan wrangler
npm run deploy
```

**Output yang diharapkan:**
```
Total Upload: xx.xx KiB / gzip: xx.xx KiB
Uploaded erp-mini-backend (x.xx sec)
Published erp-mini-backend (x.xx sec)
  https://erp-mini-backend.your-account.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 3. Tunggu Deployment Selesai
- Proses biasanya memakan waktu 10-30 detik
- Cloudflare Workers akan otomatis restart setelah deployment

### 4. Test Endpoint
```bash
# Test endpoint settings (ganti URL dengan URL backend Anda)
curl https://erp-mini-backend.your-account.workers.dev/api/settings
```

**Response yang diharapkan:**
```json
{
  "data": {
    "business_name": "Bisnis Anda",
    "work_start_time": "08:00:00",
    "tolerance_minutes": 15,
    ...
  }
}
```

**Jika masih 404:**
```json
{
  "message": "Endpoint tidak ditemukan"
}
```

### 5. Update Frontend Environment (Jika Perlu)
Pastikan frontend menggunakan URL backend yang benar:

```env
# frontend/.env (untuk production)
VITE_API_BASE_URL=https://erp-mini-backend.your-account.workers.dev/api
```

Jika URL berubah, deploy ulang frontend:
```bash
cd frontend
npm run build
# Deploy ke Cloudflare Pages atau platform hosting Anda
```

### 6. Test di Browser
1. Buka aplikasi frontend
2. Login sebagai owner (email: owner@gmail.com, password: 1q2w3e4r)
3. Klik menu "Pengaturan"
4. Seharusnya muncul form pengaturan jam kerja, bukan error "Endpoint tidak ditemukan"

## Troubleshooting

### Error: "Not logged in"
```bash
# Login ke Cloudflare
npx wrangler login
```

### Error: "No such file or directory"
```bash
# Pastikan Anda di folder backend
cd backend
pwd  # Harus menampilkan path yang berakhir dengan /backend
```

### Error: "wrangler: command not found"
```bash
# Install dependencies
npm install
```

### Endpoint Masih 404 Setelah Deploy
1. **Cek file ada di local:**
   ```bash
   ls -la backend/src/routes/business-settings-routes.js
   ```
   
2. **Cek import di index.js:**
   ```bash
   grep "businessSettingsRoutes" backend/src/routes/index.js
   ```
   Harus ada: `import { businessSettingsRoutes } from "./business-settings-routes.js";`

3. **Cek route registration:**
   ```bash
   grep "settings" backend/src/routes/index.js
   ```
   Harus ada: `router.route("/settings", businessSettingsRoutes);`

4. **Deploy ulang dengan force:**
   ```bash
   cd backend
   npx wrangler deploy --force
   ```

### Cek Deployment History
```bash
cd backend
npx wrangler deployments list
```

## Verifikasi Setelah Deploy

### ✅ Checklist:
- [ ] Backend berhasil di-deploy (lihat output "Published erp-mini-backend")
- [ ] Endpoint `/api/settings` bisa diakses (test dengan curl)
- [ ] Frontend bisa load halaman Pengaturan tanpa error
- [ ] Bisa menyimpan pengaturan jam kerja
- [ ] Pengaturan tersimpan di database (cek di Supabase dashboard)

## URL Backend Anda

Berdasarkan konfigurasi, backend Anda akan di-deploy ke:
```
https://erp-mini-backend.[your-account].workers.dev
```

Pastikan URL ini sama dengan `VITE_API_BASE_URL` di frontend.

## Jika Masih Bermasalah

Kirimkan informasi berikut:
1. Output dari `npm run deploy`
2. URL backend Cloudflare Workers
3. Screenshot error di browser console (F12 > Console)
4. Response dari `curl https://your-backend-url/api/settings`
