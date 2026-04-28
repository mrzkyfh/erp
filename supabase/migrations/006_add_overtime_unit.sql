-- Add per_jam_lembur unit to salary_unit enum
-- Note: Enum values must be added in a separate transaction

-- 1. Add new value to enum
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

-- 2. Commit is implicit here, so we can now use the new value

-- 3. Update existing 'Uang Lembur' to use new unit (if exists)
update public.salary_types 
set unit = 'per_jam_lembur' 
where name = 'Uang Lembur';

-- 4. Add comment
comment on type public.salary_unit is 'Unit perhitungan gaji: per_kehadiran (per hari hadir), per_jam (per jam kerja reguler), per_jam_lembur (per jam lembur approved), fixed (tetap bulanan)';
