-- Custom task statuses per workspace
CREATE TABLE public.task_statuses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_statuses TO authenticated;
GRANT ALL ON public.task_statuses TO service_role;

ALTER TABLE public.task_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view statuses" ON public.task_statuses
  FOR SELECT TO authenticated USING (is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members create statuses" ON public.task_statuses
  FOR INSERT TO authenticated WITH CHECK (is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members update statuses" ON public.task_statuses
  FOR UPDATE TO authenticated USING (is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members delete statuses" ON public.task_statuses
  FOR DELETE TO authenticated USING (is_workspace_member(workspace_id, auth.uid()));

-- Seed default statuses for existing workspaces
INSERT INTO public.task_statuses (workspace_id, name, color, position)
SELECT w.id, v.name, v.color, v.position
FROM public.workspaces w
CROSS JOIN (VALUES
  ('To do', '#a1a1aa', 0),
  ('In progress', '#3b82f6', 1),
  ('Review', '#f59e0b', 2),
  ('Done', '#10b981', 3)
) AS v(name, color, position);

-- Add status_id to tasks and migrate from enum
ALTER TABLE public.tasks ADD COLUMN status_id uuid REFERENCES public.task_statuses(id) ON DELETE SET NULL;

UPDATE public.tasks t
SET status_id = s.id
FROM public.task_statuses s
WHERE s.workspace_id = t.workspace_id
  AND s.name = CASE t.status::text
    WHEN 'todo' THEN 'To do'
    WHEN 'in_progress' THEN 'In progress'
    WHEN 'review' THEN 'Review'
    WHEN 'done' THEN 'Done'
  END;

-- Seed default statuses automatically for new workspaces
CREATE OR REPLACE FUNCTION public.seed_default_statuses()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.task_statuses (workspace_id, name, color, position) VALUES
    (NEW.id, 'To do', '#a1a1aa', 0),
    (NEW.id, 'In progress', '#3b82f6', 1),
    (NEW.id, 'Review', '#f59e0b', 2),
    (NEW.id, 'Done', '#10b981', 3);
  RETURN NEW;
END $$;

CREATE TRIGGER seed_statuses_on_workspace
AFTER INSERT ON public.workspaces
FOR EACH ROW EXECUTE FUNCTION public.seed_default_statuses();

-- Standalone calendar events
CREATE TABLE public.calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  all_day boolean NOT NULL DEFAULT false,
  color text NOT NULL DEFAULT '#6366f1',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view events" ON public.calendar_events
  FOR SELECT TO authenticated USING (is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members create events" ON public.calendar_events
  FOR INSERT TO authenticated WITH CHECK (is_workspace_member(workspace_id, auth.uid()) AND created_by = auth.uid());
CREATE POLICY "Members update events" ON public.calendar_events
  FOR UPDATE TO authenticated USING (is_workspace_member(workspace_id, auth.uid()))
  WITH CHECK (is_workspace_member(workspace_id, auth.uid()));
CREATE POLICY "Members delete events" ON public.calendar_events
  FOR DELETE TO authenticated USING (is_workspace_member(workspace_id, auth.uid()));

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();