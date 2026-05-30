import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  LayoutList, KanbanSquare, CalendarDays, Plus, Trash2, X, ChevronLeft, ChevronRight,
  Flag, Clock, Loader2, Folder, Settings, LogOut, SlidersHorizontal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { listMyWorkspaces, listWorkspaceMembers, type WorkspaceMember } from "@/lib/workspaces.functions";
import {
  listTaskLists, createTaskList, deleteTaskList,
  listTaskStatuses, createTaskStatus, updateTaskStatus, deleteTaskStatus,
  listTasks, createTask, updateTask, deleteTask,
  type Task, type TaskList, type TaskStatusRow, type TaskPriority,
} from "@/lib/tasks.functions";
import {
  listCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
  type CalendarEvent,
} from "@/lib/calendar.functions";

export const Route = createFileRoute("/_authenticated/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Node Tasks" }] }),
  component: TasksPage,
});

const PRIORITY_TINT: Record<TaskPriority, string> = {
  low: "text-zinc-400",
  normal: "text-zinc-500",
  high: "text-amber-500",
  urgent: "text-red-500",
};

const STATUS_PALETTE = ["#a1a1aa", "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

type ViewMode = "list" | "board" | "calendar";

function memberLabel(m: WorkspaceMember) {
  return m.email ?? m.user_id.slice(0, 8);
}
function initials(label: string) {
  return label.slice(0, 1).toUpperCase();
}

function TasksPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  const wsFn = useServerFn(listMyWorkspaces);
  const wsQ = useQuery({ queryKey: ["my-workspaces"], queryFn: () => wsFn() });
  const ws = wsQ.data?.[0];

  const listsFn = useServerFn(listTaskLists);
  const statusesFn = useServerFn(listTaskStatuses);
  const tasksFn = useServerFn(listTasks);
  const membersFn = useServerFn(listWorkspaceMembers);
  const eventsFn = useServerFn(listCalendarEvents);

  const createListFn = useServerFn(createTaskList);
  const deleteListFn = useServerFn(deleteTaskList);
  const createTaskFn = useServerFn(createTask);
  const updateTaskFn = useServerFn(updateTask);
  const deleteTaskFn = useServerFn(deleteTask);

  const listsQ = useQuery({
    queryKey: ["task-lists", ws?.id],
    queryFn: () => listsFn({ data: { workspace_id: ws!.id } }),
    enabled: !!ws?.id,
  });
  const statusesQ = useQuery({
    queryKey: ["task-statuses", ws?.id],
    queryFn: () => statusesFn({ data: { workspace_id: ws!.id } }),
    enabled: !!ws?.id,
  });
  const tasksQ = useQuery({
    queryKey: ["tasks", ws?.id],
    queryFn: () => tasksFn({ data: { workspace_id: ws!.id } }),
    enabled: !!ws?.id,
  });
  const membersQ = useQuery({
    queryKey: ["ws-members", ws?.id],
    queryFn: () => membersFn({ data: { workspace_id: ws!.id } }),
    enabled: !!ws?.id,
  });
  const eventsQ = useQuery({
    queryKey: ["calendar-events", ws?.id],
    queryFn: () => eventsFn({ data: { workspace_id: ws!.id } }),
    enabled: !!ws?.id,
  });

  const [activeListId, setActiveListId] = useState<string | "all">("all");
  const [view, setView] = useState<ViewMode>("list");
  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [managingStatuses, setManagingStatuses] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);

  const lists = listsQ.data ?? [];
  const statuses = statusesQ.data ?? [];
  const tasks = tasksQ.data ?? [];
  const members = membersQ.data ?? [];
  const events = eventsQ.data ?? [];

  const statusMap = useMemo(() => new Map(statuses.map((s) => [s.id, s])), [statuses]);
  const memberMap = useMemo(() => new Map(members.map((m) => [m.user_id, m])), [members]);

  const visibleTasks = useMemo(() => {
    if (activeListId === "all") return tasks;
    return tasks.filter((t) => t.list_id === activeListId);
  }, [tasks, activeListId]);

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["task-lists", ws?.id] });
    qc.invalidateQueries({ queryKey: ["tasks", ws?.id] });
  };
  const invalidateStatuses = () => qc.invalidateQueries({ queryKey: ["task-statuses", ws?.id] });
  const invalidateEvents = () => qc.invalidateQueries({ queryKey: ["calendar-events", ws?.id] });

  const createListMut = useMutation({
    mutationFn: (name: string) =>
      createListFn({ data: { workspace_id: ws!.id, name, color: "#6366f1" } }),
    onSuccess: () => { toast.success("List created"); setNewListName(""); invalidateAll(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteListMut = useMutation({
    mutationFn: (id: string) => deleteListFn({ data: { id } }),
    onSuccess: () => {
      toast.success("List deleted");
      if (activeListId !== "all") setActiveListId("all");
      invalidateAll();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateTaskMut = useMutation({
    mutationFn: (patch: { id: string; status_id?: string | null; priority?: TaskPriority; title?: string; description?: string | null; list_id?: string; due_at?: string | null; assignee_id?: string | null }) =>
      updateTaskFn({ data: patch }),
    onSuccess: () => invalidateAll(),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteTaskMut = useMutation({
    mutationFn: (id: string) => deleteTaskFn({ data: { id } }),
    onSuccess: () => { toast.success("Task deleted"); setEditing(null); invalidateAll(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const doneStatusId = statuses[statuses.length - 1]?.id ?? null;
  const firstStatusId = statuses[0]?.id ?? null;

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (wsQ.isLoading || (ws && (listsQ.isLoading || statusesQ.isLoading))) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ws) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface text-center px-6">
        <div>
          <h1 className="text-2xl font-semibold">No workspace yet</h1>
          <p className="mt-2 text-muted-foreground">Create one to start tracking work.</p>
          <Link to="/app" className="mt-6 inline-block px-4 py-2 bg-ink text-surface rounded-full text-sm">
            Go to workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-ink flex">
      {/* Sidebar — lists */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <Link to="/" className="px-6 py-5 flex items-center gap-2 border-b border-border">
          <img src="/node-dot-logo.png" alt="Node" className="size-5" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Node Tasks</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">{ws.name}</div>
          </div>
        </Link>

        <div className="p-4 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          <span>Lists</span>
          <span className="text-[10px] normal-case tracking-normal text-muted-foreground/70">{lists.length}</span>
        </div>

        <div className="px-3 space-y-0.5 overflow-auto">
          <button
            onClick={() => setActiveListId("all")}
            className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${
              activeListId === "all" ? "bg-ink text-surface" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Folder className="size-3.5" /> All tasks
            <span className="ml-auto text-[10px] opacity-70">{tasks.length}</span>
          </button>
          {lists.map((l) => {
            const count = tasks.filter((t) => t.list_id === l.id).length;
            const active = activeListId === l.id;
            return (
              <div key={l.id} className="group flex items-center gap-1">
                <button
                  onClick={() => setActiveListId(l.id)}
                  className={`flex-1 text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 ${
                    active ? "bg-ink text-surface" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <span className="size-2 rounded-full" style={{ background: l.color }} />
                  <span className="truncate">{l.name}</span>
                  <span className="ml-auto text-[10px] opacity-70">{count}</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete list "${l.name}" and all its tasks?`)) deleteListMut.mutate(l.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive"
                  title="Delete list"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-2 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newListName.trim()) createListMut.mutate(newListName.trim());
            }}
            className="flex gap-1"
          >
            <input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="New list…"
              className="flex-1 px-2.5 py-1.5 text-xs bg-muted rounded-md outline-none focus:ring-2 focus:ring-ink/20"
            />
            <button
              type="submit"
              disabled={!newListName.trim() || createListMut.isPending}
              className="size-7 grid place-items-center bg-ink text-surface rounded-md disabled:opacity-40"
            >
              <Plus className="size-3.5" />
            </button>
          </form>
        </div>

        {/* Statuses summary */}
        <div className="px-4 pt-2 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          <span>Statuses</span>
          <button
            onClick={() => setManagingStatuses(true)}
            className="normal-case tracking-normal text-[10px] text-muted-foreground hover:text-ink inline-flex items-center gap-1"
          >
            <SlidersHorizontal className="size-3" /> Manage
          </button>
        </div>
        <div className="px-4 py-2 flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>

        <div className="mt-auto p-3 space-y-1 border-t border-border">
          <Link to="/app" className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-ink rounded-md hover:bg-muted">
            <Folder className="size-3.5" /> Files (NodeFMS)
          </Link>
          <Link to="/settings" className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-ink rounded-md hover:bg-muted">
            <Settings className="size-3.5" /> Settings
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-ink rounded-md hover:bg-muted">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 gap-6">
          <div>
            <div className="text-xs text-muted-foreground">Node Tasks</div>
            <div className="text-sm font-semibold">
              {view === "calendar"
                ? "Calendar"
                : activeListId === "all"
                ? "All tasks"
                : lists.find((l) => l.id === activeListId)?.name ?? "—"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md bg-muted p-0.5">
              {(["list", "board", "calendar"] as const).map((v) => {
                const Icon = v === "list" ? LayoutList : v === "board" ? KanbanSquare : CalendarDays;
                return (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-xs font-medium rounded inline-flex items-center gap-1.5 capitalize ${
                      view === v ? "bg-card shadow-sm text-ink" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {v}
                  </button>
                );
              })}
            </div>
            {view === "calendar" ? (
              <button
                onClick={() => setCreatingEvent(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 bg-ink text-surface rounded-md hover:bg-ink/90"
              >
                <Plus className="size-4" /> New event
              </button>
            ) : (
              <button
                onClick={() => {
                  if (lists.length === 0) { toast.error("Create a list first"); return; }
                  setCreating(true);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 bg-ink text-surface rounded-md hover:bg-ink/90"
              >
                <Plus className="size-4" /> New task
              </button>
            )}
            <div className="size-8 rounded-full bg-ink text-surface grid place-items-center text-xs font-semibold ml-1">
              {(user?.email ?? "?").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-8 py-6">
          {view === "calendar" ? (
            <CalendarView
              tasks={visibleTasks}
              events={events}
              statusMap={statusMap}
              onEditTask={setEditing}
              onEditEvent={setEditingEvent}
            />
          ) : tasksQ.isLoading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : visibleTasks.length === 0 ? (
            <EmptyState onCreate={() => lists.length > 0 ? setCreating(true) : toast.error("Create a list first")} />
          ) : view === "list" ? (
            <ListView
              tasks={visibleTasks}
              lists={lists}
              statusMap={statusMap}
              memberMap={memberMap}
              doneStatusId={doneStatusId}
              firstStatusId={firstStatusId}
              onEdit={setEditing}
              onToggleDone={(t) =>
                updateTaskMut.mutate({ id: t.id, status_id: t.status_id === doneStatusId ? firstStatusId : doneStatusId })
              }
            />
          ) : (
            <BoardView
              tasks={visibleTasks}
              statuses={statuses}
              memberMap={memberMap}
              onEdit={setEditing}
              onChangeStatus={(id, status_id) => updateTaskMut.mutate({ id, status_id })}
            />
          )}
        </div>
      </main>

      {/* Task editor */}
      {(editing || creating) && (
        <TaskEditor
          mode={editing ? "edit" : "create"}
          task={editing}
          lists={lists}
          statuses={statuses}
          members={members}
          defaultListId={activeListId !== "all" ? activeListId : lists[0]?.id}
          onClose={() => { setEditing(null); setCreating(false); }}
          onCreate={async (data) => {
            try {
              await createTaskFn({ data: { ...data, workspace_id: ws.id } });
              toast.success("Task created");
              setCreating(false);
              invalidateAll();
            } catch (e) { toast.error((e as Error).message); }
          }}
          onSave={async (patch) => {
            try {
              await updateTaskFn({ data: patch });
              toast.success("Saved");
              setEditing(null);
              invalidateAll();
            } catch (e) { toast.error((e as Error).message); }
          }}
          onDelete={(id) => { if (confirm("Delete this task?")) deleteTaskMut.mutate(id); }}
        />
      )}

      {/* Status manager */}
      {managingStatuses && (
        <StatusManager
          workspaceId={ws.id}
          statuses={statuses}
          onClose={() => setManagingStatuses(false)}
          onChanged={() => { invalidateStatuses(); invalidateAll(); }}
        />
      )}

      {/* Event editor */}
      {(editingEvent || creatingEvent) && (
        <EventEditor
          workspaceId={ws.id}
          event={editingEvent}
          onClose={() => { setEditingEvent(null); setCreatingEvent(false); }}
          onChanged={() => { invalidateEvents(); setEditingEvent(null); setCreatingEvent(false); }}
        />
      )}
    </div>
  );
}

// ---------- Shared bits ----------

function StatusBadge({ status }: { status?: TaskStatusRow }) {
  if (!status) return <span className="text-[10px] text-muted-foreground">—</span>;
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ring-1"
      style={{ backgroundColor: `${status.color}1a`, color: status.color, borderColor: `${status.color}33` }}
    >
      {status.name}
    </span>
  );
}

function Avatar({ label }: { label: string }) {
  return (
    <span className="size-5 shrink-0 rounded-full bg-muted text-ink grid place-items-center text-[10px] font-semibold" title={label}>
      {initials(label)}
    </span>
  );
}

// ---------- Views ----------

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="h-full grid place-items-center text-center">
      <div className="max-w-sm">
        <div className="size-12 mx-auto rounded-2xl bg-muted grid place-items-center">
          <LayoutList className="size-5 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">No tasks yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">Create a task to start tracking work in this list.</p>
        <button onClick={onCreate} className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-surface rounded-md text-sm">
          <Plus className="size-4" /> Add your first task
        </button>
      </div>
    </div>
  );
}

function ListView({
  tasks, lists, statusMap, memberMap, doneStatusId, onEdit, onToggleDone,
}: {
  tasks: Task[]; lists: TaskList[];
  statusMap: Map<string, TaskStatusRow>; memberMap: Map<string, WorkspaceMember>;
  doneStatusId: string | null; firstStatusId: string | null;
  onEdit: (t: Task) => void; onToggleDone: (t: Task) => void;
}) {
  const listsById = new Map(lists.map((l) => [l.id, l]));
  return (
    <div className="bg-card rounded-2xl ring-1 ring-black/5 overflow-hidden">
      <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold border-b border-border">
        <div className="col-span-4">Task</div>
        <div className="col-span-2">List</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Assignee</div>
        <div className="col-span-1">Due</div>
        <div className="col-span-1 text-right">Priority</div>
      </div>
      <div className="divide-y divide-border">
        {tasks.map((t) => {
          const list = listsById.get(t.list_id);
          const status = t.status_id ? statusMap.get(t.status_id) : undefined;
          const assignee = t.assignee_id ? memberMap.get(t.assignee_id) : undefined;
          const isDone = !!doneStatusId && t.status_id === doneStatusId;
          return (
            <div key={t.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/40 cursor-pointer text-sm" onClick={() => onEdit(t)}>
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={(e) => { e.stopPropagation(); onToggleDone(t); }}
                  onClick={(e) => e.stopPropagation()}
                  className="size-4 rounded border-border accent-ink"
                />
                <span className={`truncate ${isDone ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                {list && <span className="size-2 rounded-full shrink-0" style={{ background: list.color }} />}
                <span className="truncate">{list?.name ?? "—"}</span>
              </div>
              <div className="col-span-2"><StatusBadge status={status} /></div>
              <div className="col-span-2 min-w-0">
                {assignee ? (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                    <Avatar label={memberLabel(assignee)} />
                    <span className="truncate">{memberLabel(assignee)}</span>
                  </span>
                ) : <span className="text-xs text-muted-foreground">—</span>}
              </div>
              <div className="col-span-1 text-xs text-muted-foreground">
                {t.due_at ? new Date(t.due_at).toLocaleDateString() : "—"}
              </div>
              <div className="col-span-1 text-right">
                <Flag className={`size-3.5 inline ${PRIORITY_TINT[t.priority]}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BoardView({
  tasks, statuses, memberMap, onEdit, onChangeStatus,
}: {
  tasks: Task[]; statuses: TaskStatusRow[];
  memberMap: Map<string, WorkspaceMember>;
  onEdit: (t: Task) => void; onChangeStatus: (id: string, s: string) => void;
}) {
  if (statuses.length === 0) {
    return <p className="text-sm text-muted-foreground">Add a status to use the board view.</p>;
  }
  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-2">
      {statuses.map((status) => {
        const col = tasks.filter((t) => t.status_id === status.id);
        return (
          <div
            key={status.id}
            className="bg-muted/40 rounded-2xl p-3 flex flex-col min-h-[300px] w-72 shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("text/plain");
              if (id) onChangeStatus(id, status.id);
            }}
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <StatusBadge status={status} />
              <span className="text-[10px] text-muted-foreground">{col.length}</span>
            </div>
            <div className="mt-2 space-y-2 flex-1">
              {col.map((t) => {
                const assignee = t.assignee_id ? memberMap.get(t.assignee_id) : undefined;
                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                    onClick={() => onEdit(t)}
                    className="bg-card rounded-lg p-3 ring-1 ring-black/5 cursor-pointer hover:ring-ink/20"
                  >
                    <div className="text-sm font-medium leading-snug">{t.title}</div>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      {t.due_at && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {new Date(t.due_at).toLocaleDateString()}
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-2">
                        {assignee && <Avatar label={memberLabel(assignee)} />}
                        <Flag className={`size-3 ${PRIORITY_TINT[t.priority]}`} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarView({
  tasks, events, statusMap, onEditTask, onEditEvent,
}: {
  tasks: Task[]; events: CalendarEvent[];
  statusMap: Map<string, TaskStatusRow>;
  onEditTask: (t: Task) => void; onEditEvent: (e: CalendarEvent) => void;
}) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.due_at) continue;
      const d = new Date(t.due_at);
      const k = dayKey(d);
      map.set(k, [...(map.get(k) ?? []), t]);
    }
    return map;
  }, [tasks]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const d = new Date(ev.start_at);
      const k = dayKey(d);
      map.set(k, [...(map.get(k) ?? []), ev]);
    }
    return map;
  }, [events]);

  const monthName = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  const today = new Date();

  return (
    <div className="bg-card rounded-2xl ring-1 ring-black/5 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">{monthName}</h2>
        <div className="flex gap-1">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="size-7 grid place-items-center rounded hover:bg-muted">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }} className="px-2 text-xs rounded hover:bg-muted">Today</button>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="size-7 grid place-items-center rounded hover:bg-muted">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold border-b border-border">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (<div key={d} className="px-3 py-2">{d}</div>))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="min-h-[120px] border-r border-b border-border last:border-r-0 bg-muted/20" />;
          const k = dayKey(d);
          const ts = tasksByDay.get(k) ?? [];
          const evs = eventsByDay.get(k) ?? [];
          const isToday = d.toDateString() === today.toDateString();
          return (
            <div key={i} className="min-h-[120px] border-r border-b border-border last:border-r-0 p-2 flex flex-col gap-1">
              <div className={`text-xs font-medium ${isToday ? "size-6 grid place-items-center rounded-full bg-ink text-surface" : "text-muted-foreground"}`}>
                {d.getDate()}
              </div>
              {evs.slice(0, 2).map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => onEditEvent(ev)}
                  className="text-left text-[11px] px-1.5 py-1 rounded truncate text-surface flex items-center gap-1"
                  style={{ background: ev.color }}
                >
                  <CalendarDays className="size-2.5 shrink-0" />
                  <span className="truncate">{ev.title}</span>
                </button>
              ))}
              {ts.slice(0, 2).map((t) => {
                const status = t.status_id ? statusMap.get(t.status_id) : undefined;
                return (
                  <button
                    key={t.id}
                    onClick={() => onEditTask(t)}
                    className="text-left text-[11px] px-1.5 py-1 rounded truncate ring-1"
                    style={{
                      backgroundColor: status ? `${status.color}1a` : undefined,
                      color: status?.color,
                      borderColor: status ? `${status.color}33` : undefined,
                    }}
                  >
                    {t.title}
                  </button>
                );
              })}
              {ts.length + evs.length > 4 && (
                <span className="text-[10px] text-muted-foreground">+{ts.length + evs.length - 4} more</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Task editor ----------

function TaskEditor({
  mode, task, lists, statuses, members, defaultListId, onClose, onCreate, onSave, onDelete,
}: {
  mode: "edit" | "create";
  task: Task | null;
  lists: TaskList[];
  statuses: TaskStatusRow[];
  members: WorkspaceMember[];
  defaultListId?: string;
  onClose: () => void;
  onCreate: (data: { list_id: string; title: string; description: string | null; status_id: string | null; priority: TaskPriority; assignee_id: string | null; due_at: string | null }) => void;
  onSave: (patch: { id: string; title?: string; description?: string | null; status_id?: string | null; priority?: TaskPriority; assignee_id?: string | null; list_id?: string; due_at?: string | null }) => void;
  onDelete: (id: string) => void;
}) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [statusId, setStatusId] = useState<string>(task?.status_id ?? statuses[0]?.id ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "normal");
  const [assigneeId, setAssigneeId] = useState<string>(task?.assignee_id ?? "");
  const [listId, setListId] = useState<string>(task?.list_id ?? defaultListId ?? lists[0]?.id ?? "");
  const [dueLocal, setDueLocal] = useState(task?.due_at ? toLocalDt(task.due_at) : "");

  const submit = () => {
    if (!title.trim() || !listId) return;
    const due_at = dueLocal ? new Date(dueLocal).toISOString() : null;
    const status_id = statusId || null;
    const assignee_id = assigneeId || null;
    if (mode === "create") {
      onCreate({ list_id: listId, title: title.trim(), description: description || null, status_id, priority, assignee_id, due_at });
    } else if (task) {
      onSave({ id: task.id, title: title.trim(), description: description || null, status_id, priority, assignee_id, list_id: listId, due_at });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 grid place-items-end md:place-items-center p-0 md:p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card w-full md:max-w-lg md:rounded-2xl ring-1 ring-black/10 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">{mode === "create" ? "New task" : "Edit task"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-ink"><X className="size-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full text-lg font-medium border-0 outline-none bg-transparent placeholder:text-muted-foreground/60"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description…"
            rows={4}
            className="w-full text-sm bg-muted rounded-lg p-3 outline-none focus:ring-2 focus:ring-ink/20 resize-none"
          />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="List">
              <select value={listId} onChange={(e) => setListId(e.target.value)} className="w-full px-2 py-1.5 bg-muted rounded-md text-sm outline-none">
                {lists.map((l) => (<option key={l.id} value={l.id}>{l.name}</option>))}
              </select>
            </Field>
            <Field label="Status">
              <select value={statusId} onChange={(e) => setStatusId(e.target.value)} className="w-full px-2 py-1.5 bg-muted rounded-md text-sm outline-none">
                {statuses.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </Field>
            <Field label="Assignee">
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full px-2 py-1.5 bg-muted rounded-md text-sm outline-none">
                <option value="">Unassigned</option>
                {members.map((m) => (<option key={m.user_id} value={m.user_id}>{memberLabel(m)}</option>))}
              </select>
            </Field>
            <Field label="Priority">
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="w-full px-2 py-1.5 bg-muted rounded-md text-sm outline-none">
                {(["low","normal","high","urgent"] as TaskPriority[]).map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
            </Field>
            <Field label="Due date">
              <input type="datetime-local" value={dueLocal} onChange={(e) => setDueLocal(e.target.value)} className="w-full px-2 py-1.5 bg-muted rounded-md text-sm outline-none" />
            </Field>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-3">
          {mode === "edit" && task ? (
            <button onClick={() => onDelete(task.id)} className="text-xs text-destructive inline-flex items-center gap-1">
              <Trash2 className="size-3.5" /> Delete
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted">Cancel</button>
            <button onClick={submit} disabled={!title.trim() || !listId} className="px-4 py-1.5 text-sm bg-ink text-surface rounded-md disabled:opacity-50">
              {mode === "create" ? "Create task" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Status manager ----------

function StatusManager({
  workspaceId, statuses, onClose, onChanged,
}: {
  workspaceId: string; statuses: TaskStatusRow[];
  onClose: () => void; onChanged: () => void;
}) {
  const createFn = useServerFn(createTaskStatus);
  const updateFn = useServerFn(updateTaskStatus);
  const deleteFn = useServerFn(deleteTaskStatus);
  const [name, setName] = useState("");
  const [color, setColor] = useState(STATUS_PALETTE[0]);
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!name.trim()) return;
    setBusy(true);
    try {
      await createFn({ data: { workspace_id: workspaceId, name: name.trim(), color } });
      setName("");
      onChanged();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const rename = async (id: string, newName: string) => {
    try { await updateFn({ data: { id, name: newName } }); onChanged(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const recolor = async (id: string, newColor: string) => {
    try { await updateFn({ data: { id, color: newColor } }); onChanged(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const remove = async (s: TaskStatusRow) => {
    if (statuses.length <= 1) { toast.error("Keep at least one status"); return; }
    if (!confirm(`Delete status "${s.name}"? Tasks in it become unset.`)) return;
    try { await deleteFn({ data: { id: s.id } }); onChanged(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 grid place-items-end md:place-items-center p-0 md:p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card w-full md:max-w-md md:rounded-2xl ring-1 ring-black/10 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">Manage statuses</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-ink"><X className="size-4" /></button>
        </div>
        <div className="p-5 space-y-2">
          {statuses.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <input
                type="color"
                value={s.color}
                onChange={(e) => recolor(s.id, e.target.value)}
                className="size-7 rounded cursor-pointer bg-transparent border border-border"
                title="Status color"
              />
              <input
                defaultValue={s.name}
                onBlur={(e) => { const v = e.target.value.trim(); if (v && v !== s.name) rename(s.id, v); }}
                className="flex-1 px-2.5 py-1.5 text-sm bg-muted rounded-md outline-none focus:ring-2 focus:ring-ink/20"
              />
              <button onClick={() => remove(s)} className="p-1.5 text-muted-foreground hover:text-destructive" title="Delete status">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="px-5 pb-5 pt-1 border-t border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 mt-3">Add status</div>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="size-8 rounded cursor-pointer bg-transparent border border-border" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") add(); }}
              placeholder="New status name…"
              className="flex-1 px-2.5 py-1.5 text-sm bg-muted rounded-md outline-none focus:ring-2 focus:ring-ink/20"
            />
            <button onClick={add} disabled={!name.trim() || busy} className="px-3 py-1.5 text-sm bg-ink text-surface rounded-md disabled:opacity-40">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Event editor ----------

function EventEditor({
  workspaceId, event, onClose, onChanged,
}: {
  workspaceId: string; event: CalendarEvent | null;
  onClose: () => void; onChanged: () => void;
}) {
  const createFn = useServerFn(createCalendarEvent);
  const updateFn = useServerFn(updateCalendarEvent);
  const deleteFn = useServerFn(deleteCalendarEvent);
  const mode = event ? "edit" : "create";

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [startLocal, setStartLocal] = useState(event ? toLocalDt(event.start_at) : toLocalDt(new Date().toISOString()));
  const [endLocal, setEndLocal] = useState(event?.end_at ? toLocalDt(event.end_at) : "");
  const [color, setColor] = useState(event?.color ?? STATUS_PALETTE[5]);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim() || !startLocal) return;
    setBusy(true);
    try {
      const start_at = new Date(startLocal).toISOString();
      const end_at = endLocal ? new Date(endLocal).toISOString() : null;
      if (mode === "create") {
        await createFn({ data: { workspace_id: workspaceId, title: title.trim(), description: description || null, start_at, end_at, all_day: false, color } });
        toast.success("Event created");
      } else if (event) {
        await updateFn({ data: { id: event.id, title: title.trim(), description: description || null, start_at, end_at, color } });
        toast.success("Event saved");
      }
      onChanged();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!event) return;
    if (!confirm("Delete this event?")) return;
    setBusy(true);
    try { await deleteFn({ data: { id: event.id } }); toast.success("Event deleted"); onChanged(); }
    catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 grid place-items-end md:place-items-center p-0 md:p-6" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card w-full md:max-w-lg md:rounded-2xl ring-1 ring-black/10 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-sm">{mode === "create" ? "New event" : "Edit event"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-ink"><X className="size-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event title"
            className="w-full text-lg font-medium border-0 outline-none bg-transparent placeholder:text-muted-foreground/60"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details…"
            rows={3}
            className="w-full text-sm bg-muted rounded-lg p-3 outline-none focus:ring-2 focus:ring-ink/20 resize-none"
          />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="Starts">
              <input type="datetime-local" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} className="w-full px-2 py-1.5 bg-muted rounded-md text-sm outline-none" />
            </Field>
            <Field label="Ends (optional)">
              <input type="datetime-local" value={endLocal} onChange={(e) => setEndLocal(e.target.value)} className="w-full px-2 py-1.5 bg-muted rounded-md text-sm outline-none" />
            </Field>
            <Field label="Color">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-full rounded-md cursor-pointer bg-transparent border border-border" />
            </Field>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-border flex items-center justify-between gap-3">
          {mode === "edit" ? (
            <button onClick={remove} className="text-xs text-destructive inline-flex items-center gap-1">
              <Trash2 className="size-3.5" /> Delete
            </button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted">Cancel</button>
            <button onClick={submit} disabled={!title.trim() || !startLocal || busy} className="px-4 py-1.5 text-sm bg-ink text-surface rounded-md disabled:opacity-50">
              {mode === "create" ? "Create event" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">{label}</span>
      {children}
    </label>
  );
}

function toLocalDt(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
