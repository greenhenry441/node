CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit contact messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 200
    AND length(email) BETWEEN 3 AND 320
    AND length(message) BETWEEN 1 AND 5000
  );