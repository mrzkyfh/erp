-- Ensure overtime salary component exists
-- This migration ensures that the "Upah Lembur" component is available

-- 1. Check and insert if not exists
INSERT INTO public.salary_types (name, unit, amount)
SELECT 
  'Upah Lembur',
  'per_jam_lembur'::salary_unit,
  50000 -- Default Rp50.000 per jam
WHERE NOT EXISTS (
  SELECT 1 FROM public.salary_types WHERE unit = 'per_jam_lembur'
);

-- 2. Update existing if name exists but unit is wrong
UPDATE public.salary_types 
SET unit = 'per_jam_lembur'
WHERE name ILIKE '%lembur%' 
  AND unit != 'per_jam_lembur';

-- 3. Verify
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.salary_types WHERE unit = 'per_jam_lembur') THEN
    RAISE NOTICE '✅ Komponen Upah Lembur sudah tersedia';
  ELSE
    RAISE EXCEPTION '❌ Gagal menambahkan komponen Upah Lembur';
  END IF;
END $$;
