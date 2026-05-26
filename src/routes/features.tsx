import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FolderTree, Lock, Users, History, Zap, CheckCircle2, Share2, Cloud, Search, Bell, Workflow, Smartphone } from "lucide-react";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Node FMS" },
      { name: "description", content: "Team folders, client portals, granular permissions, version history, and audit logs — built for small businesses." },
      { property: "og:title", content: "Features — Node FMS" },
      { property: "og:description", content: "Team folders, client portals, granular permissions, version history, and audit logs — built for small businesses." },
      { property: "og:url", content: "https://nodefms.lovable.app/features" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/features" }],
  }),
  component: FeaturesPage,
});

const features = [
  { icon: FolderTree, title: "Team folders", body: "Organize by client, project, or department. Permissions inherit cleanly." },
  { icon: Users, title: "Client portals", body: "Share branded folders with clients — no Node account required on their side." },
  { icon: Lock, title: "Granular permissions", body: "View, comment, edit, or admin. Set link expirations and revoke access in one click." },
  { icon: History, title: "Version history", body: "180 days of file history on every plan. Restore folders to a previous state." },
  { icon: Zap, title: "Fast sync", body: "Web-first today. Native Mac & Windows desktop apps with selective sync arrive in 2027." },
  { icon: CheckCircle2, title: "Audit log", body: "See exactly who did what, when. Export logs for compliance reviews." },
  { icon: Share2, title: "Smart links", body: "Send any file as a link. Track views, downloads, and add passwords." },
  { icon: Cloud, title: "Anywhere access", body: "Web, desktop, and mobile. Your files follow you, securely." },
  { icon: Search, title: "Full-text search", body: "Find files by content, not just name. OCR on scans and PDFs included." },
  { icon: Bell, title: "Activity feeds", body: "Per-folder notifications so the right people hear about the right changes." },
  { icon: Workflow, title: "Integrations", body: "Connect Slack, Gmail, QuickBooks, and Zapier in two clicks." },
  { icon: Smartphone, title: "Mobile capture", body: "Scan receipts and contracts straight into the right folder on the go." },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-[40ch]">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Features</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-balance">
              A complete file workspace for your business.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-pretty">
              Every capability your team needs to organize, share, and protect work — without the enterprise tax.
            </p>
          </div>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 bg-card rounded-2xl ring-1 ring-black/5">
                <f.icon className="size-5" strokeWidth={1.5} />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
