import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BUCKET = "user-files";
const MAX_FILE_BYTES = 16_106_127_360; // 15 GB

const PLAN_CAPS: Record<string, number | null> = {
  free: 536_870_912_000,
  starter: 1_099_511_627_776,
  steady: 5_497_558_138_880,
  suite: null,
};

function sanitize(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 200) || "file";
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

/**
 * Step 1: client requests a signed upload URL. Server checks plan cap.
 * Client then PUTs the file bytes directly to storage — no 15 GB request
 * body ever passes through the server function runtime.
 */
export const createUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      name: z.string().min(1).max(255),
      size: z.number().int().positive().max(MAX_FILE_BYTES),
      mime_type: z.string().max(200).optional(),
      workspace_id: z.string().uuid().nullish(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    if (data.workspace_id) {
      await assertWorkspaceMember(data.workspace_id, userId);
    }

    const [{ data: sub }, { data: usage }] = await Promise.all([
      supabaseAdmin.from("user_subscriptions").select("plan").eq("user_id", userId).maybeSingle(),
      supabaseAdmin.from("user_files").select("size_bytes").eq("user_id", userId),
    ]);
    const plan = (sub?.plan ?? "free") as keyof typeof PLAN_CAPS;
    const cap = PLAN_CAPS[plan];
    const used = (usage ?? []).reduce((s, r) => s + Number(r.size_bytes ?? 0), 0);
    if (cap !== null && used + data.size > cap) {
      throw new Error("Upload would exceed your plan's storage limit.");
    }

    const prefix = data.workspace_id ? `ws/${data.workspace_id}` : userId;
    const path = `${prefix}/${crypto.randomUUID()}-${sanitize(data.name)}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);
    if (error) throw new Error(error.message);

    return {
      path,
      token: signed.token,
      signedUrl: signed.signedUrl,
      bucket: BUCKET,
    };
  });

/**
 * Step 2: after direct-to-storage upload completes, register the row.
 * Trigger enforces quota one more time as a safety net.
 */
export const registerUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      path: z.string().min(1).max(512),
      name: z.string().min(1).max(255),
      size: z.number().int().positive().max(MAX_FILE_BYTES),
      mime_type: z.string().max(200).optional(),
      workspace_id: z.string().uuid().nullish(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Path must belong to this user, or to the target workspace folder.
    if (data.workspace_id) {
      await assertWorkspaceMember(data.workspace_id, userId);
      if (!data.path.startsWith(`ws/${data.workspace_id}/`)) {
        throw new Error("Invalid upload path");
      }
    } else if (!data.path.startsWith(`${userId}/`)) {
      throw new Error("Invalid upload path");
    }

    const { data: row, error } = await supabaseAdmin
      .from("user_files")
      .insert({
        user_id: userId,
        workspace_id: data.workspace_id ?? null,
        storage_path: data.path,
        name: data.name.slice(0, 200),
        size_bytes: data.size,
        mime_type: data.mime_type ?? null,
      })
      .select("id, name, size_bytes, mime_type, storage_path, created_at, workspace_id, user_id")
      .single();

    if (error) {
      // Clean up the blob if registration failed
      await supabaseAdmin.storage.from(BUCKET).remove([data.path]);
      throw new Error(error.message);
    }
    return { ...row, size_bytes: Number(row.size_bytes) };
  });
