import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  Folder, FileText, Image as ImageIcon, Film, Music, Archive, Upload, Trash2,
  Settings, ChevronRight, Download, LogOut, Loader2, AlertCircle, Crown, FileIcon,
  Search, Star, X, Pencil, Save as SaveIcon,
} from "lucide-react";
import {
  getStorageState, listFiles, deleteFile, setPlan, getDownloadUrl,
  getFileText, updateFileText,
  type StoredFile,
} from "@/lib/storage.functions";

import { uploadAll } from "@/lib/upload-client";
import { formatBytes, PLAN_LABEL } from "@/lib/storage-format";

type TypeFilter = "all" | "image" | "video" | "audio" | "doc" | "archive" | "other";
const TYPE_LABELS: Record<TypeFilter, string> = {
  all: "All", image: "Images", video: "Video", audio: "Audio",
  doc: "Documents", archive: "Archives", other: "Other",
};
function classify(mime: string | null, name: string): TypeFilter {
  const m = mime ?? "";
  if (m.startsWith("image/")) return "image";
  if (m.startsWith("video/")) return "video";
  if (m.startsWith("audio/")) return "audio";
  if (m.includes("pdf") || m.includes("word") || m.includes("text") || m.includes("sheet") || m.includes("excel")) return "doc";
  if (m.includes("zip") || m.includes("rar") || m.includes("tar") || /\.(zip|rar|tar|gz|7z)$/i.test(name)) return "archive";
  return "other";
}
const STAR_KEY = "nodefms.starred.v1";
function loadStars(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(STAR_KEY) ?? "[]")); } catch { return new Set(); }
}


export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Workspace — Node FMS" }] }),
  component: AppPage,
});

function AppPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const getStateFn = useServerFn(getStorageState);

  const listFn = useServerFn(listFiles);
  const deleteFn = useServerFn(deleteFile);
  const setPlanFn = useServerFn(setPlan);
  const downloadFn = useServerFn(getDownloadUrl);
  const getTextFn = useServerFn(getFileText);
  const updateTextFn = useServerFn(updateFileText);

  // Inline cloud editor
  const [editor, setEditor] = useState<{
    id: string; name: string; original: string; content: string; loading: boolean; saving: boolean;
  } | null>(null);

  const openEdit = async (f: StoredFile) => {
    setEditor({ id: f.id, name: f.name, original: "", content: "", loading: true, saving: false });
    try {
      const r = await getTextFn({ data: { id: f.id } });
      setEditor({ id: r.id, name: r.name, original: r.content, content: r.content, loading: false, saving: false });
    } catch (e) {
      toast.error((e as Error).message);
      setEditor(null);
    }
  };

  const saveEdit = async () => {
    if (!editor || editor.saving) return;
    setEditor({ ...editor, saving: true });
    try {
      await updateTextFn({ data: { id: editor.id, content: editor.content } });
      toast.success(`Saved ${editor.name}`);
      qc.invalidateQueries({ queryKey: ["files"] });
      qc.invalidateQueries({ queryKey: ["storage-state"] });
      setEditor({ ...editor, original: editor.content, saving: false });
    } catch (e) {
      toast.error((e as Error).message);
      setEditor((s) => (s ? { ...s, saving: false } : s));
    }
  };

  const closeEdit = () => {
    if (editor && editor.content !== editor.original && !confirm("Discard unsaved changes?")) return;
    setEditor(null);
  };


  const stateQ = useQuery({ queryKey: ["storage-state"], queryFn: () => getStateFn() });
  const filesQ = useQuery({ queryKey: ["files"], queryFn: () => listFn() });

  // Search / filter / star / multi-select
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [starredOnly, setStarredOnly] = useState(false);
  const [stars, setStars] = useState<Set<string>>(() => loadStars());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    localStorage.setItem(STAR_KEY, JSON.stringify(Array.from(stars)));
  }, [stars]);

  const toggleStar = (id: string) =>
    setStars((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelect = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const visibleFiles = useMemo(() => {
    const all = filesQ.data ?? [];
    const q = query.trim().toLowerCase();
    return all.filter((f) => {
      if (q && !f.name.toLowerCase().includes(q)) return false;
      if (typeFilter !== "all" && classify(f.mime_type, f.name) !== typeFilter) return false;
      if (starredOnly && !stars.has(f.id)) return false;
      return true;
    });
  }, [filesQ.data, query, typeFilter, starredOnly, stars]);

  const allVisibleSelected = visibleFiles.length > 0 && visibleFiles.every((f) => selected.has(f.id));
  const toggleSelectAll = () =>
    setSelected((s) => {
      const n = new Set(s);
      if (allVisibleSelected) visibleFiles.forEach((f) => n.delete(f.id));
      else visibleFiles.forEach((f) => n.add(f.id));
      return n;
    });
  const clearSelection = () => setSelected(new Set());

  const planMut = useMutation({
    mutationFn: (plan: "free" | "starter" | "steady" | "suite") =>
      setPlanFn({ data: { plan } }),
    onSuccess: (r) => {
      toast.success(`Plan changed to ${PLAN_LABEL[r.plan]}`);
      qc.invalidateQueries({ queryKey: ["storage-state"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
      qc.invalidateQueries({ queryKey: ["storage-state"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} file${ids.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    setBulkBusy(true);
    let ok = 0, fail = 0;
    for (const id of ids) {
      try { await deleteFn({ data: { id } }); ok++; } catch { fail++; }
    }
    setBulkBusy(false);
    clearSelection();
    qc.invalidateQueries({ queryKey: ["files"] });
    qc.invalidateQueries({ queryKey: ["storage-state"] });
    if (fail === 0) toast.success(`Deleted ${ok} file${ok === 1 ? "" : "s"}`);
    else toast.error(`Deleted ${ok}, failed ${fail}`);
  };

  const bulkDownload = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkBusy(true);
    for (const id of ids) {
      try {
        const { url } = await downloadFn({ data: { id } });
        const a = document.createElement("a");
        a.href = url; a.rel = "noopener"; a.target = "_blank";
        document.body.appendChild(a); a.click(); a.remove();
        await new Promise((r) => setTimeout(r, 250));
      } catch (e) {
        toast.error((e as Error).message);
      }
    }
    setBulkBusy(false);
  };




  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else {
      toast.success("Signed out");
      navigate({ to: "/" });
    }
  };
  const handleFiles = async (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    const state = stateQ.data;
    const files: File[] = [];
    for (const f of Array.from(selected)) {
      if (state && f.size > state.maxFileBytes) {
        toast.error(`${f.name}: exceeds ${formatBytes(state.maxFileBytes)} per-file limit.`);
      } else {
        files.push(f);
      }
    }
    if (files.length === 0) return;
    setUploading(true);
    try {
      // Direct-to-storage parallel uploads — bytes never round-trip the server fn.
      await uploadAll(files, 4, (f, ok, err) => {
        if (ok) toast.success(`Uploaded ${f.name}`);
        else toast.error(`${f.name}: ${err ?? "upload failed"}`);
      });
      qc.invalidateQueries({ queryKey: ["files"] });
      qc.invalidateQueries({ queryKey: ["storage-state"] });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };


  const download = async (id: string) => {
    try {
      const { url } = await downloadFn({ data: { id } });
      window.location.href = url;
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const state = stateQ.data;
  const used = state?.usedBytes ?? 0;
  const cap = state?.capBytes ?? null;
  const pct = cap === null ? 0 : Math.min(100, (used / cap) * 100);
  const overLimit = cap !== null && used >= cap;
  const nearLimit = cap !== null && pct >= 80 && !overLimit;

  return (
    <div className="min-h-screen bg-surface text-ink flex">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <Link to="/" className="px-6 py-5 flex items-center gap-2 border-b border-border">
          <div className="size-5 bg-ink rounded-sm" />
          <span className="text-sm font-semibold tracking-tight">Node FMS</span>
        </Link>

        <div className="p-4 space-y-1 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          Plan
        </div>
        <div className="px-4 space-y-1">
          {(["free", "starter", "steady", "suite"] as const).map((p) => (
            <button
              key={p}
              onClick={() => planMut.mutate(p)}
              disabled={planMut.isPending || state?.plan === p}
              className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between ${
                state?.plan === p
                  ? "bg-ink text-surface"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="flex items-center gap-2">
                {p === "suite" && <Crown className="size-3.5" />}
                {PLAN_LABEL[p]}
              </span>
              <span className="text-[10px] opacity-70">
                {formatBytes(
                  p === "free" ? 536_870_912_000 :
                  p === "starter" ? 1_099_511_627_776 :
                  p === "steady" ? 5_497_558_138_880 : null
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto p-4 m-3 rounded-xl bg-muted">
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>Storage</span>
            {state && <span className="font-medium text-ink">{PLAN_LABEL[state.plan]}</span>}
          </div>
          <div className="mt-2 h-1.5 w-full bg-card rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${overLimit ? "bg-destructive" : nearLimit ? "bg-amber-500" : "bg-ink"}`}
              style={{ width: `${cap === null ? 4 : pct}%` }}
            />
          </div>
          <div className="mt-2 text-xs">
            <span className="font-semibold">{formatBytes(used)}</span>{" "}
            <span className="text-muted-foreground">
              of {formatBytes(cap)} used
            </span>
          </div>
          {overLimit && (
            <div className="mt-2 text-[11px] text-destructive flex items-start gap-1">
              <AlertCircle className="size-3 mt-0.5 shrink-0" />
              Over limit. Delete files or upgrade.
            </div>
          )}
          <Link to="/pricing" className="mt-3 inline-block text-xs font-medium text-ink underline-offset-2 hover:underline">
            See plans
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Workspace</span>
            <ChevronRight className="size-3.5" />
            <span className="text-ink font-medium">My files</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInput}
              type="file"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
            <button
              onClick={() => fileInput.current?.click()}
              disabled={uploading || overLimit}
              className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 bg-ink text-surface rounded-md hover:bg-ink/90 disabled:opacity-50"
              title={overLimit ? "Over storage limit" : "Upload files"}
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <Link to="/settings" className="size-9 grid place-items-center rounded-md hover:bg-muted text-muted-foreground hover:text-ink" title="Settings">
              <Settings className="size-4" />
            </Link>
            <button
              onClick={signOut}
              className="size-9 grid place-items-center rounded-md hover:bg-muted text-muted-foreground hover:text-ink"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
            <div
              className="size-8 rounded-full bg-ink text-surface grid place-items-center text-xs font-semibold ml-1"
              title={user?.email ?? ""}
            >
              {(user?.email ?? "?").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        {overLimit && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-8 py-3 flex items-center gap-3 text-sm">
            <AlertCircle className="size-4 text-destructive shrink-0" />
            <span className="text-ink">
              You're at {formatBytes(used)} of {formatBytes(cap)}. Uploads are blocked until you delete files or upgrade.
            </span>
            <Link to="/pricing" className="ml-auto text-xs font-medium underline underline-offset-2">
              View plans
            </Link>
          </div>
        )}

        <div
          className="flex-1 overflow-auto px-8 py-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          {filesQ.data && filesQ.data.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search files…"
                  className="w-full pl-9 pr-9 py-2 text-sm bg-card rounded-md ring-1 ring-black/5 focus:ring-2 focus:ring-ink/20 outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink">
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(TYPE_LABELS) as TypeFilter[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
                      typeFilter === t ? "bg-ink text-surface" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStarredOnly((v) => !v)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium inline-flex items-center gap-1 ${
                  starredOnly ? "bg-amber-100 text-amber-800" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Star className={`size-3.5 ${starredOnly ? "fill-amber-500 text-amber-500" : ""}`} />
                Starred
              </button>
            </div>
          )}

          {selected.size > 0 && (
            <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-ink text-surface rounded-lg text-sm">
              <span className="font-medium">{selected.size} selected</span>
              <button
                onClick={bulkDownload}
                disabled={bulkBusy}
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface/10 hover:bg-surface/20 disabled:opacity-50"
              >
                <Download className="size-3.5" /> Download
              </button>
              <button
                onClick={bulkDelete}
                disabled={bulkBusy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive hover:bg-destructive/90 disabled:opacity-50"
              >
                {bulkBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />} Delete
              </button>
              <button onClick={clearSelection} className="px-2 py-1 rounded hover:bg-surface/10" title="Clear">
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {filesQ.isLoading ? (
            <div className="text-center py-24 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin inline mr-2" /> Loading your files…
            </div>
          ) : !filesQ.data || filesQ.data.length === 0 ? (
            <EmptyState onClick={() => fileInput.current?.click()} disabled={overLimit} />
          ) : visibleFiles.length === 0 ? (
            <div className="text-center py-24 text-sm text-muted-foreground">
              No files match your filters.
            </div>
          ) : (
            <FileList
              files={visibleFiles}
              stars={stars}
              selected={selected}
              allSelected={allVisibleSelected}
              onToggleAll={toggleSelectAll}
              onToggleStar={toggleStar}
              onToggleSelect={toggleSelect}
              onDelete={(id) => deleteMut.mutate(id)}
              onDownload={download}
              onOpen={openEdit}
            />
          )}
        </div>


        <footer className="border-t border-border px-8 py-3 text-xs text-muted-foreground">
          Per-file limit: {state ? formatBytes(state.maxFileBytes) : "—"}. Plan limit enforced on every upload.
        </footer>
      </main>

      {editor && (
        <EditorModal
          editor={editor}
          onChange={(content) => setEditor((s) => (s ? { ...s, content } : s))}
          onSave={saveEdit}
          onClose={closeEdit}
        />
      )}
    </div>
  );


function EmptyState({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <div className="border-2 border-dashed border-border rounded-2xl py-24 text-center">
      <Upload className="size-8 text-muted-foreground mx-auto" strokeWidth={1.5} />
      <h3 className="mt-4 text-base font-semibold">No files yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Drag and drop here, or click to upload.</p>
      <button
        onClick={onClick}
        disabled={disabled}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 bg-ink text-surface rounded-md hover:bg-ink/90 disabled:opacity-50"
      >
        <Upload className="size-4" /> Upload your first file
      </button>
    </div>
  );
}

function FileList({
  files, stars, selected, allSelected,
  onToggleAll, onToggleStar, onToggleSelect, onDelete, onDownload,
}: {
  files: StoredFile[];
  stars: Set<string>;
  selected: Set<string>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleStar: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-black/5 overflow-hidden">
      <div className="grid grid-cols-12 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/40 items-center">
        <div className="col-span-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleAll}
            className="size-3.5 accent-ink cursor-pointer"
            aria-label="Select all"
          />
        </div>
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Uploaded</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>
      {files.map((f) => {
        const m = iconFor(f.mime_type, f.name);
        const isSel = selected.has(f.id);
        const isStar = stars.has(f.id);
        return (
          <div key={f.id} className={`grid grid-cols-12 items-center px-5 py-3 border-b border-border last:border-b-0 ${isSel ? "bg-ink/[0.04]" : "hover:bg-muted/40"}`}>
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={isSel}
                onChange={() => onToggleSelect(f.id)}
                className="size-3.5 accent-ink cursor-pointer"
                aria-label={`Select ${f.name}`}
              />
            </div>
            <div className="col-span-6 flex items-center gap-3 min-w-0">
              <div className={`size-9 rounded-md grid place-items-center ${m.cls}`}>
                <m.Icon className="size-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate flex items-center gap-1.5">
                  {f.name}
                  {isStar && <Star className="size-3 fill-amber-500 text-amber-500 shrink-0" />}
                </div>
                <div className="text-xs text-muted-foreground truncate">{f.mime_type ?? "—"}</div>
              </div>
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">
              {new Date(f.created_at).toLocaleDateString()}
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">{formatBytes(f.size_bytes)}</div>
            <div className="col-span-1 flex justify-end gap-1">
              <button
                onClick={() => onToggleStar(f.id)}
                className={`size-8 grid place-items-center rounded-md hover:bg-muted ${isStar ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"}`}
                title={isStar ? "Unstar" : "Star"}
              >
                <Star className={`size-4 ${isStar ? "fill-amber-500" : ""}`} />
              </button>
              <button
                onClick={() => onDownload(f.id)}
                className="size-8 grid place-items-center rounded-md hover:bg-muted text-muted-foreground hover:text-ink"
                title="Download"
              >
                <Download className="size-4" />
              </button>
              <button
                onClick={() => onDelete(f.id)}
                className="size-8 grid place-items-center rounded-md hover:bg-muted text-muted-foreground hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


function iconFor(mime: string | null, name: string) {
  const m = mime ?? "";
  if (m.startsWith("image/")) return { Icon: ImageIcon, cls: "bg-blue-50 text-blue-700" };
  if (m.startsWith("video/")) return { Icon: Film, cls: "bg-amber-50 text-amber-700" };
  if (m.startsWith("audio/")) return { Icon: Music, cls: "bg-violet-50 text-violet-700" };
  if (m.includes("pdf")) return { Icon: FileText, cls: "bg-red-50 text-red-700" };
  if (m.includes("zip") || m.includes("rar") || m.includes("tar") || name.match(/\.(zip|rar|tar|gz|7z)$/i))
    return { Icon: Archive, cls: "bg-zinc-100 text-zinc-700" };
  if (m.includes("word") || m.includes("text")) return { Icon: FileText, cls: "bg-blue-50 text-blue-700" };
  if (m.includes("sheet") || m.includes("excel")) return { Icon: FileText, cls: "bg-emerald-50 text-emerald-700" };
  void Folder;
  return { Icon: FileIcon, cls: "bg-muted text-muted-foreground" };
}
