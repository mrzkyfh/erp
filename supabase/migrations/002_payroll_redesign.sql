-- Payroll Redesign Migration
-- 1. Create enum for salary units
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'salary_unit') then
    create type public.salary_unit as enum ('per_kehadiran', 'per_jam', 'fixed');
  end if;
end $$;

-- 2. Create salary_types table
create table if not exists public.salary_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  amount numeric(14, 2) not null default 0,
  unit public.salary_unit not null default 'fixed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create payroll_items table to store breakdown
create table if not exists public.payroll_items (
  id uuid primary key default gen_random_uuid(),
  payroll_detail_id uuid not null references public.payroll_details(id) on delete cascade,
  salary_type_id uuid references public.salary_types(id) on delete set null,
  name text not null,
  amount numeric(14, 2) not null,
  unit public.salary_unit not null,
  count numeric(14, 2) not null default 1,
  total_amount numeric(14, 2) not null,
  created_at timestamptz not null default now()
);

-- 4. Clean up old fine tables (optional, keep data? user said "hapus fitur denda")
drop table if exists public.employee_fines;
drop table if exists public.fine_types;

-- 5. Update payroll_details to remove total_fines and add metadata if needed
alter table public.payroll_details drop column if exists total_fines;
alter table public.payroll_details add column if not exists total_allowances numeric(14, 2) not null default 0;


-- 6. Insert default salary types based on image
insert into public.salary_types (name, amount, unit) values

('Uang Makan', 15000, 'per_kehadiran'),
('Uang Transport', 15000, 'per_kehadiran'),
('Uang Lembur', 8000, 'per_jam'),
('Gaji Pokok (Harian)', 33400, 'per_kehadiran')
on conflict (name) do update set amount = excluded.amount, unit = excluded.unit;
