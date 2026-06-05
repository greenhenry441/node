-- Remove default PUBLIC execute grant from internal trigger/helper functions
REVOKE EXECUTE ON FUNCTION public.touch_business_profiles_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_storage_quota() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.provision_subscription() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.seed_default_statuses() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_owner_as_member() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bump_topic_on_reply() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.max_file_bytes() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.plan_cap_bytes(public.subscription_plan) FROM PUBLIC;

-- RLS helper functions: block anon, allow only authenticated (needed for policy evaluation)
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.workspace_role_of(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.workspace_role_of(uuid, uuid) TO authenticated;