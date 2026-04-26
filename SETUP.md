# Setup Proyek

## 1. Supabase

1. Buat project Supabase baru.
2. Buka SQL Editor lalu jalankan [001_init.sql](/C:/Users/kiki/Documents/New%20project%202/supabase/migrations/001_init.sql).
3. Buka `Authentication > Users` untuk membuat user owner pertama.
4. Setelah user owner pertama dibuat, ubah rolenya menjadi `owner` pada tabel `profiles`.
5. Isi `business_settings.latitude` dan `business_settings.longitude` dengan koordinat lokasi bisnis.

## 2. Frontend

1. Salin `frontend/.env.example` menjadi `.env`.
2. Isi `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, dan `VITE_API_BASE_URL`.
3. Install dependency:

```bash
cd frontend
npm install
npm run dev
```

## 3. Backend

1. Salin `backend/.env.example` menjadi `.env`.
2. Isi `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, dan `FRONTEND_URL`.
   - `SUPABASE_SERVICE_ROLE_KEY` bisa didapat dari Supabase Dashboard → Project Settings → API → **service_role** key.
   - ⚠️ Service role key berbeda dengan anon key. Jangan gunakan anon key untuk service role.
3. Jalankan:

```bash
cd backend
npm install
npm run dev
```

## 4. Deploy

- Frontend: Cloudflare Pages dengan build command `npm run build` dan output `dist`.
- Backend: Railway atau Render, start command `npm start`.
- Pastikan semua env var production sesuai dengan project Supabase production.

## Catatan

- Format mata uang pada UI sudah menggunakan Rupiah.
- Format tanggal pada UI menggunakan `DD/MM/YYYY`.
- Timezone backend diset ke `Asia/Jakarta`.
- Untuk produksi, pertimbangkan menambahkan migration terpisah untuk stored procedure payroll agar update multi-tabel lebih atomik.
