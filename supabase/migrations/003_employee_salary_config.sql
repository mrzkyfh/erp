-- Migration: Per-Employee Salary Config
create table if not exists public.employee_salary_components (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  salary_type_id uuid not null references public.salary_types(id) on delete cascade,
  amount numeric(14, 2) not null, -- Custom amount for this specific employee
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, salary_type_id)
);

-- Trigger to update updated_at
create trigger handle_updated_at_employee_salary_components
  before update on public.employee_salary_components
  for each row execute function public.handle_updated_at();
