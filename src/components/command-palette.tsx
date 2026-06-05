import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import {
  Search, Upload, Pencil, MessageCircle, Settings, LayoutGrid,
  Calendar, FolderOpen, CreditCard, LogOut, Sparkles,
} from "lucide-react";

type Action = {
  id: string;
  label: string;
  hint?: string;
  icon: typeof Search;
  run: () => void;
  group: string;
};

export function CommandPalette({
  onUpload,
  onSignOut,
}: {
  onUpload?: () => void;
  onSignOut?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-ink/30 backdrop-blur-sm pt-[12vh] px-4"
      onClick={close}
    >
      <Command
        label="Command palette"
        className="w-full max-w-lg rounded-2xl bg-card ring-1 ring-black/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 border-b border-border">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <Command.Input
            autoFocus
            placeholder="Search actions, jump anywhere…"
            className="flex-1 py-3.5 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <Command.List className="max-h-[50vh] overflow-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
            No matches.
          </Command.Empty>
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
