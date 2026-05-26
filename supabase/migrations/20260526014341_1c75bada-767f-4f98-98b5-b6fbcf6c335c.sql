
-- Fix mutable search_path on the two pure helpers
create or replace function public.plan_cap_bytes(_plan public.subscription_plan)
returns bigint
language sql
immutable
set search_path = public
as $$
  select case _plan
    when 'free'    then bigint '107374182400'
    when 'starter' then bigint '536870912000'
    when 'steady'  then bigint '1099511627776'
    when 'suite'   then null
  end;
$$;

create or replace function public.max_file_bytes()
returns bigint language sql immutable set search_path = public
as $$ select bigint '26214400' $$;

-- Trigger functions should not be exposed via PostgREST
revoke execute on function public.enforce_storage_quota() from public, anon, authenticated;
revoke execute on function public.provision_subscription() from public, anon, authenticated;
