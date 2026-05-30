import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CalendarEvent = {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  all_day: boolean;
  color: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

const uuid = z.string().uuid();
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const listCalendarEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspace_id: uuid }).parse(input))
  .handler(async ({ data, context }): Promise<CalendarEvent[]> => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("calendar_events")
      .select("id, workspace_id, title, description, start_at, end_at, all_day, color, created_by, created_at, updated_at")
      .eq("workspace_id", data.workspace_id)
      .order("start_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as CalendarEvent[];
  });

export const createCalendarEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspace_id: uuid,
      title: z.string().trim().min(1).max(200),
      description: z.string().max(5000).nullable().optional(),
      start_at: z.string().datetime(),
      end_at: z.string().datetime().nullable().optional(),
      all_day: z.boolean().default(false),
      color: hexColor.default("#6366f1"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("calendar_events")
      .insert({
        workspace_id: data.workspace_id,
        title: data.title,
        description: data.description ?? null,
        start_at: data.start_at,
        end_at: data.end_at ?? null,
        all_day: data.all_day,
        color: data.color,
        created_by: userId,
      })
      .select("id, workspace_id, title, description, start_at, end_at, all_day, color, created_by, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return row as CalendarEvent;
  });

export const updateCalendarEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: uuid,
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().max(5000).nullable().optional(),
      start_at: z.string().datetime().optional(),
      end_at: z.string().datetime().nullable().optional(),
      all_day: z.boolean().optional(),
      color: hexColor.optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...patch } = data;
    const { data: row, error } = await supabase
      .from("calendar_events")
      .update(patch)
      .eq("id", id)
      .select("id, workspace_id, title, description, start_at, end_at, all_day, color, created_by, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return row as CalendarEvent;
  });

export const deleteCalendarEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("calendar_events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
