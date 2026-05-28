import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, Plus, Copy, Check, Trash2, UserMinus, Users, Building2, Mail, Shield, KeyRound, RefreshCw, LogIn,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  listMyWorkspaces, createWorkspace, getWorkspaceDetail, createInvite, revokeInvite, removeMember,
  regenerateJoinCode, joinWorkspaceByCode,
  type WorkspaceRole,
} from "@/lib/workspaces.functions";
import { WorkspaceChat } from "@/components/workspace-chat";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Node FMS" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const listFn = useServerFn(listMyWorkspaces);
  const createWsFn = useServerFn(createWorkspace);

  const wsQ = useQuery({ queryKey: ["my-workspaces"], queryFn: () => listFn() });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const joinFn = useServerFn(joinWorkspaceByCode);

  const createMut = useMutation({
    mutationFn: (name: string) => createWsFn({ data: { name } }),
    onSuccess: (ws) => {
      toast.success(`Workspace "${ws.name}" created`);
      setNewName("");
      setActiveId(ws.id);
      qc.invalidateQueries({ queryKey: ["my-workspaces"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const joinMut = useMutation({
    mutationFn: (code: string) => joinFn({ data: { code: code.trim().toLowerCase() } }),
    onSuccess: (r) => {
      toast.success(`Joined "${r.name}"`);
      setJoinCodeInput("");
      setActiveId(r.workspace_id);
      qc.invalidateQueries({ queryKey: ["my-workspaces"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const active = activeId ?? wsQ.data?.[0]?.id ?? null;

  const updatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pw = String(fd.get("password") ?? "");
    if (pw.length < 8) return toast.error("Password must be at least 8 characters");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); (e.currentTarget as HTMLFormElement).reset(); }
  };

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/app" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ink">
            <ArrowLeft className="size-4" /> Back to workspace
          </Link>
          <span className="text-sm font-semibold tracking-tight">Settings</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {/* Profile */}
        <section>
          <SectionTitle icon={<Shield className="size-4" />} title="Account" subtitle="Your sign-in details." />
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <Field label="Email" value={user?.email ?? "—"} />
            <Field label="User ID" value={user?.id ?? "—"} mono />
          </div>
          <form onSubmit={updatePassword} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              name="password"
              type="password"
              minLength={8}
              placeholder="New password"
              className="flex-1 px-3 py-2 rounded-md border border-border bg-card text-sm"
            />
            <button className="px-4 py-2 rounded-md bg-ink text-surface text-sm font-medium hover:bg-ink/90">
              Update password
            </button>
          </form>
        </section>

        {/* Workspaces */}
        <section>
          <SectionTitle icon={<Building2 className="size-4" />} title="Workspaces" subtitle="Collaborate with your team." />

          <div className="mt-4 flex flex-wrap gap-2">
            {wsQ.isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
            {wsQ.data?.map((w) => (
              <button
                key={w.id}
                onClick={() => setActiveId(w.id)}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  active === w.id ? "bg-ink text-surface border-ink" : "border-border hover:bg-muted"
                }`}
              >
                {w.name}
                <span className="ml-2 text-[10px] uppercase tracking-wider opacity-70">{w.role}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-3 max-w-2xl">
            <form
              onSubmit={(e) => { e.preventDefault(); if (newName.trim()) createMut.mutate(newName.trim()); }}
              className="flex gap-2"
            >
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New workspace name"
                className="flex-1 px-3 py-2 rounded-md border border-border bg-card text-sm"
              />
              <button
                disabled={createMut.isPending || !newName.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-ink text-surface text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
              >
                <Plus className="size-4" /> Create
              </button>
            </form>
            <form
              onSubmit={(e) => { e.preventDefault(); if (joinCodeInput.trim()) joinMut.mutate(joinCodeInput); }}
              className="flex gap-2"
            >
              <input
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                placeholder="Join with workspace code"
                className="flex-1 px-3 py-2 rounded-md border border-border bg-card text-sm font-mono"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                disabled={joinMut.isPending || !joinCodeInput.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                <LogIn className="size-4" /> Join
              </button>
            </form>
          </div>

          {active && <WorkspaceDetail key={active} workspaceId={active} />}
        </section>
      </main>
    </div>
  );
}

function WorkspaceDetail({ workspaceId }: { workspaceId: string }) {
  const qc = useQueryClient();
  const detailFn = useServerFn(getWorkspaceDetail);
  const inviteFn = useServerFn(createInvite);
  const revokeFn = useServerFn(revokeInvite);
  const removeFn = useServerFn(removeMember);
  const regenFn = useServerFn(regenerateJoinCode);

  const dq = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => detailFn({ data: { id: workspaceId } }),
  });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<WorkspaceRole, "owner">>("member");
  const [copied, setCopied] = useState<string | null>(null);

  const inviteMut = useMutation({
    mutationFn: () => inviteFn({ data: { workspace_id: workspaceId, email, role } }),
    onSuccess: () => {
      toast.success("Invite created");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const revokeMut = useMutation({
    mutationFn: (id: string) => revokeFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", workspaceId] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const removeMut = useMutation({
    mutationFn: (user_id: string) => removeFn({ data: { workspace_id: workspaceId, user_id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workspace", workspaceId] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const regenMut = useMutation({
    mutationFn: () => regenFn({ data: { workspace_id: workspaceId } }),
    onSuccess: () => {
      toast.success("Join code regenerated");
      qc.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      qc.invalidateQueries({ queryKey: ["my-workspaces"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (dq.isLoading) return <div className="mt-8 text-sm text-muted-foreground"><Loader2 className="inline size-4 animate-spin mr-2" />Loading workspace…</div>;
  if (dq.error) return <div className="mt-8 text-sm text-destructive">{(dq.error as Error).message}</div>;
  if (!dq.data) return null;

  const { workspace, members, invites, myRole } = dq.data;
  const canManage = myRole === "owner" || myRole === "admin";

  const copyText = async (text: string, key: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 1500);
  };
  const copyInvite = (code: string) => copyText(`${window.location.origin}/invite/${code}`, code, "Invite link");

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-base font-semibold">{workspace.name}</div>
          <div className="text-xs text-muted-foreground">/{workspace.slug} · you are {myRole}</div>
        </div>
      </div>

      {/* Prominent join code — share to invite anyone instantly */}
      <div className="px-6 py-5 border-b border-border bg-muted/30">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <KeyRound className="size-3.5" /> Workspace access code
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <code className="px-4 py-2.5 rounded-md bg-ink text-surface font-mono text-lg tracking-widest select-all">
            {workspace.join_code}
          </code>
          <button
            onClick={() => copyText(workspace.join_code, `code-${workspace.id}`, "Code")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-sm font-medium hover:bg-card"
          >
            {copied === `code-${workspace.id}` ? <Check className="size-4" /> : <Copy className="size-4" />} Copy code
          </button>
          <button
            onClick={() => copyText(`${window.location.origin}/invite/${workspace.join_code}`, `link-${workspace.id}`, "Join link")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border text-sm font-medium hover:bg-card"
          >
            {copied === `link-${workspace.id}` ? <Check className="size-4" /> : <Copy className="size-4" />} Copy link
          </button>
          {canManage && (
            <button
              onClick={() => { if (confirm("Regenerate code? The old code stops working.")) regenMut.mutate(); }}
              disabled={regenMut.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-ink hover:bg-card disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${regenMut.isPending ? "animate-spin" : ""}`} /> Regenerate
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Anyone with this code can join as a member. Share it directly — no email required.
        </p>
      </div>

      {/* Live team chat */}
      <div className="border-b border-border h-[420px]">
        <WorkspaceChat workspaceId={workspace.id} />
      </div>
      {canManage && (
        <div className="px-6 py-5 border-b border-border">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Invite by email</div>
          <form
            onSubmit={(e) => { e.preventDefault(); if (email) inviteMut.mutate(); }}
            className="flex flex-wrap gap-2"
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="teammate@example.com"
              className="flex-1 min-w-[220px] px-3 py-2 rounded-md border border-border bg-surface text-sm"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "member")}
              className="px-3 py-2 rounded-md border border-border bg-surface text-sm"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              disabled={inviteMut.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-ink text-surface text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
            >
              <Mail className="size-4" /> Send invite
            </button>
          </form>
        </div>
      )}

      <div className="px-6 py-5 border-b border-border">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <Users className="size-3.5" /> Members ({members.length})
        </div>
        <ul className="divide-y divide-border">
          {members.map((m) => (
            <li key={m.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{m.email ?? m.user_id}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.role}</div>
              </div>
              {canManage && m.role !== "owner" && (
                <button
                  onClick={() => removeMut.mutate(m.user_id)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <UserMinus className="size-3.5" /> Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {canManage && (
        <div className="px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Pending invites ({invites.filter((i) => !i.accepted_at).length})
          </div>
          {invites.length === 0 ? (
            <div className="text-sm text-muted-foreground">No invites yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {invites.map((i) => (
                <li key={i.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{i.email}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {i.role} · {i.accepted_at ? "accepted" : `expires ${new Date(i.expires_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!i.accepted_at && (
                      <button
                        onClick={() => copyInvite(i.code)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-muted"
                      >
                        {copied === i.code ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} Copy link
                      </button>
                    )}
                    <button
                      onClick={() => revokeMut.mutate(i.id)}
                      className="size-7 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-muted"
                      title="Revoke"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">{icon}{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-sm mt-0.5 break-all ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}
