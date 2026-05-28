
-- Forum topics
CREATE TABLE public.forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  author_name TEXT,
  reply_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.forum_topics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_topics TO authenticated;
GRANT ALL ON public.forum_topics TO service_role;

ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read topics" ON public.forum_topics
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users create topics" ON public.forum_topics
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND length(title) BETWEEN 3 AND 200
    AND length(body) BETWEEN 1 AND 10000
    AND category IN ('general','help','feedback','announcements','showcase')
  );

CREATE POLICY "Authors update own topics" ON public.forum_topics
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors delete own topics" ON public.forum_topics
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Forum replies
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author_name TEXT,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.forum_replies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forum_replies TO authenticated;
GRANT ALL ON public.forum_replies TO service_role;

ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read replies" ON public.forum_replies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users create replies" ON public.forum_replies
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = user_id AND length(body) BETWEEN 1 AND 10000
  );

CREATE POLICY "Authors delete own replies" ON public.forum_replies
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_forum_topics_activity ON public.forum_topics(last_activity_at DESC);
CREATE INDEX idx_forum_replies_topic ON public.forum_replies(topic_id, created_at);

-- Bump topic activity on reply
CREATE OR REPLACE FUNCTION public.bump_topic_on_reply()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.forum_topics
    SET reply_count = reply_count + 1, last_activity_at = now()
    WHERE id = NEW.topic_id;
  RETURN NEW;
END $$;

CREATE TRIGGER forum_replies_bump
AFTER INSERT ON public.forum_replies
FOR EACH ROW EXECUTE FUNCTION public.bump_topic_on_reply();
