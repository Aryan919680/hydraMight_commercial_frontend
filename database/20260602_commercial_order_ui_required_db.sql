-- HydraMight Commercial Ecom UI required DB alignment

alter table public.user_profiles
add column if not exists customer_type text default 'household';

alter table public.user_profiles
add column if not exists status text default 'active';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_profiles_customer_type_check'
  ) then
    alter table public.user_profiles
    add constraint user_profiles_customer_type_check
    check (customer_type in ('household', 'commercial'));
  end if;
end $$;

create table if not exists public.commercial_customers (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid unique references public.user_profiles(id) on delete cascade,
  business_name text not null,
  contact_person text not null,
  gst_number text,
  email text not null,
  phone text,
  address jsonb,
  status text not null default 'pending',
  approved_by uuid null,
  approved_at timestamptz null,
  rejected_reason text null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint commercial_customers_status_check
  check (status in ('pending', 'approved', 'rejected', 'blocked'))
);

create index if not exists idx_commercial_customers_user_profile_id
on public.commercial_customers(user_profile_id);

create index if not exists idx_commercial_customers_status
on public.commercial_customers(status);

alter table public.sales_orders
add column if not exists customer_type text default 'household';

alter table public.sales_orders
add column if not exists commercial_customer_id uuid null
references public.commercial_customers(id);

alter table public.sales_orders
add column if not exists business_name text null;

alter table public.sales_orders
add column if not exists gst_number text null;

alter table public.sales_orders
add column if not exists contact_person text null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sales_orders_customer_type_check'
  ) then
    alter table public.sales_orders
    add constraint sales_orders_customer_type_check
    check (customer_type in ('household', 'commercial'));
  end if;
end $$;

create index if not exists idx_sales_orders_customer_type
on public.sales_orders(customer_type);

create index if not exists idx_sales_orders_commercial_customer_id
on public.sales_orders(commercial_customer_id);

create index if not exists idx_sales_orders_customer_channel
on public.sales_orders(customer_id, channel, sub_channel);

-- customer_product_listing must expose commercial products using this shape:
-- id, name, slug, sku, ecom_channel, mrp, selling_price, currency,
-- service_location_id, available_stock, is_out_of_stock, primary_image, images
-- If product channel is stored as products.portal_type, map it in view as:
-- p.portal_type as ecom_channel
