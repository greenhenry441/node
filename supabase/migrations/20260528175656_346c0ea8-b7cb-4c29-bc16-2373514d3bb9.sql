-- Prevent privilege escalation on workspace_members
-- Only owners/admins may update member rows, and never their own role,
-- and admins cannot modify owner rows.
CREATE POLICY "Owners/admins update members (no self role change)"
ON public.workspace_members
FOR UPDATE
TO authenticated
USING (
  public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin')
  AND user_id <> auth.uid()
  AND NOT (
    public.workspace_role_of(workspace_id, auth.uid()) = 'admin'
    AND role = 'owner'
  )
)
WITH CHECK (
  public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin')
  AND user_id <> auth.uid()
  AND NOT (
    public.workspace_role_of(workspace_id, auth.uid()) = 'admin'
    AND role = 'owner'
  )
);