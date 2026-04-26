create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('owner', 'manager', 'karyawan');
  end if;
  if not exists (select 1 from pg_type where typname = 'salary_type') then
    create type public.salary_type as enum ('harian', 'bulanan');
  end if;
  if not exists (select 1 from pg_type where typname = 'employee_status') then
    create type public.employee_status as enum ('aktif', 'nonaktif');
  end if;
  if not exists (select 1 from pg_type where typname = 'attendance_status') then
    create type public.attendance_status as enum ('hadir', 'telat', 'izin', 'alpha');
  end if;
  if not exists (select 1 from pg_type where typname = 'payroll_status') then
    create type public.payroll_status as enum ('draft', 'processed', 'paid');
  end if;
  if not exists (select 1 from pg_type where typname = 'purchase_status') then
    create type public.purchase_status as enum ('draft', 'confirmed', 'cancelled');
  end if;
end $$;

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Bisnis Anda',
  latitude numeric(10, 7) not null default 0,
  longitude numeric(10, 7) not null default 0,
  attendance_radius_meters integer not null default 100,
  work_start_time time not null default '08:00:00',
  tolerance_minutes integer not null default 15,
  timezone text not null default 'Asia/Jakarta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text not null default '',
  nik text,
  phone text,
  address text,
  photo_url text,
  role public.app_role not null default 'karyawan',
  joined_at date not null default current_date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jobdesks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  position text,
  salary_type public.salary_type not null default 'bulanan',
  base_salary numeric(14, 2) not null default 0,
  allowance numeric(14, 2) not null default 0,
  default_deduction numeric(14, 2) not null default 0,
  join_date date not null default current_date,
  status public.employee_status not null default 'aktif',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_jobdesks (
  employee_id uuid not null references public.employees(id) on delete cascade,
  jobdesk_id uuid not null references public.jobdesks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (employee_id, jobdesk_id)
);

create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  qr_token uuid not null unique default gen_random_uuid(),
  expires_at timestamptz not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  session_id uuid references public.attendance_sessions(id) on delete set null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  status public.attendance_status not null default 'hadir',
  permission_reason text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  distance_meters numeric(10, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fine_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  amount numeric(14, 2) not null default 0,
  is_auto boolean not null default false,
  trigger_type text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_fines (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  fine_type_id uuid references public.fine_types(id) on delete set null,
  amount numeric(14, 2) not null default 0,
  reason text,
  date date not null default current_date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  month integer not null check (month between 1 and 12),
  year integer not null check (year between 2024 and 2100),
  status public.payroll_status not null default 'draft',
  processed_at timestamptz,
  processed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (month, year)
);

create table if not exists public.payroll_details (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.payroll_periods(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  base_salary numeric(14, 2) not null default 0,
  allowance numeric(14, 2) not null default 0,
  total_fines numeric(14, 2) not null default 0,
  deductions numeric(14, 2) not null default 0,
  net_salary numeric(14, 2) not null default 0,
  is_paid boolean not null default false,
  paid_at timestamptz,
  paid_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (period_id, employee_id)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_phone text,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  unit text not null,
  current_stock numeric(14, 2) not null default 0,
  min_stock numeric(14, 2) not null default 0,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.supplier_items (
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  price numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  primary key (supplier_id, item_id)
);

create table if not exists public.stock_purchases (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  date date not null default current_date,
  total_amount numeric(14, 2) not null default 0,
  status public.purchase_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.stock_purchases(id) on delete cascade,
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  qty numeric(14, 2) not null default 0,
  unit_price numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.stock_usages (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete restrict,
  qty numeric(14, 2) not null default 0,
  reason text not null,
  used_by uuid references public.employees(id) on delete set null,
  date date not null default current_date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_employees_profile_id on public.employees(profile_id);
create index if not exists idx_attendance_logs_employee_date on public.attendance_logs(employee_id, check_in_at);
create index if not exists idx_employee_fines_employee_date on public.employee_fines(employee_id, date);
create index if not exists idx_payroll_details_period on public.payroll_details(period_id);
create index if not exists idx_inventory_items_category on public.inventory_items(category_id);
create index if not exists idx_stock_purchases_supplier_date on public.stock_purchases(supplier_id, date);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

create or replace function public.current_employee_id()
returns uuid
language sql
stable
as $$
  select id from public.employees where profile_id = auth.uid()
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
  select public.current_role() = 'owner'
$$;

create or replace function public.is_manager_or_owner()
returns boolean
language sql
stable
as $$
  select public.current_role() in ('owner', 'manager')
$$;

drop trigger if exists profiles_handle_updated_at on public.profiles;
create trigger profiles_handle_updated_at before update on public.profiles
for each row execute function public.handle_updated_at();

drop trigger if exists jobdesks_handle_updated_at on public.jobdesks;
create trigger jobdesks_handle_updated_at before update on public.jobdesks
for each row execute function public.handle_updated_at();

drop trigger if exists employees_handle_updated_at on public.employees;
create trigger employees_handle_updated_at before update on public.employees
for each row execute function public.handle_updated_at();

drop trigger if exists attendance_logs_handle_updated_at on public.attendance_logs;
create trigger attendance_logs_handle_updated_at before update on public.attendance_logs
for each row execute function public.handle_updated_at();

drop trigger if exists fine_types_handle_updated_at on public.fine_types;
create trigger fine_types_handle_updated_at before update on public.fine_types
for each row execute function public.handle_updated_at();

drop trigger if exists payroll_periods_handle_updated_at on public.payroll_periods;
create trigger payroll_periods_handle_updated_at before update on public.payroll_periods
for each row execute function public.handle_updated_at();

drop trigger if exists payroll_details_handle_updated_at on public.payroll_details;
create trigger payroll_details_handle_updated_at before update on public.payroll_details
for each row execute function public.handle_updated_at();

drop trigger if exists customers_handle_updated_at on public.customers;
create trigger customers_handle_updated_at before update on public.customers
for each row execute function public.handle_updated_at();

drop trigger if exists categories_handle_updated_at on public.categories;
create trigger categories_handle_updated_at before update on public.categories
for each row execute function public.handle_updated_at();

drop trigger if exists suppliers_handle_updated_at on public.suppliers;
create trigger suppliers_handle_updated_at before update on public.suppliers
for each row execute function public.handle_updated_at();

drop trigger if exists inventory_items_handle_updated_at on public.inventory_items;
create trigger inventory_items_handle_updated_at before update on public.inventory_items
for each row execute function public.handle_updated_at();

drop trigger if exists stock_purchases_handle_updated_at on public.stock_purchases;
create trigger stock_purchases_handle_updated_at before update on public.stock_purchases
for each row execute function public.handle_updated_at();

drop trigger if exists business_settings_handle_updated_at on public.business_settings;
create trigger business_settings_handle_updated_at before update on public.business_settings
for each row execute function public.handle_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.business_settings (business_name, latitude, longitude, attendance_radius_meters, work_start_time, tolerance_minutes, timezone)
select 'Bisnis Anda', 0, 0, 100, '08:00:00', 15, 'Asia/Jakarta'
where not exists (select 1 from public.business_settings);

insert into public.jobdesks (name, description)
values
  ('Kasir', 'Menangani pembayaran dan pelayanan transaksi.'),
  ('Barista', 'Menyiapkan minuman dan menjaga area kerja.'),
  ('Supervisor', 'Memantau operasional harian dan tim.')
on conflict (name) do nothing;

insert into public.fine_types (name, amount, is_auto, trigger_type)
values
  ('Telat masuk', 10000, true, 'late'),
  ('Alpha tanpa keterangan', 50000, true, 'alpha'),
  ('Pelanggaran SOP', 0, false, 'sop')
on conflict (name) do nothing;

insert into public.categories (name)
values
  ('Bahan Baku'),
  ('Kemasan'),
  ('Kebersihan'),
  ('Peralatan')
on conflict (name) do nothing;

alter table public.business_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.jobdesks enable row level security;
alter table public.employees enable row level security;
alter table public.employee_jobdesks enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.fine_types enable row level security;
alter table public.employee_fines enable row level security;
alter table public.payroll_periods enable row level security;
alter table public.payroll_details enable row level security;
alter table public.customers enable row level security;
alter table public.categories enable row level security;
alter table public.suppliers enable row level security;
alter table public.inventory_items enable row level security;
alter table public.supplier_items enable row level security;
alter table public.stock_purchases enable row level security;
alter table public.stock_purchase_items enable row level security;
alter table public.stock_usages enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
for select using (
  auth.uid() = id or public.is_manager_or_owner()
);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
for update using (
  auth.uid() = id or public.is_owner()
)
with check (
  auth.uid() = id or public.is_owner()
);

drop policy if exists "profiles_insert_owner" on public.profiles;
create policy "profiles_insert_owner" on public.profiles
for insert with check (public.is_owner());

drop policy if exists "business_settings_select" on public.business_settings;
create policy "business_settings_select" on public.business_settings
for select using (auth.role() = 'authenticated');

drop policy if exists "business_settings_update_owner" on public.business_settings;
create policy "business_settings_update_owner" on public.business_settings
for all using (public.is_owner()) with check (public.is_owner());

drop policy if exists "jobdesks_select" on public.jobdesks;
create policy "jobdesks_select" on public.jobdesks
for select using (auth.role() = 'authenticated');

drop policy if exists "jobdesks_manage" on public.jobdesks;
create policy "jobdesks_manage" on public.jobdesks
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "employees_select" on public.employees;
create policy "employees_select" on public.employees
for select using (
  public.is_manager_or_owner() or profile_id = auth.uid()
);

drop policy if exists "employees_manage" on public.employees;
create policy "employees_manage" on public.employees
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "employee_jobdesks_select" on public.employee_jobdesks;
create policy "employee_jobdesks_select" on public.employee_jobdesks
for select using (
  public.is_manager_or_owner() or employee_id = public.current_employee_id()
);

drop policy if exists "employee_jobdesks_manage" on public.employee_jobdesks;
create policy "employee_jobdesks_manage" on public.employee_jobdesks
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "attendance_sessions_select" on public.attendance_sessions;
create policy "attendance_sessions_select" on public.attendance_sessions
for select using (
  public.is_manager_or_owner() or expires_at >= now()
);

drop policy if exists "attendance_sessions_manage" on public.attendance_sessions;
create policy "attendance_sessions_manage" on public.attendance_sessions
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "attendance_logs_select" on public.attendance_logs;
create policy "attendance_logs_select" on public.attendance_logs
for select using (
  public.is_manager_or_owner() or employee_id = public.current_employee_id()
);

drop policy if exists "attendance_logs_insert" on public.attendance_logs;
create policy "attendance_logs_insert" on public.attendance_logs
for insert with check (
  public.is_manager_or_owner() or employee_id = public.current_employee_id()
);

drop policy if exists "attendance_logs_update" on public.attendance_logs;
create policy "attendance_logs_update" on public.attendance_logs
for update using (
  public.is_manager_or_owner() or employee_id = public.current_employee_id()
)
with check (
  public.is_manager_or_owner() or employee_id = public.current_employee_id()
);

drop policy if exists "fine_types_select" on public.fine_types;
create policy "fine_types_select" on public.fine_types
for select using (public.is_manager_or_owner());

drop policy if exists "fine_types_manage" on public.fine_types;
create policy "fine_types_manage" on public.fine_types
for all using (public.is_owner()) with check (public.is_owner());

drop policy if exists "employee_fines_select" on public.employee_fines;
create policy "employee_fines_select" on public.employee_fines
for select using (
  public.is_manager_or_owner() or employee_id = public.current_employee_id()
);

drop policy if exists "employee_fines_manage" on public.employee_fines;
create policy "employee_fines_manage" on public.employee_fines
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "payroll_periods_select" on public.payroll_periods;
create policy "payroll_periods_select" on public.payroll_periods
for select using (public.is_manager_or_owner());

drop policy if exists "payroll_periods_manage" on public.payroll_periods;
create policy "payroll_periods_manage" on public.payroll_periods
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "payroll_details_select" on public.payroll_details;
create policy "payroll_details_select" on public.payroll_details
for select using (
  public.is_manager_or_owner() or employee_id = public.current_employee_id()
);

drop policy if exists "payroll_details_insert" on public.payroll_details;
create policy "payroll_details_insert" on public.payroll_details
for insert with check (public.is_manager_or_owner());

drop policy if exists "payroll_details_update_owner" on public.payroll_details;
create policy "payroll_details_update_owner" on public.payroll_details
for update using (public.is_owner()) with check (public.is_owner());

drop policy if exists "customers_manage" on public.customers;
create policy "customers_manage" on public.customers
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories
for select using (public.is_manager_or_owner());

drop policy if exists "categories_manage" on public.categories;
create policy "categories_manage" on public.categories
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "suppliers_manage" on public.suppliers;
create policy "suppliers_manage" on public.suppliers
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "inventory_items_manage" on public.inventory_items;
create policy "inventory_items_manage" on public.inventory_items
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "supplier_items_manage" on public.supplier_items;
create policy "supplier_items_manage" on public.supplier_items
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "stock_purchases_manage" on public.stock_purchases;
create policy "stock_purchases_manage" on public.stock_purchases
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "stock_purchase_items_manage" on public.stock_purchase_items;
create policy "stock_purchase_items_manage" on public.stock_purchase_items
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "stock_usages_manage" on public.stock_usages;
create policy "stock_usages_manage" on public.stock_usages
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

insert into storage.buckets (id, name, public)
values
  ('profile-photos', 'profile-photos', true),
  ('inventory-items', 'inventory-items', true),
  ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "profile_photos_read" on storage.objects;
create policy "profile_photos_read" on storage.objects
for select using (bucket_id = 'profile-photos');

drop policy if exists "profile_photos_insert" on storage.objects;
create policy "profile_photos_insert" on storage.objects
for insert with check (
  bucket_id = 'profile-photos'
  and (
    public.is_manager_or_owner()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "profile_photos_update" on storage.objects;
create policy "profile_photos_update" on storage.objects
for update using (
  bucket_id = 'profile-photos'
  and (
    public.is_manager_or_owner()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "inventory_items_read" on storage.objects;
create policy "inventory_items_read" on storage.objects
for select using (bucket_id = 'inventory-items');

drop policy if exists "inventory_items_write" on storage.objects;
create policy "inventory_items_write" on storage.objects
for all using (
  bucket_id = 'inventory-items' and public.is_manager_or_owner()
)
with check (
  bucket_id = 'inventory-items' and public.is_manager_or_owner()
);

drop policy if exists "documents_manage" on storage.objects;
create policy "documents_manage" on storage.objects
for all using (
  bucket_id = 'documents' and public.is_manager_or_owner()
)
with check (
  bucket_id = 'documents' and public.is_manager_or_owner()
);
