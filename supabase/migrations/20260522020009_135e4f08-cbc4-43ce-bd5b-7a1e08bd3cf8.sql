
create table public.business_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_name text,
  industry text,
  team_size text,
  location text,
  products_services text,
  target_customers text,
  goals text,
  current_tools text,
  notes text,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_profiles enable row level security;

create policy "Users view own business profile"
  on public.business_profiles for select
  using (auth.uid() = user_id);

create policy "Users insert own business profile"
  on public.business_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users update own business profile"
  on public.business_profiles for update
  using (auth.uid() = user_id);

create or replace function public.touch_business_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_business_profiles_updated_at
before update on public.business_profiles
for each row execute function public.touch_business_profiles_updated_at();
