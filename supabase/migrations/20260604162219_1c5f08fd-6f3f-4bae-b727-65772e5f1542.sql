ALTER TABLE public.user_files ADD COLUMN IF NOT EXISTS workspace_id uuid;

CREATE INDEX IF NOT EXISTS user_files_workspace_id_idx ON public.user_files (workspace_id);

-- Workspace members can view files that belong to their workspace
CREATE POLICY "Members view workspace files"
  ON public.user_files FOR SELECT
  TO authenticated
  USING (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id, auth.uid()));

-- Workspace members can add files to a workspace (uploader is the owner row)
CREATE POLICY "Members insert workspace files"
  ON public.user_files FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IS NOT NULL
    AND auth.uid() = user_id
    AND public.is_workspace_member(workspace_id, auth.uid())
  );

-- Workspace members can edit metadata of workspace files
CREATE POLICY "Members update workspace files"
  ON public.user_files FOR UPDATE
  TO authenticated
  USING (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id, auth.uid()));

-- Workspace members can delete workspace files
CREATE POLICY "Members delete workspace files"
  ON public.user_files FOR DELETE
  TO authenticated
  USING (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id, auth.uid()));