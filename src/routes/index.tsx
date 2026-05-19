import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  FolderTree,
  Lock,
  Users,
  History,
  Zap,
  CheckCircle2,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Film,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Node FMS — File Management Suite for small businesses" },
      { name: "description", content: "Node File Management Suite — a division of Node. Secure file storage, syncing, and editing built for small businesses." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <SiteHeader />

      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ink/10 text-xs font-medium text-muted-foreground mb-6">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Node File Management Suite — a division of Node
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight text-balance max-w-[22ch] mx-auto">
            The single source of truth for your business's files.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground text-pretty max-w-[56ch] mx-auto">
            Node FMS is secure cloud storage purpose-built for small businesses.
            Keep client deliverables, contracts, and brand libraries in one
            protected, organized space.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/app"
              className="group bg-ink text-surface px-5 py-2.5 rounded-full text-sm font-medium ring-1 ring-ink flex items-center gap-2 hover:bg-ink/90 transition-colors"
            >
              Start free 14-day trial
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#features" className="px-5 py-2.5 text-sm font-medium text-ink/60 hover:text-ink transition-colors">
              See how it works
            </a>
          </div>
        </div>
      </section>

      <section className="pb-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-card rounded-2xl ring-1 ring-black/5 overflow-hidden shadow-elegant">
            <div className="border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-zinc-200" />
                  <div className="size-2.5 rounded-full bg-zinc-200" />
                  <div className="size-2.5 rounded-full bg-zinc-200" />
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Workspace / Clients / Northstar Co.
                </div>
              </div>
              <div className="text-xs text-muted-foreground">2.4 TB of 10 TB used</div>
            </div>
            <div className="grid grid-cols-12 h-[460px]">
              <aside className="col-span-3 border-r border-border p-5 space-y-1 bg-muted/40">
                {["All files", "Shared with team", "Client portals", "Trash"].map((label, i) => (
                  <div
                    key={label}
                    className={`px-3 py-2 rounded-md text-xs font-medium ${
                      i === 0 ? "bg-ink text-surface" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </div>
                ))}
                <div className="mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Teams
                </div>
                {[
                  ["Design", "bg-emerald-500"],
                  ["Operations", "bg-amber-500"],
                  ["Finance", "bg-blue-500"],
                ].map(([name, dot]) => (
                  <div key={name} className="px-3 py-1.5 flex items-center gap-2 text-xs">
                    <div className={`size-2 rounded-full ${dot}`} />
                    <span className="text-ink/80">{name}</span>
                  </div>
                ))}
              </aside>
              <main className="col-span-9 p-6">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Recent activity
                </div>
                <div className="divide-y divide-border">
                  {[
                    { icon: FileText, color: "bg-red-50 text-red-700", name: "Master_Services_Agreement_v4.pdf", meta: "Marcus updated • 2h ago", tag: "PDF" },
                    { icon: ImageIcon, color: "bg-blue-50 text-blue-700", name: "Brand_Guidelines_2026.fig", meta: "Sarah shared • Yesterday", tag: "FIG" },
                    { icon: Film, color: "bg-amber-50 text-amber-700", name: "Onboarding_Walkthrough.mp4", meta: "Elena uploaded • Oct 12", tag: "MP4" },
                    { icon: FileText, color: "bg-emerald-50 text-emerald-700", name: "Q4_Forecast.xlsx", meta: "David edited • Oct 11", tag: "XLS" },
                    { icon: FileText, color: "bg-zinc-100 text-zinc-700", name: "Northstar_Proposal_Final.docx", meta: "Approved • Oct 10", tag: "DOC" },
                  ].map((f) => (
                    <div key={f.name} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className={`size-9 rounded-md grid place-items-center text-[10px] font-semibold ${f.color}`}>
                          {f.tag}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{f.name}</div>
                          <div className="text-xs text-muted-foreground">{f.meta}</div>
                        </div>
                      </div>
                      <div className="flex -space-x-1.5">
                        <div className="size-6 rounded-full bg-zinc-200 ring-2 ring-card" />
                        <div className="size-6 rounded-full bg-zinc-300 ring-2 ring-card" />
                        <div className="size-6 rounded-full bg-zinc-400 ring-2 ring-card" />
                      </div>
                    </div>
                  ))}
                </div>
              </main>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-[40ch]">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Built for SMBs</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight text-balance">
              Everything your team needs. Nothing it doesn't.
            </h2>
          </div>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FolderTree, title: "Team folders", body: "Organize by client, project, or department. Permissions inherit cleanly so onboarding takes seconds." },
              { icon: Users, title: "Client portals", body: "Share a branded folder with clients — they upload and download without needing a Node account." },
              { icon: Lock, title: "Granular permissions", body: "View, comment, edit, or admin. Set expirations on links and revoke access in one click." },
              { icon: History, title: "Version history", body: "180 days of file history on every plan. Restore any file or folder to a previous state." },
              { icon: Zap, title: "Fast sync", body: "Native desktop apps for Mac and Windows. Selective sync keeps laptops light." },
              { icon: CheckCircle2, title: "Audit log", body: "See exactly who did what, when. Export logs for compliance reviews." },
            ].map((f) => (
              <div key={f.title} className="p-6 bg-card rounded-2xl ring-1 ring-black/5">
                <f.icon className="size-5 text-ink" strokeWidth={1.5} />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="max-w-[35ch]">
              <h2 className="text-3xl font-semibold leading-tight text-balance">
                Predictable pricing for growing teams.
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                Flat per-team pricing. No surprise per-seat charges as you hire.
              </p>
              <Link to="/pricing" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink hover:gap-3 transition-all">
                Compare all plans <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
              <PricingCard tier="Essential" price="$29" desc="Up to 2 TB and 5 users. Perfect for boutique studios." cta="Start trial" />
              <PricingCard tier="Professional" price="$79" desc="10 TB, unlimited users, client portals, and SSO." cta="Upgrade now" featured />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function PricingCard({
  tier, price, desc, cta, featured = false,
}: { tier: string; price: string; desc: string; cta: string; featured?: boolean }) {
  return (
    <div className={`p-8 rounded-2xl flex flex-col ${featured ? "bg-ink text-surface ring-1 ring-ink" : "bg-card ring-1 ring-black/5"}`}>
      <span className={`text-xs font-semibold uppercase tracking-wider ${featured ? "opacity-60" : "text-muted-foreground"}`}>{tier}</span>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-semibold">{price}</span>
        <span className={`text-sm ${featured ? "opacity-60" : "text-muted-foreground"}`}>/mo</span>
      </div>
      <p className={`mt-4 text-sm ${featured ? "opacity-80" : "text-muted-foreground"}`}>{desc}</p>
      <Link
        to="/app"
        className={`mt-8 w-full py-2.5 px-4 rounded-full text-sm font-medium text-center transition-colors ${
          featured ? "bg-surface text-ink hover:bg-zinc-100" : "border border-ink/10 hover:bg-ink hover:text-surface"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
