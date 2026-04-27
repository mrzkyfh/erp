-- Allow employees to view inventory categories
drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories
for select using (auth.role() = 'authenticated');

-- Allow employees to view inventory items
drop policy if exists "inventory_items_select" on public.inventory_items;
create policy "inventory_items_select" on public.inventory_items
for select using (auth.role() = 'authenticated');

-- Allow employees to view suppliers (needed for overview)
drop policy if exists "suppliers_select" on public.suppliers;
create policy "suppliers_select" on public.suppliers
for select using (auth.role() = 'authenticated');

-- Allow employees to manage their own stock usages
drop policy if exists "stock_usages_select" on public.stock_usages;
create policy "stock_usages_select" on public.stock_usages
for select using (auth.role() = 'authenticated');

drop policy if exists "stock_usages_insert" on public.stock_usages;
create policy "stock_usages_insert" on public.stock_usages
for insert with check (auth.role() = 'authenticated');

-- Update manage policies to still restrict write access to owner/manager
drop policy if exists "inventory_items_manage" on public.inventory_items;
create policy "inventory_items_manage" on public.inventory_items
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());

drop policy if exists "suppliers_manage" on public.suppliers;
create policy "suppliers_manage" on public.suppliers
for all using (public.is_manager_or_owner()) with check (public.is_manager_or_owner());
