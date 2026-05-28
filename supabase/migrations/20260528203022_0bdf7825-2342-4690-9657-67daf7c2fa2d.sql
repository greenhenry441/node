
-- 1. Add a workspace-wide join code (no email required)
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS join_code TEXT;

-- Backfill join codes for existing workspaces
UPDATE public.workspaces
SET join_code = lower(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 10))
WHERE join_code IS NULL;

ALTER TABLE public.workspaces
  ALTER COLUMN join_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS workspaces_join_code_key ON public.workspaces(join_code);

-- 2. Workspace messages (chat / comments)
CREATE TABLE IF NOT EXISTS public.workspace_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspace_messages_ws_created_idx
  ON public.workspace_messages(workspace_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.workspace_messages TO authenticated;
GRANT ALL ON public.workspace_messages TO service_role;

ALTER TABLE public.workspace_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view workspace messages"
  ON public.workspace_messages FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Members post workspace messages"
  ON public.workspace_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_workspace_member(workspace_id, auth.uid())
    AND user_id = auth.uid()
  );

CREATE POLICY "Author or admin deletes message"
  ON public.workspace_messages FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.workspace_role_of(workspace_id, auth.uid()) IN ('owner', 'admin')
  );

-- Enable realtime
ALTER TABLE public.workspace_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_messages;
