import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BUCKET = "user-files";
const MAX_FILE_BYTES = 26_214_400; // 25 MB — must match DB max_file_bytes()

const PLAN_CAPS = {
  free: 107_374_182_400,
  starter: 536_870_912_000,
  steady: 1_099_511_627_776,
  suite: null,
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
};

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
  .handler(async ({ context }): Promise<StoredFile[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_files")
      .select("id, name, size_bytes, mime_type, storage_path, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => ({
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
      .select("id, name, size_bytes, mime_type, storage_path, created_at")
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
      .select("id, storage_path, user_id")
      .eq("id", data.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row || row.user_id !== userId) throw new Error("Not found");

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
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: row, error } = await supabaseAdmin
      .from("user_files")
      .select("storage_path, user_id, name")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row || row.user_id !== userId) throw new Error("Not found");

    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("user-files")
      .createSignedUrl(row.storage_path, 60, { download: row.name });
    if (signErr) throw new Error(signErr.message);
    return { url: signed.signedUrl };
  });

// ---------- Helpers ----------

export function formatBytes(n: number | null): string {
  if (n === null) return "Unlimited";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 2 : v < 100 ? 1 : 0)} ${units[i]}`;
}
