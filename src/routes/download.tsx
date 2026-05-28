import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, MonitorDown, Cloud, Clock, ShieldCheck, Github } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { GITHUB_URL } from "@/lib/links";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download Node FMS for Mac & Windows" },
      { name: "description", content: "Native Node FMS desktop apps for macOS and Windows. Background sync, offline access, and auto-updates direct from Node. Cloud is still recommended if you're not on a desktop." },
      { property: "og:title", content: "Download Node FMS for Mac & Windows" },
      { property: "og:description", content: "Native Node FMS desktop apps for macOS and Windows with auto-updates from Node." },
      { property: "og:url", content: "https://nodefms.lovable.app/download" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/download" }],
  }),
  component: DownloadPage,
});

function DownloadPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />

      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Reveal>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              Node FMS // Desktop
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight text-balance">
              Node on your desktop.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-[58ch] mx-auto text-pretty">
              The native desktop apps deliver background sync, offline access,
              and instant updates pushed straight from Node. If you're on a Mac
              or Windows PC, the desktop app is the recommended way to use Node FMS.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-12 grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
              <DownloadCard
                icon={Apple}
                platform="macOS"
                detail="Universal · 12+"
                badge="Coming 2027"
              />
              <DownloadCard
                icon={MonitorDown}
                platform="Windows"
                detail="x64 & ARM · 10+"
                badge="Coming 2027"
              />
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <Clock className="size-3.5" />
              Native builds ship in 2027 · Use Cloud in the meantime
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">What the desktop app does that Cloud can't.</h2>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Native background sync", body: "Files sync in the background even when the app is closed. Conflict resolution happens locally." },
              { icon: Cloud, title: "Offline access", body: "Pin folders to your machine for full read/write access offline. Re-syncs the moment you reconnect." },
              { icon: MonitorDown, title: "Auto-updates from Node", body: "Critical and RTAO releases are pushed directly to your install. You'll always be on a supported version." },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="p-6 bg-card rounded-2xl ring-1 ring-black/5 h-full">
                  <f.icon className="size-5" strokeWidth={1.5} />
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border/60">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Stuck on web for now?</h2>
            <p className="mt-4 text-muted-foreground">
              Lovable Cloud works in any modern browser. It's not the recommended
              experience on Mac or Windows once the native app ships, but every
              feature is fully available right now.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" className="bg-ink text-surface px-5 py-2.5 rounded-full text-sm font-medium hover:bg-ink/90 transition-colors">
                Start free in the browser
              </Link>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-ink/10 text-sm font-medium hover:bg-ink/5 transition-colors">
                <Github className="size-4" /> Watch on GitHub
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function DownloadCard({
  icon: Icon, platform, detail, badge,
}: {
  icon: typeof Apple;
  platform: string;
  detail: string;
  badge: string;
}) {
  return (
    <div className="group relative p-8 rounded-2xl bg-card ring-1 ring-black/5 text-left overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-ink/[0.04] opacity-0 group-hover:opacity-100 transition-opacity" />
      <Icon className="size-8" strokeWidth={1.5} />
      <div className="mt-5 flex items-baseline justify-between">
        <div>
          <div className="text-lg font-semibold tracking-tight">{platform}</div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1">{detail}</div>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-full bg-amber-100 text-amber-900">
          {badge}
        </span>
      </div>
      <button
        disabled
        className="mt-6 w-full py-2.5 rounded-full bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
      >
        Notify me when ready
      </button>
    </div>
  );
}
