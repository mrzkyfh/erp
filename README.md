# ERP Mini UMKM Indonesia

Sistem manajemen bisnis berbasis React, Express, dan Supabase untuk kebutuhan absensi, penggajian, inventori, karyawan, dan konsumen.

## Struktur

```text
frontend/   Aplikasi React + Vite + Tailwind
backend/    REST API Express + service bisnis
supabase/   Migrasi SQL, RLS, dan seed dasar
```

## Alur Implementasi

1. Jalankan migrasi SQL di Supabase.
2. Isi `.env` pada `frontend` dan `backend`.
3. Install dependency pada masing-masing folder.
4. Jalankan frontend dan backend secara terpisah.

Dokumentasi setup lengkap tersedia di [supabase/migrations/001_init.sql](/C:/Users/kiki/Documents/New%20project%202/supabase/migrations/001_init.sql) dan file `.env.example`.

