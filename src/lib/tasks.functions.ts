import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type TaskList = {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
};

export type Task = {
  id: string;
  workspace_id: string;
  list_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_at: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

const uuid = z.string().uuid();

// ---- Lists ----

export const listTaskLists = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspace_id: uuid }).parse(input))
  .handler(async ({ data, context }): Promise<TaskList[]> => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("task_lists")
      .select("id, workspace_id, name, color, position, created_at")
      .eq("workspace_id", data.workspace_id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createTaskList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspace_id: uuid,
      name: z.string().trim().min(1).max(80),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("task_lists")
      .insert({
        workspace_id: data.workspace_id,
        name: data.name,
        color: data.color,
        created_by: userId,
      })
      .select("id, workspace_id, name, color, position, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row as TaskList;
  });

export const deleteTaskList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("task_lists").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---- Tasks ----

export const listTasks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspace_id: uuid }).parse(input))
  .handler(async ({ data, context }): Promise<Task[]> => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("tasks")
      .select("id, workspace_id, list_id, title, description, status, priority, assignee_id, due_at, position, created_at, updated_at")
      .eq("workspace_id", data.workspace_id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as Task[];
  });

export const createTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspace_id: uuid,
      list_id: uuid,
      title: z.string().trim().min(1).max(200),
      description: z.string().max(5000).optional().nullable(),
      status: z.enum(["todo", "in_progress", "review", "done"]).default("todo"),
      priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
      due_at: z.string().datetime().nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("tasks")
      .insert({
        workspace_id: data.workspace_id,
        list_id: data.list_id,
        title: data.title,
        description: data.description ?? null,
        status: data.status,
        priority: data.priority,
        due_at: data.due_at ?? null,
        created_by: userId,
      })
      .select("id, workspace_id, list_id, title, description, status, priority, assignee_id, due_at, position, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return row as Task;
  });

export const updateTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: uuid,
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().max(5000).nullable().optional(),
      status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
      priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
      list_id: uuid.optional(),
      due_at: z.string().datetime().nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...patch } = data;
    const { data: row, error } = await supabase
      .from("tasks")
      .update(patch)
      .eq("id", id)
      .select("id, workspace_id, list_id, title, description, status, priority, assignee_id, due_at, position, created_at, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return row as Task;
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
