import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FilePlus2, FolderOpen, Save, Download, Monitor, Globe, FileText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/_authenticated/editor")({
  head: () => ({
    meta: [
      { title: "Editor — Node FMS Desktop" },
      { name: "description", content: "Open and edit local files inside the Node FMS desktop app." },
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

function EditorPage() {
  const api = typeof window !== "undefined" ? window.nodeFMS : undefined;
  const isDesktop = !!api?.isDesktop;

  const [filePath, setFilePath] = useState<string | null>(null);
  const [name, setName] = useState<string>("untitled.txt");
  const [content, setContent] = useState<string>("");
  const [savedContent, setSavedContent] = useState<string>("");
  const [status, setStatus] = useState<string>("Ready");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const dirty = content !== savedContent;

  const open = useCallback(async () => {
    if (api) {
      const res = await api.openFile();
      if (!res) return;
      setFilePath(res.filePath);
      setName(res.name);
      setContent(res.content);
      setSavedContent(res.content);
      setStatus(`Opened ${res.name}`);
      return;
    }
    // Browser fallback
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      const text = await f.text();
      setFilePath(null);
      setName(f.name);
      setContent(text);
      setSavedContent(text);
      setStatus(`Opened ${f.name} (browser, in-memory only)`);
    };
    input.click();
  }, [api]);

  const save = useCallback(async () => {
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
    // Browser fallback — download
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    setSavedContent(content);
    setStatus(`Downloaded ${name}`);
  }, [api, filePath, content, name]);

  const saveAs = useCallback(async () => {
    if (api) {
      const res = await api.saveFileAs(content, name);
      if (!res) return;
      setFilePath(res.filePath);
      setName(res.filePath.split(/[\\/]/).pop() || name);
      setSavedContent(content);
      setStatus(`Saved as ${res.filePath}`);
      return;
    }
    save();
  }, [api, content, name, save]);

  const newFile = useCallback(() => {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    setFilePath(null);
    setName("untitled.txt");
    setContent("");
    setSavedContent("");
    setStatus("New file");
  }, [dirty]);

  // Wire native menu actions
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

  // Keyboard shortcuts in browser (Cmd/Ctrl+S, O, N)
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
    const lines = content.split("\n").length;
    const chars = content.length;
    return `${lines} ln · ${chars} ch`;
  }, [content]);

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
            <Btn onClick={save} icon={Save} label="Save" kbd="⌘S" primary />
            <Btn onClick={saveAs} icon={Download} label="Save As" kbd="⇧⌘S" />
          </div>
        </div>
      </section>

      {!isDesktop && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-start gap-3">
            <FileText className="size-4 mt-0.5" />
            <p>
              You're in the browser. The editor works in-memory and Save downloads the file.
              For real local open & save, use the{" "}
              <Link to="/download" className="underline font-medium">Node FMS desktop app</Link>.
            </p>
          </div>
        </div>
      )}

      <section className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-6 h-full">
          <textarea
            ref={taRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            placeholder="Start typing, or press ⌘O to open a file…"
            className="w-full h-[60vh] md:h-[68vh] resize-none rounded-2xl bg-card ring-1 ring-black/5 p-5 font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ink/30"
          />
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          <span>{status}</span>
          <span>{stats}{dirty ? " · unsaved" : " · saved"}</span>
        </div>
      </footer>
    </div>
  );
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
