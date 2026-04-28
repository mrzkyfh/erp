-- Migration: Overtime System
-- Sistem absensi lembur terpisah dari absensi reguler

-- 1. Create overtime_logs table
create table if not exists public.overtime_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  date date not null default current_date,
  start_time timestamptz not null,
  end_time timestamptz,
  total_hours numeric(10, 2) default 0,
  reason text,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create indexes
create index if not exists idx_overtime_logs_employee_date on public.overtime_logs(employee_id, date);
create index if not exists idx_overtime_logs_status on public.overtime_logs(status);

-- 3. Create trigger for updated_at
drop trigger if exists overtime_logs_handle_updated_at on public.overtime_logs;
create trigger overtime_logs_handle_updated_at before update on public.overtime_logs
for each row execute function public.handle_updated_at();

-- 4. Enable RLS
alter table public.overtime_logs enable row level security;

-- 5. RLS Policies
drop policy if exists "overtime_logs_select" on public.overtime_logs;
create policy "overtime_logs_select" on public.overtime_logs
for select using (
  public.is_manager_or_owner() or employee_id = public.current_employee_id()
);

drop policy if exists "overtime_logs_insert" on public.overtime_logs;
create policy "overtime_logs_insert" on public.overtime_logs
for insert with check (
  public.is_manager_or_owner() or employee_id = public.current_employee_id()
);

drop policy if exists "overtime_logs_update" on public.overtime_logs;
create policy "overtime_logs_update" on public.overtime_logs
for update using (
  public.is_manager_or_owner() or employee_id = public.current_employee_id()
)
with check (
  public.is_manager_or_owner() or employee_id = public.current_employee_id()
);

drop policy if exists "overtime_logs_delete_owner" on public.overtime_logs;
create policy "overtime_logs_delete_owner" on public.overtime_logs
for delete using (public.is_owner());

-- 6. Add comment
comment on table public.overtime_logs is 'Catatan lembur karyawan terpisah dari absensi reguler';
comment on column public.overtime_logs.total_hours is 'Total jam lembur dihitung otomatis dari start_time dan end_time';
comment on column public.overtime_logs.status is 'Status approval: pending, approved, rejected';
