import { supabase } from "@/integrations/supabase/client";
import { createUploadUrl, registerUpload } from "./upload.functions";

const BUCKET = "user-files";

/**
 * Direct-to-storage upload. Avoids round-tripping 15 GB through the
 * server function runtime — bytes go straight to Storage from the browser.
 *
 * Calls onProgress(0..1) when bytes flush.
 */
export async function uploadDirect(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ id: string; name: string; size_bytes: number; mime_type: string | null; storage_path: string; created_at: string }> {
  const reserved = await createUploadUrl({
    data: { name: file.name, size: file.size, mime_type: file.type || undefined },
  });

  // Use Supabase JS — it handles the signed token + correct upsert semantics.
  // For very large files Supabase splits into multipart automatically.
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .uploadToSignedUrl(reserved.path, reserved.token, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (upErr) throw new Error(upErr.message);
  onProgress?.(1);

  const row = await registerUpload({
    data: {
      path: reserved.path,
      name: file.name,
      size: file.size,
      mime_type: file.type || undefined,
    },
  });
  return row;
}

/** Run uploads in parallel, capped to N concurrent connections. */
export async function uploadAll(files: File[], concurrency = 4, onEach?: (f: File, ok: boolean, err?: string) => void) {
  const queue = [...files];
  const results: Array<{ file: File; ok: boolean; err?: string }> = [];
  async function worker() {
    while (queue.length) {
      const f = queue.shift()!;
      try {
        await uploadDirect(f);
        results.push({ file: f, ok: true });
        onEach?.(f, true);
      } catch (e) {
        const msg = (e as Error).message;
        results.push({ file: f, ok: false, err: msg });
        onEach?.(f, false, msg);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
  return results;
}
