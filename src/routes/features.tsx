import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  FolderTree, Lock, Users, History, Zap, CheckCircle2, Share2, Cloud, Search, Bell, Workflow, Smartphone,
  ListChecks, KanbanSquare, CalendarDays, Flag, AtSign, Repeat,
  CalendarRange, Link2, Bell as BellIcon, Clock,
  HardDrive, ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Node" },
      { name: "description", content: "Everything inside Node: NodeFMS for files, Node Tasks for work, Node Calendar for time. Built by an 11-year-old for small businesses." },
      { property: "og:title", content: "Features — Node" },
      { property: "og:description", content: "NodeFMS, Node Tasks, and Node Calendar — one toolkit, three apps." },
      { property: "og:url", content: "https://nodefms.lovable.app/features" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/features" }],
  }),
  component: FeaturesPage,
});

const fmsFeatures = [
  { icon: FolderTree, title: "Team folders", body: "Organize by client, project, or department. Permissions inherit cleanly." },
  { icon: Users, title: "Client portals", body: "Share branded folders with clients — no Node account required on their side." },
  { icon: Lock, title: "Granular permissions", body: "View, comment, edit, or admin. Set link expirations and revoke access in one click." },
  { icon: History, title: "Version history", body: "180 days of file history on every plan. Restore folders to a previous state." },
  { icon: Zap, title: "Fast sync", body: "Web-first today. Native Mac & Windows apps with selective sync arrive in 2027." },
  { icon: CheckCircle2, title: "Audit log", body: "See exactly who did what, when. Export logs for compliance reviews." },
  { icon: Share2, title: "Smart links", body: "Send any file as a link. Track views, downloads, and add passwords." },
  { icon: Cloud, title: "Anywhere access", body: "Web, desktop, and mobile. Your files follow you, securely." },
  { icon: Search, title: "Full-text search", body: "Find files by content, not just name. OCR on scans and PDFs included." },
  { icon: Bell, title: "Activity feeds", body: "Per-folder notifications so the right people hear about the right changes." },
  { icon: Workflow, title: "Integrations", body: "Connect Slack, Gmail, QuickBooks, and Zapier in two clicks." },
  { icon: Smartphone, title: "Mobile capture", body: "Scan receipts and contracts straight into the right folder on the go." },
];

const taskFeatures = [
  { icon: ListChecks, title: "Lists, tasks, statuses", body: "Group work into lists. Move tasks through statuses you actually use." },
  { icon: KanbanSquare, title: "List, Board, Calendar views", body: "Pick the view that matches the job. Switch on the same data without setup." },
  { icon: Flag, title: "Priorities & due dates", body: "Urgent, high, normal, low. Due dates pop straight onto Node Calendar." },
  { icon: AtSign, title: "Assignees", body: "Hand a task to a teammate. Everyone sees what's on their plate." },
  { icon: Repeat, title: "Coming soon: subtasks", body: "Break big tasks into small ones. Roll progress up automatically." },
  { icon: Bell, title: "Coming soon: comments & mentions", body: "Talk about the work where the work lives. No more buried Slack threads." },
];

const calFeatures = [
  { icon: CalendarRange, title: "One unified calendar", body: "Tasks, meetings, and deadlines from all of Node in one place." },
  { icon: Link2, title: "Google & Outlook sync", body: "Connect once. Two-way sync keeps everything honest." },
  { icon: BellIcon, title: "Smart reminders", body: "Get nudged before things matter, not after." },
  { icon: Clock, title: "Time blocks", body: "Drag a task onto the calendar and protect time to actually do it." },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-[44ch]">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">What's in Node</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-balance">
              Three small apps. One workspace that actually works.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-pretty">
              I built each piece because I kept seeing small businesses bounce between five different tools that didn't talk to each other.
              Here's what's inside.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {[
              { tag: "NodeFMS", icon: HardDrive, anchor: "#fms" },
              { tag: "Node Tasks", icon: ListChecks, anchor: "#tasks" },
              { tag: "Node Calendar", icon: CalendarDays, anchor: "#calendar" },
            ].map((d) => (
              <a key={d.tag} href={d.anchor} className="flex items-center justify-between p-4 bg-card rounded-xl ring-1 ring-black/5 hover:ring-ink/20 transition-all">
                <span className="flex items-center gap-3">
                  <d.icon className="size-4" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{d.tag}</span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </a>
            ))}
          </div>

          <Division id="fms" tag="NodeFMS" title="The file side of Node" body="Secure cloud storage with team folders, client portals, and 180 days of version history on every plan." items={fmsFeatures} />
          <Division id="tasks" tag="Node Tasks" title="The work side of Node" body="A ClickUp-style task manager that's small enough to actually use. List, Board, and Calendar views on day one." items={taskFeatures} cta={{ label: "Open Node Tasks", to: "/tasks" }} />
          <Division id="calendar" tag="Node Calendar" title="The time side of Node" body="The connective tissue. Pulls deadlines from Node Tasks and meetings from your existing calendar." items={calFeatures} cta={{ label: "Connect your calendar", to: "/integrations" }} />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function Division({
  id, tag, title, body, items, cta,
}: {
  id: string;
  tag: string;
  title: string;
  body: string;
  items: { icon: typeof FolderTree; title: string; body: string }[];
  cta?: { label: string; to: string };
}) {
  return (
    <div id={id} className="mt-20 pt-12 border-t border-border/60 scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 max-w-[60ch]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{tag}</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-3 text-muted-foreground">{body}</p>
        </div>
        {cta && (
          <Link to={cta.to} className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:gap-3 transition-all whitespace-nowrap">
            {cta.label} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((f) => (
          <div key={f.title} className="p-6 bg-card rounded-2xl ring-1 ring-black/5">
            <f.icon className="size-5" strokeWidth={1.5} />
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
