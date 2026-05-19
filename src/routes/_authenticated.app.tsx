import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  Folder, FileText, Image as ImageIcon, Film, Search, Upload, Plus,
  Star, Clock, Users, Trash2, Settings, ChevronRight, MoreHorizontal, Download, Share2, LogOut,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Workspace — Node" }] }),
  component: AppPage,
});

type Row =
  | { type: "folder"; name: string; meta: string; size: string }
  | { type: "pdf" | "doc" | "xls" | "fig" | "mp4" | "img"; name: string; meta: string; size: string };

const folders: Row[] = [
  { type: "folder", name: "Clients", meta: "12 subfolders • shared with team", size: "486 GB" },
  { type: "folder", name: "Operations", meta: "Internal • 5 members", size: "112 GB" },
  { type: "folder", name: "Finance & Legal", meta: "Restricted • 3 members", size: "38 GB" },
  { type: "folder", name: "Brand & Marketing", meta: "Shared with team", size: "208 GB" },
];

const files: Row[] = [
  { type: "pdf", name: "Master_Services_Agreement_v4.pdf", meta: "Marcus updated • 2h ago", size: "2.4 MB" },
  { type: "fig", name: "Brand_Guidelines_2026.fig", meta: "Sarah shared • Yesterday", size: "42.1 MB" },
  { type: "mp4", name: "Onboarding_Walkthrough.mp4", meta: "Elena uploaded • Oct 12", size: "318 MB" },
  { type: "xls", name: "Q4_Forecast.xlsx", meta: "David edited • Oct 11", size: "1.1 MB" },
  { type: "doc", name: "Northstar_Proposal_Final.docx", meta: "Approved • Oct 10", size: "612 KB" },
  { type: "img", name: "Product_Photography_Batch_03", meta: "Camille added • Oct 9", size: "1.2 GB" },
];

const iconFor: Record<string, { Icon: typeof FileText; cls: string; label: string }> = {
  pdf: { Icon: FileText, cls: "bg-red-50 text-red-700", label: "PDF" },
  doc: { Icon: FileText, cls: "bg-blue-50 text-blue-700", label: "DOC" },
  xls: { Icon: FileText, cls: "bg-emerald-50 text-emerald-700", label: "XLS" },
  fig: { Icon: ImageIcon, cls: "bg-violet-50 text-violet-700", label: "FIG" },
  mp4: { Icon: Film, cls: "bg-amber-50 text-amber-700", label: "MP4" },
  img: { Icon: ImageIcon, cls: "bg-zinc-100 text-zinc-700", label: "IMG" },
};

function AppPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const all = [...folders, ...files].filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  const fl = all.filter((r) => r.type === "folder");
  const fi = all.filter((r) => r.type !== "folder");

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else {
      toast.success("Signed out");
      navigate({ to: "/" });
    }
  };

  return (
    <div className="min-h-screen bg-surface text-ink flex">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <Link to="/" className="px-6 py-5 flex items-center gap-2 border-b border-border">
          <div className="size-5 bg-ink rounded-sm" />
          <span className="text-sm font-semibold tracking-tight">Node</span>
        </Link>
        <nav className="p-3 space-y-0.5 text-sm">
          {[
            { icon: Folder, label: "All files", active: true },
            { icon: Star, label: "Starred" },
            { icon: Clock, label: "Recent" },
            { icon: Users, label: "Shared" },
            { icon: Trash2, label: "Trash" },
          ].map((n) => (
            <div
              key={n.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-default ${
                n.active ? "bg-ink text-surface" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <n.icon className="size-4" strokeWidth={1.75} />
              {n.label}
            </div>
          ))}
        </nav>
        <div className="px-3 mt-4">
          <div className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Teams</div>
          {[
            ["Design Lab", "bg-emerald-500"],
            ["Operations", "bg-amber-500"],
            ["Marketing HQ", "bg-blue-500"],
            ["Finance", "bg-violet-500"],
          ].map(([name, dot]) => (
            <div key={name} className="px-3 py-1.5 flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`size-2 rounded-full ${dot}`} />
              {name}
            </div>
          ))}
        </div>
        <div className="mt-auto p-4 m-3 rounded-xl bg-muted">
          <div className="text-xs text-muted-foreground">Storage</div>
          <div className="mt-2 h-1.5 w-full bg-card rounded-full overflow-hidden">
            <div className="h-full w-[24%] bg-ink" />
          </div>
          <div className="mt-2 text-xs"><span className="font-semibold">2.4 TB</span> of 10 TB used</div>
          <Link to="/pricing" className="mt-3 inline-block text-xs font-medium text-ink underline-offset-2 hover:underline">
            Upgrade plan
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center justify-between px-8 gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/app" className="hover:text-ink">Workspace</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-ink font-medium">All files</span>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files, folders, and clients…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md bg-muted border border-transparent focus:border-ink/20 focus:bg-card outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 border border-ink/10 rounded-md hover:bg-muted">
              <Plus className="size-4" /> New folder
            </button>
            <button className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 bg-ink text-surface rounded-md hover:bg-ink/90">
              <Upload className="size-4" /> Upload
            </button>
            <button className="size-9 grid place-items-center rounded-md hover:bg-muted" title="Settings">
              <Settings className="size-4" />
            </button>
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

        <div className="flex-1 overflow-auto px-8 py-6">
          {fl.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Folders</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {fl.map((f) => (
                  <div key={f.name} className="p-5 bg-card rounded-xl ring-1 ring-black/5 hover:ring-ink/20 transition cursor-default">
                    <div className="flex items-start justify-between">
                      <Folder className="size-7 text-ink" strokeWidth={1.5} />
                      <button className="text-muted-foreground hover:text-ink"><MoreHorizontal className="size-4" /></button>
                    </div>
                    <div className="mt-4 text-sm font-semibold">{f.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{f.meta}</div>
                    <div className="mt-3 text-[11px] text-muted-foreground">{f.size}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {fi.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Files</h2>
              <div className="bg-card rounded-xl ring-1 ring-black/5 overflow-hidden">
                <div className="grid grid-cols-12 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-border bg-muted/40">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-3">Modified</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                {fi.map((f) => {
                  const meta = iconFor[f.type];
                  const Icon = meta.Icon;
                  return (
                    <div key={f.name} className="grid grid-cols-12 items-center px-5 py-3 border-b border-border last:border-b-0 hover:bg-muted/40">
                      <div className="col-span-6 flex items-center gap-3 min-w-0">
                        <div className={`size-9 rounded-md grid place-items-center text-[10px] font-semibold ${meta.cls}`}>
                          {meta.label}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate flex items-center gap-2">
                            {f.name}
                            <Icon className="size-3.5 text-muted-foreground shrink-0 md:hidden" />
                          </div>
                          <div className="text-xs text-muted-foreground truncate">{f.meta}</div>
                        </div>
                      </div>
                      <div className="col-span-3 text-sm text-muted-foreground">{f.meta.split("•")[1]?.trim() ?? "—"}</div>
                      <div className="col-span-2 text-sm text-muted-foreground">{f.size}</div>
                      <div className="col-span-1 flex justify-end gap-1">
                        <button className="size-8 grid place-items-center rounded-md hover:bg-card text-muted-foreground hover:text-ink"><Share2 className="size-4" /></button>
                        <button className="size-8 grid place-items-center rounded-md hover:bg-card text-muted-foreground hover:text-ink"><Download className="size-4" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {all.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-24">
              No files match "{query}".
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
