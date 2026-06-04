import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { formatBytes } from "./storage-format";

const BUCKET = "user-files";
const MAX_FILE_BYTES = 16_106_127_360; // 15 GB — must match DB max_file_bytes()

const PLAN_CAPS = {
  free: 536_870_912_000,        // 500 GB
  starter: 1_099_511_627_776,   // 1 TB
  steady: 5_497_558_138_880,    // 5 TB
  suite: null,                  // unlimited
} as const;

type Plan = keyof typeof PLAN_CAPS;

export type StorageState = {
  plan: Plan;
  capBytes: number | null;
  usedBytes: number;
  maxFileBytes: number;
};

export type StoredFile = {
  id: string;
  name: string;
  size_bytes: number;
  mime_type: string | null;
  storage_path: string;
  created_at: string;
  workspace_id: string | null;
  user_id: string;
};

// Authorize access to a file row: owner, or a member of the file's workspace.
async function canAccessRow(
  row: { user_id: string; workspace_id: string | null },
  userId: string,
): Promise<boolean> {
  if (row.user_id === userId) return true;
  if (row.workspace_id) {
    const { data } = await supabaseAdmin
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", row.workspace_id)
      .eq("user_id", userId)
      .maybeSingle();
    return !!data;
  }
  return false;
}

async function assertWorkspaceMember(workspaceId: string, userId: string) {
  const { data } = await supabaseAdmin
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("You are not a member of this workspace.");
}

// ---------- Read state ----------

export const getStorageState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StorageState> => {
    const { supabase, userId } = context;

    const [{ data: sub }, { data: files }] = await Promise.all([
      supabase.from("user_subscriptions").select("plan").eq("user_id", userId).maybeSingle(),
      supabase.from("user_files").select("size_bytes").eq("user_id", userId),
    ]);

    const plan = (sub?.plan as Plan | undefined) ?? "free";
    const usedBytes = (files ?? []).reduce((s, r) => s + Number(r.size_bytes ?? 0), 0);

    return {
      plan,
      capBytes: PLAN_CAPS[plan],
      usedBytes,
      maxFileBytes: MAX_FILE_BYTES,
    };
  });

export const listFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ workspace_id: z.string().uuid().nullish() }).optional().parse(input),
  )
  .handler(async ({ data, context }): Promise<StoredFile[]> => {
    const { supabase, userId } = context;
    const wsId = data?.workspace_id ?? null;

    let query = supabase
      .from("user_files")
      .select("id, name, size_bytes, mime_type, storage_path, created_at, workspace_id, user_id")
      .order("created_at", { ascending: false });

    query = wsId
      ? query.eq("workspace_id", wsId)
      : query.eq("user_id", userId).is("workspace_id", null);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r) => ({
      ...r,
      size_bytes: Number(r.size_bytes),
    }));
  });

// ---------- Upload ----------

function sanitizeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 200) || "file";
}

export const uploadFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => {
    if (!(data instanceof FormData)) throw new Error("Expected FormData");
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Missing file");
    return { file };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { file } = data;
    const size = file.size;

    if (size <= 0) throw new Error("Empty file");
    if (size > MAX_FILE_BYTES) {
      throw new Error(`File too large. Maximum per upload is ${formatBytes(MAX_FILE_BYTES)}.`);
    }

    // Re-fetch plan + usage with admin client (consistent server read).
    const [{ data: sub }, { data: usageRows }] = await Promise.all([
      supabaseAdmin.from("user_subscriptions").select("plan").eq("user_id", userId).maybeSingle(),
      supabaseAdmin.from("user_files").select("size_bytes").eq("user_id", userId),
    ]);

    const plan = (sub?.plan as Plan | undefined) ?? "free";
    const cap = PLAN_CAPS[plan];
    const used = (usageRows ?? []).reduce((s, r) => s + Number(r.size_bytes ?? 0), 0);

    if (cap !== null && used + size > cap) {
      throw new Error(
        `Upload would exceed your ${formatBytes(cap)} plan limit. ` +
          `You've used ${formatBytes(used)}. Free up space or upgrade your plan.`,
      );
    }

    const safe = sanitizeName(file.name);
    const path = `${userId}/${crypto.randomUUID()}-${safe}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) throw new Error(upErr.message);

    const { data: row, error: insErr } = await supabaseAdmin
      .from("user_files")
      .insert({
        user_id: userId,
        storage_path: path,
        name: file.name.slice(0, 200) || safe,
        size_bytes: size,
        mime_type: file.type || null,
      })
      .select("id, name, size_bytes, mime_type, storage_path, created_at, workspace_id, user_id")
      .single();

    if (insErr) {
      // Roll back the blob if the trigger (quota) or insert failed.
      await supabaseAdmin.storage.from(BUCKET).remove([path]);
      if (insErr.message.includes("storage_quota_exceeded")) {
        throw new Error("Upload would exceed your plan's storage limit.");
      }
      if (insErr.message.includes("file_too_large")) {
        throw new Error(`File too large. Maximum is ${formatBytes(MAX_FILE_BYTES)}.`);
      }
      throw new Error(insErr.message);
    }

    return { ...row, size_bytes: Number(row.size_bytes) } as StoredFile;
  });

// ---------- Delete ----------

export const deleteFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: row, error } = await supabaseAdmin
      .from("user_files")
      .select("id, storage_path, user_id, workspace_id")
      .eq("id", data.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row || !(await canAccessRow(row, userId))) throw new Error("Not found");

    await supabaseAdmin.storage.from("user-files").remove([row.storage_path]);
    const { error: delErr } = await supabaseAdmin.from("user_files").delete().eq("id", row.id);
    if (delErr) throw new Error(delErr.message);

    return { ok: true };
  });

// ---------- Plan switch (self-service for now) ----------

export const setPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ plan: z.enum(["free", "starter", "steady", "suite"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { error } = await supabaseAdmin
      .from("user_subscriptions")
      .upsert({ user_id: userId, plan: data.plan }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true, plan: data.plan };
  });

// ---------- Signed download URL ----------

export const getDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), download: z.boolean().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: row, error } = await supabaseAdmin
      .from("user_files")
      .select("storage_path, user_id, name")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || row.user_id !== userId) throw new Error("Not found");

    const wantsDownload = data.download ?? true;
    const { data: signed, error: signErr } = wantsDownload
      ? await supabaseAdmin.storage
          .from("user-files")
          .createSignedUrl(row.storage_path, 60, { download: row.name })
      : await supabaseAdmin.storage
          .from("user-files")
          .createSignedUrl(row.storage_path, 3600);
    if (signErr) throw new Error(signErr.message);
    return { url: signed.signedUrl };

  });

// ---------- Open & edit text files in place ----------

const MAX_EDITABLE_BYTES = 2 * 1024 * 1024; // 2 MB cap for in-app editor

function isLikelyText(mime: string | null, name: string): boolean {
  const m = (mime ?? "").toLowerCase();
  if (m.startsWith("text/")) return true;
  if (/(json|xml|yaml|javascript|typescript|csv|html|sql|toml|markdown|x-sh)/.test(m)) return true;
  if (/\.(txt|md|markdown|json|yaml|yml|xml|html|htm|css|scss|sass|less|js|jsx|ts|tsx|mjs|cjs|csv|tsv|log|sh|bash|zsh|sql|toml|ini|env|conf|gitignore|py|rb|go|rs|java|kt|c|h|cpp|hpp|php|svelte|vue|astro)$/i.test(name)) return true;
  return false;
}

export const getFileText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: row, error } = await supabaseAdmin
      .from("user_files")
      .select("id, name, mime_type, size_bytes, storage_path, user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || row.user_id !== userId) throw new Error("Not found");
    if (Number(row.size_bytes) > MAX_EDITABLE_BYTES) {
      throw new Error(`Files larger than ${Math.round(MAX_EDITABLE_BYTES / 1024 / 1024)} MB can't be opened in the editor.`);
    }
    if (!isLikelyText(row.mime_type, row.name)) {
      throw new Error("This file type can't be opened as text. Download it instead.");
    }
    const { data: blob, error: dlErr } = await supabaseAdmin.storage.from(BUCKET).download(row.storage_path);
    if (dlErr || !blob) throw new Error(dlErr?.message ?? "Download failed");
    const text = await blob.text();
    return { id: row.id, name: row.name, mime: row.mime_type, content: text };
  });

export const updateFileText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), content: z.string().max(MAX_EDITABLE_BYTES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: row, error } = await supabaseAdmin
      .from("user_files")
      .select("id, storage_path, size_bytes, mime_type, name, user_id")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || row.user_id !== userId) throw new Error("Not found");
    if (!isLikelyText(row.mime_type, row.name)) {
      throw new Error("This file type can't be edited as text.");
    }

    const bytes = new TextEncoder().encode(data.content);
    const newSize = bytes.byteLength;
    if (newSize > MAX_EDITABLE_BYTES) {
      throw new Error(`Editor limit is ${Math.round(MAX_EDITABLE_BYTES / 1024 / 1024)} MB.`);
    }

    // Quota check (delta-based)
    const delta = newSize - Number(row.size_bytes);
    if (delta > 0) {
      const [{ data: sub }, { data: usageRows }] = await Promise.all([
        supabaseAdmin.from("user_subscriptions").select("plan").eq("user_id", userId).maybeSingle(),
        supabaseAdmin.from("user_files").select("size_bytes").eq("user_id", userId),
      ]);
      const plan = (sub?.plan as Plan | undefined) ?? "free";
      const cap = PLAN_CAPS[plan];
      const used = (usageRows ?? []).reduce((s, r) => s + Number(r.size_bytes ?? 0), 0);
      if (cap !== null && used + delta > cap) {
        throw new Error(`Save would exceed your ${formatBytes(cap)} plan limit.`);
      }
    }

    const { error: upErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(row.storage_path, bytes, {
        contentType: row.mime_type ?? "text/plain",
        upsert: true,
      });
    if (upErr) throw new Error(upErr.message);

    const { error: updErr } = await supabaseAdmin
      .from("user_files")
      .update({ size_bytes: newSize })
      .eq("id", row.id);
    if (updErr) throw new Error(updErr.message);

    return { ok: true, size_bytes: newSize };
  });

