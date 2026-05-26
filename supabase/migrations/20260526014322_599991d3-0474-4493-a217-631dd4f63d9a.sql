
-- Plan enum
create type public.subscription_plan as enum ('free', 'starter', 'steady', 'suite');

-- Subscriptions table
create table public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan public.subscription_plan not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

create policy "Users view own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users insert own subscription"
  on public.user_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users update own subscription"
  on public.user_subscriptions for update
  using (auth.uid() = user_id);

create trigger touch_user_subscriptions
  before update on public.user_subscriptions
  for each row execute function public.touch_business_profiles_updated_at();

-- Files metadata table
create table public.user_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  name text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  mime_type text,
  created_at timestamptz not null default now()
);

create index user_files_user_id_created_at_idx
  on public.user_files (user_id, created_at desc);

alter table public.user_files enable row level security;

create policy "Users view own files"
  on public.user_files for select
  using (auth.uid() = user_id);

create policy "Users insert own files"
  on public.user_files for insert
  with check (auth.uid() = user_id);

create policy "Users delete own files"
  on public.user_files for delete
  using (auth.uid() = user_id);

-- Plan cap helper (null = unlimited)
create or replace function public.plan_cap_bytes(_plan public.subscription_plan)
returns bigint
language sql
immutable
as $$
  select case _plan
    when 'free'    then bigint '107374182400'    -- 100 GB
    when 'starter' then bigint '536870912000'    -- 500 GB
    when 'steady'  then bigint '1099511627776'   -- 1 TB
    when 'suite'   then null                     -- unlimited
  end;
$$;

-- Per-file ceiling (worker request body safety)
create or replace function public.max_file_bytes()
returns bigint language sql immutable as $$ select bigint '26214400' $$;  -- 25 MB

-- Quota enforcement trigger
create or replace function public.enforce_storage_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_plan public.subscription_plan;
  cap bigint;
  used bigint;
begin
  if new.size_bytes > public.max_file_bytes() then
    raise exception 'file_too_large' using errcode = 'check_violation';
  end if;

  select plan into current_plan from public.user_subscriptions where user_id = new.user_id;
  if current_plan is null then
    insert into public.user_subscriptions (user_id, plan) values (new.user_id, 'free');
    current_plan := 'free';
  end if;

  cap := public.plan_cap_bytes(current_plan);
  if cap is null then
    return new; -- unlimited
  end if;

  select coalesce(sum(size_bytes), 0) into used
    from public.user_files where user_id = new.user_id;

  if used + new.size_bytes > cap then
    raise exception 'storage_quota_exceeded' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger enforce_storage_quota_before_insert
  before insert on public.user_files
  for each row execute function public.enforce_storage_quota();

-- Auto-provision Free plan on signup
create or replace function public.provision_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_subscriptions (user_id, plan)
  values (new.id, 'free')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_provision_subscription
  after insert on auth.users
  for each row execute function public.provision_subscription();

-- Storage bucket (private)
insert into storage.buckets (id, name, public)
values ('user-files', 'user-files', false)
on conflict (id) do nothing;

-- Storage RLS: users can only touch objects under their own user_id/ folder
create policy "Users read own user-files"
  on storage.objects for select
  using (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users upload own user-files"
  on storage.objects for insert
  with check (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own user-files"
  on storage.objects for delete
  using (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
