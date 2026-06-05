-- 1. Contact messages: explicit deny-read policy (documents intent, prevents accidental exposure)
DROP POLICY IF EXISTS "No one can read contact messages" ON public.contact_messages;
CREATE POLICY "No one can read contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated, anon
USING (false);

-- 2. Storage policies for workspace-shared files stored under ws/{workspaceId}/...
DROP POLICY IF EXISTS "Workspace members read ws files" ON storage.objects;
CREATE POLICY "Workspace members read ws files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-files'
  AND (storage.foldername(name))[1] = 'ws'
  AND public.is_workspace_member(((storage.foldername(name))[2])::uuid, auth.uid())
);

DROP POLICY IF EXISTS "Workspace members upload ws files" ON storage.objects;
CREATE POLICY "Workspace members upload ws files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-files'
  AND (storage.foldername(name))[1] = 'ws'
  AND public.is_workspace_member(((storage.foldername(name))[2])::uuid, auth.uid())
);

DROP POLICY IF EXISTS "Workspace members update ws files" ON storage.objects;
CREATE POLICY "Workspace members update ws files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-files'
  AND (storage.foldername(name))[1] = 'ws'
  AND public.is_workspace_member(((storage.foldername(name))[2])::uuid, auth.uid())
)
WITH CHECK (
  bucket_id = 'user-files'
  AND (storage.foldername(name))[1] = 'ws'
  AND public.is_workspace_member(((storage.foldername(name))[2])::uuid, auth.uid())
);

DROP POLICY IF EXISTS "Workspace members delete ws files" ON storage.objects;
CREATE POLICY "Workspace members delete ws files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-files'
  AND (storage.foldername(name))[1] = 'ws'
  AND public.is_workspace_member(((storage.foldername(name))[2])::uuid, auth.uid())
);

-- 3. Realtime authorization: only workspace members can subscribe to a workspace's channel
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workspace members receive ws realtime" ON realtime.messages;
CREATE POLICY "Workspace members receive ws realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  topic LIKE 'ws-messages-%'
  AND public.is_workspace_member(
    NULLIF(split_part(topic, 'ws-messages-', 2), '')::uuid,
    auth.uid()
  )
);

-- 4. Lock down internal trigger/helper SECURITY DEFINER functions from direct API execution.
--    (is_workspace_member and workspace_role_of are intentionally left executable — they are
--     required by RLS policy evaluation for signed-in users.)
REVOKE EXECUTE ON FUNCTION public.touch_business_profiles_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_storage_quota() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.provision_subscription() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_default_statuses() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_owner_as_member() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.bump_topic_on_reply() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.max_file_bytes() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.plan_cap_bytes(public.subscription_plan) FROM anon, authenticated;