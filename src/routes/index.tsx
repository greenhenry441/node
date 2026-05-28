import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WebGLBackground } from "@/components/webgl-background";
import { Reveal } from "@/components/reveal";
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
  ListChecks,
  CalendarDays,
  HardDrive,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Node — Tools small businesses actually want to use" },
      { name: "description", content: "Node is a small toolkit built by an 11-year-old in Milford, MI. Three pieces that work together: NodeFMS for files, Node Tasks for work, Node Calendar for time." },
      { property: "og:title", content: "Node — Tools small businesses actually want to use" },
      { property: "og:description", content: "NodeFMS, Node Tasks, and Node Calendar — three pieces of one simple workspace." },
      { property: "og:url", content: "https://nodefms.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/" }],
  }),
  component: Index,
});


function Index() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      {/* Dark, WebGL-backed hero */}
      <section className="relative overflow-hidden bg-[#06070d] text-white">
        <WebGLBackground />
        {/* Contrast scrim: keeps WebGL visible while guaranteeing legible text */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06070d]/70 via-[#06070d]/40 to-[#06070d]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,7,13,0.55)_70%)] pointer-events-none" />
        <div className="relative z-10">
          <SiteHeader theme="dark" />

          <div className="py-20 md:py-32">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur text-[11px] font-mono uppercase tracking-[0.18em] text-white/70 mb-6">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  NODE // built by an 11-year-old in Milford, MI
                </div>
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight text-balance max-w-[24ch] mx-auto">
                  One little toolkit for the way your business actually works.
                </h1>
                <p className="mt-8 text-lg md:text-xl text-white/70 text-pretty max-w-[58ch] mx-auto">
                  Node is three small apps that play nicely together: <span className="text-white">NodeFMS</span> for files,
                  {" "}<span className="text-white">Node Tasks</span> for the work, and
                  {" "}<span className="text-white">Node Calendar</span> for the time. I'm Henry — I built it for my
                  Gifted &amp; Talented project, and for small businesses who shouldn't need ten tabs open to get through the day.
                </p>
              </Reveal>
              <Reveal delay={150}>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/app"
                    className="group bg-white text-[#06070d] px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-white/90 transition-colors"
                  >
                    Try Node — it's free
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <a href="#divisions" className="px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors">
                    Meet the three apps
                  </a>
                </div>
              </Reveal>

            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
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
                <div className="text-xs text-muted-foreground">2.4 TB of 5 TB used</div>
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
          </Reveal>
        </div>
      </section>

      <section id="features" className="py-24 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="max-w-[40ch]">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Built for SMBs</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight text-balance">
                Everything your team needs. Nothing it doesn't.
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FolderTree, title: "Team folders", body: "Organize by client, project, or department. Permissions inherit cleanly so onboarding takes seconds." },
              { icon: Users, title: "Client portals", body: "Share a branded folder with clients — they upload and download without needing a Node account." },
              { icon: Lock, title: "Granular permissions", body: "View, comment, edit, or admin. Set expirations on links and revoke access in one click." },
              { icon: History, title: "Version history", body: "180 days of file history on every plan. Restore any file or folder to a previous state." },
              { icon: Zap, title: "Fast sync", body: "Web-first today, with native Mac and Windows desktop apps coming in 2027." },
              { icon: CheckCircle2, title: "Audit log", body: "See exactly who did what, when. Export logs for compliance reviews." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 70}>
                <div className="p-6 bg-card rounded-2xl ring-1 ring-black/5 h-full">
                  <f.icon className="size-5 text-ink" strokeWidth={1.5} />
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-muted/50 border-t border-border/60">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal>
            <div className="max-w-[44ch] mx-auto text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Node FMS Price List</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight text-balance">
                Pricing that scales with your business.
              </h2>
              <p className="mt-4 text-muted-foreground text-pretty">
                Upgrade or cancel anytime. Every plan includes file syncing and editing.
              </p>
            </div>
          </Reveal>
          <div className="mt-8 max-w-[60ch] mx-auto">
            <p className="text-sm font-medium text-ink/80 bg-amber-100 border border-amber-200 rounded-full px-5 py-2 text-center">
              Launch week: paid plans paused. Free gets unlimited storage.
            </p>
          </div>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Reveal delay={0}>
              <PricingCard
                tier="Free"
                price="$0"
                cadence="forever"
                useCase="Everyone — unlimited storage during launch week"
                features={["Unlimited storage (launch promo)", "File syncing", "File editing"]}
                cta="Get started"
              />
            </Reveal>
            <Reveal delay={80}>
              <PricingCard
                tier="Starter"
                price="$25.99"
                cadence="/month"
                useCase="Very small businesses"
                features={["1 TB storage", "File syncing", "File editing", "More file types supported"]}
                cta="Coming soon"
                disabled
              />
            </Reveal>
            <Reveal delay={160}>
              <PricingCard
                tier="Steady"
                price="$50.99"
                cadence="/month"
                useCase="Small businesses"
                features={["5 TB storage", "Advanced file syncing & editing", "More file types supported"]}
                cta="Coming soon"
                featured
                disabled
              />
            </Reveal>
            <Reveal delay={240}>
              <PricingCard
                tier="Node Suite"
                price="$75.99"
                cadence="/month"
                useCase="Small and medium businesses"
                features={["Unlimited storage", "All Node File Management", "Node Task Management", "Later: Node Intelligence features"]}
                cta="Coming soon"
                disabled
              />
            </Reveal>
          </div>
          <div className="mt-10 text-center">
            <Link to="/pricing" className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:gap-3 transition-all">
              Compare all plans <ArrowRight className="size-4" />
            </Link>
            <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">Paid plans return after launch week</p>
          </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function PricingCard({
  tier, price, cadence, useCase, features, cta, featured = false, disabled = false,
}: {
  tier: string;
  price: string;
  cadence: string;
  useCase: string;
  features: string[];
  cta: string;
  featured?: boolean;
  disabled?: boolean;
}) {
  const useFeatured = featured && !disabled;
  return (
    <div className={`p-8 rounded-2xl flex flex-col h-full relative ${
      disabled ? "bg-card/60 ring-1 ring-black/5 opacity-70" :
      useFeatured ? "bg-ink text-surface ring-1 ring-ink" : "bg-card ring-1 ring-black/5"
    }`}>
      {disabled && (
        <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700">
          Coming soon
        </span>
      )}
      <span className={`text-xs font-semibold uppercase tracking-wider ${useFeatured ? "opacity-60" : "text-muted-foreground"}`}>{tier}</span>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-semibold">{price}</span>
        <span className={`text-sm ${useFeatured ? "opacity-60" : "text-muted-foreground"}`}>{cadence}</span>
      </div>
      <p className={`mt-4 text-xs uppercase tracking-wider ${useFeatured ? "opacity-70" : "text-muted-foreground"}`}>Use case</p>
      <p className={`mt-1 text-sm ${useFeatured ? "opacity-90" : "text-ink/80"}`}>{useCase}</p>
      <ul className={`mt-5 space-y-2 text-sm flex-1 ${useFeatured ? "opacity-90" : "text-ink/80"}`}>
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2 className={`size-4 mt-0.5 shrink-0 ${useFeatured ? "opacity-80" : "text-ink/60"}`} strokeWidth={1.5} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {disabled ? (
        <button disabled className="mt-8 w-full py-2.5 px-4 rounded-full text-sm font-medium text-center bg-zinc-200 text-zinc-500 cursor-not-allowed">
          {cta}
        </button>
      ) : (
        <Link
          to="/signup"
          className={`mt-8 w-full py-2.5 px-4 rounded-full text-sm font-medium text-center transition-colors ${
            useFeatured ? "bg-surface text-ink hover:bg-zinc-100" : "border border-ink/10 hover:bg-ink hover:text-surface"
          }`}
        >
          {cta}
        </Link>
      )}
    </div>
  );
}

