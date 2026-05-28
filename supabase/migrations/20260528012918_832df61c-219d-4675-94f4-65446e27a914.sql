
-- Roles enum
DO $$ BEGIN
  CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Workspaces
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{3,40}$'),
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Members
CREATE TABLE public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role public.workspace_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);
CREATE INDEX idx_workspace_members_user ON public.workspace_members(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Invites
CREATE TABLE public.workspace_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254),
  role public.workspace_role NOT NULL DEFAULT 'member',
  code TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '14 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_workspace_invites_workspace ON public.workspace_invites(workspace_id);
CREATE INDEX idx_workspace_invites_email ON public.workspace_invites(lower(email));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_invites TO authenticated;
GRANT ALL ON public.workspace_invites TO service_role;
ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

-- Security-definer helpers to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.is_workspace_member(_ws UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members WHERE workspace_id = _ws AND user_id = _user
  );
$$;

CREATE OR REPLACE FUNCTION public.workspace_role_of(_ws UUID, _user UUID)
RETURNS public.workspace_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.workspace_members WHERE workspace_id = _ws AND user_id = _user;
$$;

-- Workspaces policies
CREATE POLICY "Members view their workspaces" ON public.workspaces
  FOR SELECT TO authenticated USING (public.is_workspace_member(id, auth.uid()));
CREATE POLICY "Anyone authenticated creates workspaces" ON public.workspaces
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update their workspaces" ON public.workspaces
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete their workspaces" ON public.workspaces
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Trigger: when workspace is created, add owner as member
CREATE OR REPLACE FUNCTION public.add_owner_as_member()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_workspace_owner_member
AFTER INSERT ON public.workspaces
FOR EACH ROW EXECUTE FUNCTION public.add_owner_as_member();

-- Members policies
CREATE POLICY "Members view co-members" ON public.workspace_members
  FOR SELECT TO authenticated USING (public.is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Self insert via owner trigger or self" ON public.workspace_members
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners/admins remove members" ON public.workspace_members
  FOR DELETE TO authenticated USING (
    public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin')
    OR user_id = auth.uid()
  );

-- Invites policies
CREATE POLICY "Owners/admins view invites" ON public.workspace_invites
  FOR SELECT TO authenticated USING (
    public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin')
    OR lower(email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  );
CREATE POLICY "Owners/admins create invites" ON public.workspace_invites
  FOR INSERT TO authenticated WITH CHECK (
    public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin')
    AND invited_by = auth.uid()
  );
CREATE POLICY "Owners/admins delete invites" ON public.workspace_invites
  FOR DELETE TO authenticated USING (
    public.workspace_role_of(workspace_id, auth.uid()) IN ('owner','admin')
  );
CREATE POLICY "Invitee marks accepted" ON public.workspace_invites
  FOR UPDATE TO authenticated USING (
    lower(email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  ) WITH CHECK (
    lower(email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
  );

CREATE TRIGGER trg_workspaces_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW EXECUTE FUNCTION public.touch_business_profiles_updated_at();
