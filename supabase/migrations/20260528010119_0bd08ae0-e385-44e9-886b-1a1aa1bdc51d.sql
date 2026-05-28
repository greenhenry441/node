
-- New per-file cap: 15 GB
CREATE OR REPLACE FUNCTION public.max_file_bytes()
RETURNS bigint
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$ SELECT bigint '16106127360' $$;

-- New plan caps
CREATE OR REPLACE FUNCTION public.plan_cap_bytes(_plan subscription_plan)
RETURNS bigint
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$
  SELECT CASE _plan
    WHEN 'free'    THEN bigint '536870912000'      -- 500 GB
    WHEN 'starter' THEN bigint '1099511627776'     -- 1 TB
    WHEN 'steady'  THEN bigint '5497558138880'     -- 5 TB
    WHEN 'suite'   THEN NULL                       -- unlimited
  END;
$$;

-- Bucket-level limit so direct Storage API uploads also reject >15 GB
UPDATE storage.buckets SET file_size_limit = 16106127360 WHERE id = 'user-files';
