import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type TaskStatusRow = {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
};

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
  status_id: string | null;
  priority: TaskPriority;
  assignee_id: string | null;
  due_at: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

const uuid = z.string().uuid();
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

// ---- Statuses ----

export const listTaskStatuses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ workspace_id: uuid }).parse(input))
  .handler(async ({ data, context }): Promise<TaskStatusRow[]> => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("task_statuses")
      .select("id, workspace_id, name, color, position, created_at")
      .eq("workspace_id", data.workspace_id)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createTaskStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspace_id: uuid,
      name: z.string().trim().min(1).max(40),
      color: hexColor.default("#6366f1"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { count } = await supabase
      .from("task_statuses")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", data.workspace_id);
    const { data: row, error } = await supabase
      .from("task_statuses")
      .insert({
        workspace_id: data.workspace_id,
        name: data.name,
        color: data.color,
        position: count ?? 0,
      })
      .select("id, workspace_id, name, color, position, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row as TaskStatusRow;
  });

export const updateTaskStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: uuid,
      name: z.string().trim().min(1).max(40).optional(),
      color: hexColor.optional(),
      position: z.number().int().min(0).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...patch } = data;
    const { data: row, error } = await supabase
      .from("task_statuses")
      .update(patch)
      .eq("id", id)
      .select("id, workspace_id, name, color, position, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row as TaskStatusRow;
  });

export const deleteTaskStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: uuid }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("task_statuses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

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
      color: hexColor.default("#6366f1"),
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
      .select("id, workspace_id, list_id, title, description, status_id, priority, assignee_id, due_at, position, created_at, updated_at")
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
      status_id: uuid.nullable().optional(),
      priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
      assignee_id: uuid.nullable().optional(),
      due_at: z.string().datetime().nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Default to the first status if none provided
    let statusId = data.status_id ?? null;
    if (!statusId) {
      const { data: first } = await supabase
        .from("task_statuses")
        .select("id")
        .eq("workspace_id", data.workspace_id)
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();
      statusId = first?.id ?? null;
    }

    const { data: row, error } = await supabase
      .from("tasks")
      .insert({
        workspace_id: data.workspace_id,
        list_id: data.list_id,
        title: data.title,
        description: data.description ?? null,
        status_id: statusId,
        priority: data.priority,
        assignee_id: data.assignee_id ?? null,
        due_at: data.due_at ?? null,
        created_by: userId,
      })
      .select("id, workspace_id, list_id, title, description, status_id, priority, assignee_id, due_at, position, created_at, updated_at")
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
      status_id: uuid.nullable().optional(),
      priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
      assignee_id: uuid.nullable().optional(),
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
      .select("id, workspace_id, list_id, title, description, status_id, priority, assignee_id, due_at, position, created_at, updated_at")
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
