import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SearchKind = "file" | "task" | "event" | "topic" | "list";

export type SearchResult = {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string | null;
  /** client route to open the result */
  to: string;
  /** optional search params / hash for the route */
  workspaceId: string | null;
  timestamp: string | null;
};

const inputSchema = z.object({
  q: z.string().trim().min(1).max(120),
  limit: z.number().int().min(1).max(20).optional(),
});

// Escape a value for use inside PostgREST ilike "%...%" patterns.
const esc = (s: string) => s.replace(/[%_]/g, (m) => `\\${m}`);

export const globalSearch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<SearchResult[]> => {
    const { supabase } = context;
    const q = data.q;
    const limit = data.limit ?? 6;
    const like = `%${esc(q)}%`;
    const results: SearchResult[] = [];

    // Run all queries in parallel — RLS scopes each to what the user can see.
    const [files, tasks, events, topics, lists] = await Promise.all([
      supabase
        .from("user_files")
        .select("id, name, mime_type, workspace_id, created_at")
        .ilike("name", like)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("tasks")
        .select("id, title, description, workspace_id, due_at")
        .ilike("title", like)
        .order("updated_at", { ascending: false })
        .limit(limit),
      supabase
        .from("calendar_events")
        .select("id, title, description, workspace_id, start_at")
        .ilike("title", like)
        .order("start_at", { ascending: false })
        .limit(limit),
      supabase
        .from("forum_topics")
        .select("id, title, category, last_activity_at")
        .ilike("title", like)
        .order("last_activity_at", { ascending: false })
        .limit(limit),
      supabase
        .from("task_lists")
        .select("id, name, workspace_id, created_at")
        .ilike("name", like)
        .order("created_at", { ascending: false })
        .limit(limit),
    ]);

    for (const f of files.data ?? []) {
      results.push({
        id: f.id,
        kind: "file",
        title: f.name,
        subtitle: f.mime_type ?? "File",
        to: "/app",
        workspaceId: f.workspace_id ?? null,
        timestamp: f.created_at ?? null,
      });
    }
    for (const t of tasks.data ?? []) {
      results.push({
        id: t.id,
        kind: "task",
        title: t.title,
        subtitle: t.description ? t.description.slice(0, 80) : "Task",
        to: "/tasks",
        workspaceId: t.workspace_id ?? null,
        timestamp: t.due_at ?? null,
      });
    }
    for (const e of events.data ?? []) {
      results.push({
        id: e.id,
        kind: "event",
        title: e.title,
        subtitle: e.description ? e.description.slice(0, 80) : "Event",
        to: "/tasks",
        workspaceId: e.workspace_id ?? null,
        timestamp: e.start_at ?? null,
      });
    }
    for (const l of lists.data ?? []) {
      results.push({
        id: l.id,
        kind: "list",
        title: l.name,
        subtitle: "Task list",
        to: "/tasks",
        workspaceId: l.workspace_id ?? null,
        timestamp: l.created_at ?? null,
      });
    }
    for (const tp of topics.data ?? []) {
      results.push({
        id: tp.id,
        kind: "topic",
        title: tp.title,
        subtitle: tp.category ? `Forum · ${tp.category}` : "Forum",
        to: `/forum/${tp.id}`,
        workspaceId: null,
        timestamp: tp.last_activity_at ?? null,
      });
    }

    return results;
  });
