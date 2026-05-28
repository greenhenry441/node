import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ForumCategory = "general" | "help" | "feedback" | "announcements" | "showcase";

export type ForumTopic = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: ForumCategory;
  author_name: string | null;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
};

export type ForumReply = {
  id: string;
  topic_id: string;
  user_id: string;
  author_name: string | null;
  body: string;
  created_at: string;
};

// ---------- Public reads (no auth required) ----------

export const listForumTopics = createServerFn({ method: "GET" })
  .inputValidator((data: { category?: ForumCategory | "all" } | undefined) => data ?? {})
  .handler(async ({ data }): Promise<ForumTopic[]> => {
    let q = supabaseAdmin
      .from("forum_topics")
      .select("id,user_id,title,body,category,author_name,reply_count,last_activity_at,created_at")
      .order("last_activity_at", { ascending: false })
      .limit(200);
    if (data.category && data.category !== "all") q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as ForumTopic[];
  });

export const getForumTopic = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }): Promise<{ topic: ForumTopic; replies: ForumReply[] }> => {
    const { data: topic, error } = await supabaseAdmin
      .from("forum_topics")
      .select("id,user_id,title,body,category,author_name,reply_count,last_activity_at,created_at")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!topic) throw new Error("Topic not found");
    const { data: replies, error: rErr } = await supabaseAdmin
      .from("forum_replies")
      .select("id,topic_id,user_id,author_name,body,created_at")
      .eq("topic_id", data.id)
      .order("created_at", { ascending: true });
    if (rErr) throw new Error(rErr.message);
    return { topic: topic as ForumTopic, replies: (replies ?? []) as ForumReply[] };
  });

// ---------- Authenticated writes ----------

const NewTopicSchema = z.object({
  title: z.string().trim().min(3).max(200),
  body: z.string().trim().min(1).max(10000),
  category: z.enum(["general", "help", "feedback", "announcements", "showcase"]),
});

export const createForumTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => NewTopicSchema.parse(data))
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string } | null)?.email ?? null;
    const author = email ? email.split("@")[0] : null;
    const { data: row, error } = await supabase
      .from("forum_topics")
      .insert({
        user_id: userId,
        title: data.title,
        body: data.body,
        category: data.category,
        author_name: author,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

const NewReplySchema = z.object({
  topic_id: z.string().uuid(),
  body: z.string().trim().min(1).max(10000),
});

export const createForumReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => NewReplySchema.parse(data))
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string } | null)?.email ?? null;
    const author = email ? email.split("@")[0] : null;
    const { data: row, error } = await supabase
      .from("forum_replies")
      .insert({
        topic_id: data.topic_id,
        user_id: userId,
        body: data.body,
        author_name: author,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deleteForumTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("forum_topics").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
