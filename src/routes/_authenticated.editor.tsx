import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FilePlus2, FolderOpen, Save, Download, Monitor, Globe, FileText, Image as ImageIcon, FileAudio, FileVideo, FileArchive, File as FileIcon, Search, Eye, EyeOff } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/_authenticated/editor")({
  head: () => ({
    meta: [
      { title: "Editor — Node FMS" },
      { name: "description", content: "Open and edit any file type — text, code, images, PDFs, audio, video, and more — right inside Node FMS." },
    ],
  }),
  component: EditorPage,
});

type DesktopAPI = {
  isDesktop: true;
  version: string;
  platform: string;
  openFile: () => Promise<{ filePath: string; content: string; name: string } | null>;
  saveFile: (filePath: string, content: string) => Promise<{ filePath: string; savedAt: number }>;
  saveFileAs: (
    content: string,
    suggestedName?: string,
  ) => Promise<{ filePath: string; savedAt: number } | null>;
  onMenu: (channel: string, handler: (payload?: unknown) => void) => () => void;
};

declare global {
  interface Window {
    nodeFMS?: DesktopAPI;
  }
}

// Extensions we treat as editable text.
const TEXT_EXTS = new Set([
  "txt","md","markdown","rst","log","csv","tsv","json","jsonc","ndjson","xml","yml","yaml","toml","ini","cfg","conf","env",
  "js","jsx","ts","tsx","mjs","cjs","css","scss","sass","less","html","htm","svg",
  "py","rb","go","rs","java","kt","kts","swift","c","h","cpp","hpp","cc","cs","php","sh","bash","zsh","fish","ps1","sql",
  "lua","r","pl","pm","ex","exs","erl","clj","cljs","dart","gradle","make","mk","dockerfile","gitignore","gitattributes","prettierrc","editorconfig"
]);

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  if (i <= 0) return name.toLowerCase();
  return name.slice(i + 1).toLowerCase();
}

function isTextMime(mime: string) {
  return mime.startsWith("text/") || mime.includes("json") || mime.includes("xml") || mime.includes("javascript") || mime.includes("ecmascript") || mime.includes("yaml") || mime.includes("toml");
}

type ViewKind = "text" | "image" | "pdf" | "audio" | "video" | "binary";

function detectKind(name: string, mime: string): ViewKind {
  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (isTextMime(mime)) return "text";
  if (TEXT_EXTS.has(extOf(name))) return "text";
  const ext = extOf(name);
  if (["png","jpg","jpeg","gif","webp","avif","bmp","ico","svg"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["mp3","wav","ogg","m4a","flac","aac"].includes(ext)) return "audio";
  if (["mp4","webm","mov","mkv","avi"].includes(ext)) return "video";
  return "binary";
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function EditorPage() {
  const api = typeof window !== "undefined" ? window.nodeFMS : undefined;
  const isDesktop = !!api?.isDesktop;

  const [filePath, setFilePath] = useState<string | null>(null);
  const [name, setName] = useState<string>("untitled.txt");
  const [mime, setMime] = useState<string>("text/plain");
  const [size, setSize] = useState<number>(0);
  const [kind, setKind] = useState<ViewKind>("text");
  const [content, setContent] = useState<string>("");
  const [savedContent, setSavedContent] = useState<string>("");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Ready");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const dirty = kind === "text" && content !== savedContent;

  // Revoke any previous object URL when it changes/unmounts.
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const loadFromFile = useCallback(async (f: File) => {
    const k = detectKind(f.name, f.type || "");
    setName(f.name);
    setMime(f.type || "application/octet-stream");
    setSize(f.size);
    setKind(k);
    setFilePath(null);

    if (blobUrl) URL.revokeObjectURL(blobUrl);

    if (k === "text") {
      const text = await f.text();
      setContent(text);
      setSavedContent(text);
      setBlobUrl(null);
      setStatus(`Opened ${f.name} · ${formatBytes(f.size)}`);
    } else {
      const url = URL.createObjectURL(f);
      setBlobUrl(url);
      setContent("");
      setSavedContent("");
      setStatus(`Previewing ${f.name} · ${formatBytes(f.size)}`);
    }
  }, [blobUrl]);

  const open = useCallback(async () => {
    if (api) {
      const res = await api.openFile();
      if (!res) return;
      const k = detectKind(res.name, "");
      setFilePath(res.filePath);
      setName(res.name);
      setMime("text/plain");
      setSize(new Blob([res.content]).size);
      setKind(k === "text" ? "text" : "text"); // desktop bridge currently returns utf-8 text
      setContent(res.content);
      setSavedContent(res.content);
      if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null); }
      setStatus(`Opened ${res.name}`);
      return;
    }
    // Browser: accept any file type
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      await loadFromFile(f);
    };
    input.click();
  }, [api, blobUrl, loadFromFile]);

  const save = useCallback(async () => {
    if (kind !== "text") {
      // For binary previews, "save" downloads a copy of the loaded blob.
      if (blobUrl) {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = name;
        a.click();
        setStatus(`Downloaded ${name}`);
      }
      return;
    }
    if (api && filePath) {
      await api.saveFile(filePath, content);
      setSavedContent(content);
      setStatus(`Saved ${name}`);
      return;
    }
    if (api) {
      const res = await api.saveFileAs(content, name);
      if (!res) return;
      setFilePath(res.filePath);
      setName(res.filePath.split(/[\\/]/).pop() || name);
      setSavedContent(content);
      setStatus(`Saved ${res.filePath}`);
      return;
    }
    const blob = new Blob([content], { type: mime || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    setSavedContent(content);
    setStatus(`Downloaded ${name}`);
  }, [kind, blobUrl, api, filePath, content, name, mime]);

  const saveAs = useCallback(async () => {
    if (api && kind === "text") {
      const res = await api.saveFileAs(content, name);
      if (!res) return;
      setFilePath(res.filePath);
      setName(res.filePath.split(/[\\/]/).pop() || name);
      setSavedContent(content);
      setStatus(`Saved as ${res.filePath}`);
      return;
    }
    save();
  }, [api, content, name, save, kind]);

  const newFile = useCallback(() => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    if (blobUrl) { URL.revokeObjectURL(blobUrl); setBlobUrl(null); }
    setFilePath(null);
    setName("untitled.txt");
    setMime("text/plain");
    setSize(0);
    setKind("text");
    setContent("");
    setSavedContent("");
    setStatus("New file");
  }, [dirty, blobUrl]);

  // Drag & drop any file onto the page
  useEffect(() => {
    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer?.files?.[0];
      if (f) await loadFromFile(f);
    };
    const onDragOver = (e: DragEvent) => e.preventDefault();
    window.addEventListener("drop", onDrop);
    window.addEventListener("dragover", onDragOver);
    return () => {
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("dragover", onDragOver);
    };
  }, [loadFromFile]);

  useEffect(() => {
    if (!api) return;
    const offs = [
      api.onMenu("menu:open", () => open()),
      api.onMenu("menu:save", () => save()),
      api.onMenu("menu:save-as", () => saveAs()),
      api.onMenu("menu:new", () => newFile()),
    ];
    return () => offs.forEach((o) => o());
  }, [api, open, save, saveAs, newFile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === "s") { e.preventDefault(); e.shiftKey ? saveAs() : save(); }
      else if (k === "o") { e.preventDefault(); open(); }
      else if (k === "n") { e.preventDefault(); newFile(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, save, saveAs, newFile]);

  const stats = useMemo(() => {
    if (kind === "text") {
      const lines = content.split("\n").length;
      const chars = content.length;
      return `${lines} ln · ${chars} ch`;
    }
    return `${kind} · ${formatBytes(size)}`;
  }, [kind, content, size]);

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <SiteHeader />

      <section className="border-b border-border/60">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              {isDesktop ? <Monitor className="size-3.5" /> : <Globe className="size-3.5" />}
              {isDesktop ? `Desktop · Electron ${api?.version} · ${api?.platform}` : "Browser preview"}
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">
              {name}{dirty ? " •" : ""}
            </h1>
            {filePath && (
              <div className="mt-1 text-xs text-muted-foreground font-mono truncate max-w-[60ch]">
                {filePath}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Btn onClick={newFile} icon={FilePlus2} label="New" kbd="⌘N" />
            <Btn onClick={open} icon={FolderOpen} label="Open" kbd="⌘O" />
            <Btn onClick={save} icon={Save} label={kind === "text" ? "Save" : "Download"} kbd="⌘S" primary />
            {kind === "text" && <Btn onClick={saveAs} icon={Download} label="Save As" kbd="⇧⌘S" />}
          </div>
        </div>
      </section>

      {!isDesktop && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-start gap-3">
            <FileText className="size-4 mt-0.5" />
            <p>
              Browser mode: open any file — text & code edit inline, images / PDFs / audio / video preview, other binaries can be downloaded. For local save in place, use the{" "}
              <Link to="/download" className="underline font-medium">Node FMS desktop app</Link>.
            </p>
          </div>
        </div>
      )}

      <section className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-6 h-full">
          {kind === "text" && (
            <textarea
              ref={taRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              placeholder="Start typing, drop a file anywhere, or press ⌘O to open one…"
              className="w-full h-[60vh] md:h-[68vh] resize-none rounded-2xl bg-card ring-1 ring-black/5 p-5 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ink/30"
            />
          )}

          {kind === "image" && blobUrl && (
            <div className="rounded-2xl bg-card ring-1 ring-black/5 p-5 h-[60vh] md:h-[68vh] grid place-items-center overflow-auto">
              <img src={blobUrl} alt={name} className="max-w-full max-h-full object-contain" />
            </div>
          )}

          {kind === "pdf" && blobUrl && (
            <iframe
              src={blobUrl}
              title={name}
              className="w-full h-[60vh] md:h-[68vh] rounded-2xl bg-card ring-1 ring-black/5"
            />
          )}

          {kind === "audio" && blobUrl && (
            <div className="rounded-2xl bg-card ring-1 ring-black/5 p-8 h-[60vh] md:h-[68vh] grid place-items-center">
              <div className="flex flex-col items-center gap-4">
                <FileAudio className="size-12 text-muted-foreground" strokeWidth={1.5} />
                <audio src={blobUrl} controls className="w-[420px] max-w-full" />
              </div>
            </div>
          )}

          {kind === "video" && blobUrl && (
            <div className="rounded-2xl bg-black ring-1 ring-black/5 h-[60vh] md:h-[68vh] grid place-items-center overflow-hidden">
              <video src={blobUrl} controls className="max-w-full max-h-full" />
            </div>
          )}

          {kind === "binary" && (
            <div className="rounded-2xl bg-card ring-1 ring-black/5 p-10 h-[60vh] md:h-[68vh] grid place-items-center text-center">
              <div className="flex flex-col items-center gap-3 max-w-md">
                <BinaryIcon name={name} />
                <div className="text-lg font-medium">{name}</div>
                <div className="text-xs font-mono text-muted-foreground">
                  {mime || "application/octet-stream"} · {formatBytes(size)}
                </div>
                <p className="text-sm text-muted-foreground">
                  This file type can't be previewed inline, but it's loaded and ready. Use Download to save a copy locally.
                </p>
                {blobUrl && (
                  <a
                    href={blobUrl}
                    download={name}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-surface text-sm font-medium hover:bg-ink/90"
                  >
                    <Download className="size-4" /> Download
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <span>{status}</span>
          <span>{stats}{kind === "text" ? (dirty ? " · unsaved" : " · saved") : ""}</span>
        </div>
      </footer>
    </div>
  );
}

function BinaryIcon({ name }: { name: string }) {
  const ext = extOf(name);
  if (["zip","tar","gz","rar","7z","bz2","xz"].includes(ext)) return <FileArchive className="size-12 text-muted-foreground" strokeWidth={1.5} />;
  if (["png","jpg","jpeg","gif","webp","avif","bmp","ico"].includes(ext)) return <ImageIcon className="size-12 text-muted-foreground" strokeWidth={1.5} />;
  if (["mp3","wav","ogg","m4a","flac","aac"].includes(ext)) return <FileAudio className="size-12 text-muted-foreground" strokeWidth={1.5} />;
  if (["mp4","webm","mov","mkv","avi"].includes(ext)) return <FileVideo className="size-12 text-muted-foreground" strokeWidth={1.5} />;
  return <FileIcon className="size-12 text-muted-foreground" strokeWidth={1.5} />;
}

function Btn({
  onClick, icon: Icon, label, kbd, primary,
}: {
  onClick: () => void;
  icon: typeof FilePlus2;
  label: string;
  kbd?: string;
  primary?: boolean;
}) {
  const base = "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors";
  const cls = primary
    ? `${base} bg-ink text-surface hover:bg-ink/90`
    : `${base} border border-ink/10 hover:bg-ink/5`;
  return (
    <button onClick={onClick} className={cls}>
      <Icon className="size-4" strokeWidth={1.75} />
      {label}
      {kbd && <span className="text-[10px] opacity-60 font-mono ml-1">{kbd}</span>}
    </button>
  );
}
