import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Command } from "cmdk";
import {
  Search, Upload, Pencil, MessageCircle, Settings, LayoutGrid,
  Calendar, FolderOpen, CreditCard, LogOut, Sparkles, File as FileIcon,
  CheckSquare, ListChecks, Loader2,
} from "lucide-react";
import { globalSearch, type SearchResult } from "@/lib/search.functions";

type Action = {
  id: string;
  label: string;
  hint?: string;
  icon: typeof Search;
  run: () => void;
  group: string;
};

const kindIcon: Record<SearchResult["kind"], typeof Search> = {
  file: FileIcon,
  task: CheckSquare,
  event: Calendar,
  topic: MessageCircle,
  list: ListChecks,
};

export function CommandPalette({
  onUpload,
  onSignOut,
}: {
  onUpload?: () => void;
  onSignOut?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const search = useServerFn(globalSearch);
  const reqId = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  // Debounced live search across files, tasks, events, lists, and the forum.
  useEffect(() => {
    const term = query.trim();
    if (!open || term.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const id = ++reqId.current;
    const timer = setTimeout(async () => {
      try {
        const res = await search({ data: { q: term, limit: 6 } });
        if (id === reqId.current) setResults(res);
      } catch {
        if (id === reqId.current) setResults([]);
      } finally {
        if (id === reqId.current) setSearching(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query, open, search]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const close = () => setOpen(false);
  const go = (to: string) => () => { close(); navigate({ to }); };

  const actions: Action[] = [
    ...(onUpload ? [{ id: "upload", label: "Upload files", hint: "Add to current view", icon: Upload, run: () => { close(); onUpload(); }, group: "Actions" }] : []),
    { id: "files", label: "My files", icon: FolderOpen, run: go("/app"), group: "Go to" },
    { id: "editor", label: "Open editor", icon: Pencil, run: go("/editor"), group: "Go to" },
    { id: "tasks", label: "Tasks", icon: LayoutGrid, run: go("/tasks"), group: "Go to" },
    { id: "calendar", label: "Calendar", icon: Calendar, run: go("/tasks"), group: "Go to" },
    { id: "forum", label: "Forum", icon: MessageCircle, run: go("/forum"), group: "Go to" },
    { id: "integrations", label: "Integrations", icon: Sparkles, run: go("/integrations"), group: "Go to" },
    { id: "pricing", label: "Plans & pricing", icon: CreditCard, run: go("/pricing"), group: "Go to" },
    { id: "settings", label: "Settings", icon: Settings, run: go("/settings"), group: "Go to" },
    ...(onSignOut ? [{ id: "signout", label: "Sign out", icon: LogOut, run: () => { close(); onSignOut(); }, group: "Account" }] : []),
  ];

  const groups = Array.from(new Set(actions.map((a) => a.group)));

  if (!open) return null;

  const openResult = (r: SearchResult) => {
    close();
    navigate({ to: r.to });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/30 backdrop-blur-sm pt-[12vh] px-4"
      onClick={close}
    >
      <Command
        label="Command palette"
        shouldFilter={results.length === 0}
        className="w-full max-w-lg rounded-2xl bg-card ring-1 ring-black/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 border-b border-border">
          {searching ? (
            <Loader2 className="size-4 text-muted-foreground shrink-0 animate-spin" />
          ) : (
            <Search className="size-4 text-muted-foreground shrink-0" />
          )}
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search files, tasks, events, forum… or jump anywhere"
            className="flex-1 py-3.5 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <Command.List className="max-h-[55vh] overflow-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
            {searching ? "Searching…" : "No matches."}
          </Command.Empty>

          {results.length > 0 && (
            <Command.Group
              heading="Results"
              className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-1"
            >
              {results.map((r) => {
                const Icon = kindIcon[r.kind];
                return (
                  <Command.Item
                    key={`${r.kind}-${r.id}`}
                    value={`${r.title} ${r.kind} ${r.id}`}
                    onSelect={() => openResult(r)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-ink data-[selected=true]:bg-muted"
                  >
                    <Icon className="size-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{r.title}</span>
                    <span className="text-[11px] text-muted-foreground capitalize shrink-0">{r.kind}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {groups.map((group) => (
            <Command.Group
              key={group}
              heading={group}
              className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-widest text-muted-foreground [&_[cmdk-group-heading]]:px-1 [&_[cmdk-group-heading]]:pb-1"
            >
              {actions.filter((a) => a.group === group).map((a) => (
                <Command.Item
                  key={a.id}
                  value={a.label}
                  onSelect={a.run}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer text-ink data-[selected=true]:bg-muted"
                >
                  <a.icon className="size-4 text-muted-foreground" />
                  <span className="flex-1">{a.label}</span>
                  {a.hint && <span className="text-[11px] text-muted-foreground">{a.hint}</span>}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  );
}
