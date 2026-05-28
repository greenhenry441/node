import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type WorkspaceRole = "owner" | "admin" | "member";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  role: WorkspaceRole;
  join_code: string;
  created_at: string;
};

export type WorkspaceMember = {
  id: string;
  user_id: string;
  email: string | null;
  role: WorkspaceRole;
  created_at: string;
};

export type WorkspaceInvite = {
  id: string;
  email: string;
  role: WorkspaceRole;
  code: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

function randomCode(len = 18) {
  return Array.from(crypto.getRandomValues(new Uint8Array(len)))
    .map((b) => "abcdefghijkmnopqrstuvwxyz23456789"[b % 33])
    .join("");
}
const newJoinCode = () => randomCode(10);

// ---------- List my workspaces ----------

export const listMyWorkspaces = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Workspace[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("workspace_members")
      .select("role, workspaces:workspace_id (id, name, slug, owner_id, join_code, created_at)")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row: { role: WorkspaceRole; workspaces: { id: string; name: string; slug: string; owner_id: string; join_code: string; created_at: string } | null }) =>
        row.workspaces
          ? {
              ...row.workspaces,
              role: row.role,
            }
          : null,
      )
      .filter((x): x is Workspace => x !== null);
  });

// ---------- Create workspace ----------

export const createWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ name: z.string().min(1).max(80) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    let baseSlug = slugify(data.name) || "workspace";
    if (baseSlug.length < 3) baseSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    let slug = baseSlug;
    for (let i = 0; i < 6; i++) {
      const { data: existing } = await supabaseAdmin
        .from("workspaces").select("id").eq("slug", slug).maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 5)}`;
    }
    const { data: ws, error } = await supabaseAdmin
      .from("workspaces")
      .insert({ name: data.name, slug, owner_id: userId, join_code: newJoinCode() })
      .select("id, name, slug, owner_id, join_code, created_at")
      .single();
    if (error) throw new Error(error.message);
    return { ...ws, role: "owner" as WorkspaceRole };
  });

// ---------- Get workspace detail ----------

export const getWorkspaceDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: membership, error: mErr } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (mErr) throw new Error(mErr.message);
    if (!membership) throw new Error("Not a member of this workspace");

    const [{ data: ws }, { data: rawMembers }, invitesRes] = await Promise.all([
      supabase.from("workspaces").select("id, name, slug, owner_id, created_at").eq("id", data.id).single(),
      supabase.from("workspace_members").select("id, user_id, role, created_at").eq("workspace_id", data.id),
      membership.role === "owner" || membership.role === "admin"
        ? supabase
            .from("workspace_invites")
            .select("id, email, role, code, expires_at, accepted_at, created_at")
            .eq("workspace_id", data.id)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as WorkspaceInvite[] }),
    ]);

    // Resolve member emails via admin (auth schema not exposed otherwise)
    const userIds = (rawMembers ?? []).map((m) => m.user_id);
    const emails = new Map<string, string | null>();
    if (userIds.length) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
      for (const u of usersData?.users ?? []) {
        if (userIds.includes(u.id)) emails.set(u.id, u.email ?? null);
      }
    }
    const members: WorkspaceMember[] = (rawMembers ?? []).map((m) => ({
      ...m,
      email: emails.get(m.user_id) ?? null,
    }));

    return {
      workspace: { ...ws!, role: membership.role as WorkspaceRole },
      members,
      invites: (invitesRes.data ?? []) as WorkspaceInvite[],
      myRole: membership.role as WorkspaceRole,
    };
  });

// ---------- Create invite ----------

export const createInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      workspace_id: z.string().uuid(),
      email: z.string().email().max(254),
      role: z.enum(["admin", "member"]).default("member"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: m } = await supabaseAdmin
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", data.workspace_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!m || (m.role !== "owner" && m.role !== "admin")) {
      throw new Error("Only owners and admins can invite");
    }

    const code = randomCode();
    const { data: inv, error } = await supabaseAdmin
      .from("workspace_invites")
      .insert({
        workspace_id: data.workspace_id,
        email: data.email.toLowerCase(),
        role: data.role,
        code,
        invited_by: userId,
      })
      .select("id, email, role, code, expires_at, accepted_at, created_at")
      .single();
    if (error) throw new Error(error.message);
    return inv as WorkspaceInvite;
  });

// ---------- Revoke invite ----------

export const revokeInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("workspace_invites").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Remove member ----------

export const removeMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ workspace_id: z.string().uuid(), user_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.user_id === userId) {
      // leaving — allow
    }
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", data.workspace_id)
      .eq("user_id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Lookup invite by code (used by /invite/$code) ----------

export const getInviteByCode = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ code: z.string().min(8).max(64).regex(/^[a-z0-9]+$/) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: inv } = await supabaseAdmin
      .from("workspace_invites")
      .select("id, email, role, code, expires_at, accepted_at, workspace_id, workspaces:workspace_id(name, slug)")
      .eq("code", data.code)
      .maybeSingle();
    if (!inv) return { invite: null as null };
    return {
      invite: {
        id: inv.id,
        email: inv.email,
        role: inv.role as WorkspaceRole,
        expires_at: inv.expires_at,
        accepted_at: inv.accepted_at,
        workspace: inv.workspaces as { name: string; slug: string } | null,
      },
    };
  });

// ---------- Accept invite ----------

export const acceptInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ code: z.string().min(8).max(64).regex(/^[a-z0-9]+$/) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const email = (claims?.email ?? "").toString().toLowerCase();

    const { data: inv } = await supabaseAdmin
      .from("workspace_invites")
      .select("id, workspace_id, email, role, accepted_at, expires_at")
      .eq("code", data.code)
      .maybeSingle();

    if (!inv) throw new Error("Invite not found");
    if (inv.accepted_at) throw new Error("Invite already used");
    if (new Date(inv.expires_at) < new Date()) throw new Error("Invite expired");
    if (email && inv.email.toLowerCase() !== email) {
      throw new Error(`This invite is for ${inv.email}. Sign in with that email to accept.`);
    }

    await supabaseAdmin
      .from("workspace_members")
      .insert({ workspace_id: inv.workspace_id, user_id: userId, role: inv.role })
      .then(({ error }) => {
        // Ignore unique-violation if already a member
        if (error && !error.message.includes("duplicate")) throw new Error(error.message);
      });

    await supabaseAdmin
      .from("workspace_invites")
      .update({ accepted_at: new Date().toISOString(), accepted_by: userId })
      .eq("id", inv.id);

    return { workspace_id: inv.workspace_id };
  });
