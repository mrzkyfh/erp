-- ALTERNATIF: Jalankan dalam 2 QUERY TERPISAH di Supabase SQL Editor

-- ========================================
-- QUERY 1: Tambah enum value (jalankan dulu)
-- ========================================
do $$
begin
  if not exists (
    select 1 from pg_enum 
    where enumlabel = 'per_jam_lembur' 
    and enumtypid = 'public.salary_unit'::regtype
  ) then
    alter type public.salary_unit add value 'per_jam_lembur';
  end if;
end $$;

-- ========================================
-- QUERY 2: Update data (jalankan setelah Query 1 berhasil)
-- ========================================
-- Update existing 'Uang Lembur' to use new unit
update public.salary_types 
set unit = 'per_jam_lembur' 
where name = 'Uang Lembur';

-- Add comment
comment on type public.salary_unit is 'Unit perhitungan gaji: per_kehadiran (per hari hadir), per_jam (per jam kerja reguler), per_jam_lembur (per jam lembur approved), fixed (tetap bulanan)';
