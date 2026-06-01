import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, MonitorDown, Cloud, ShieldCheck, Github, Terminal, CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { GITHUB_URL } from "@/lib/links";

const DOWNLOAD_BASE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/downloads`;

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download Node FMS for Mac, Windows & Linux" },
      { name: "description", content: "The real, runnable Node FMS desktop app. Native windowed client for macOS (Apple Silicon & Intel), Windows x64, and Linux x64. Cloud is still an option but the desktop app is the recommended way on a real computer." },
      { property: "og:title", content: "Download Node FMS Desktop" },
      { property: "og:description", content: "Native Node FMS desktop client — runs the real program on Mac, Windows, and Linux." },
      { property: "og:url", content: "https://nodefms.lovable.app/download" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/download" }],
  }),
  component: DownloadPage,
});

type Build = {
  icon: typeof Apple;
  platform: string;
  detail: string;
  asset: string;
  size: string;
};

const builds: Build[] = [
  { icon: Apple, platform: "macOS — Apple Silicon", detail: "M1 / M2 / M3 / M4 · 12+", asset: "NodeFMS-macOS-AppleSilicon.zip", size: "≈ 290 MB" },
  { icon: Apple, platform: "macOS — Intel", detail: "x64 · 12+", asset: "NodeFMS-macOS-Intel.zip", size: "≈ 303 MB" },
  { icon: MonitorDown, platform: "Windows", detail: "x64 · 10 & 11", asset: "NodeFMS-Windows-x64.zip", size: "≈ 117 MB" },
  { icon: Terminal, platform: "Linux", detail: "x64 · glibc 2.28+", asset: "NodeFMS-Linux-x64.tar.gz", size: "≈ 108 MB" },
];

function DownloadPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />

      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <Reveal>
            <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              Node FMS // Desktop · 0.8 Major
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight text-balance">
              The app, on your computer. For real this time.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-[60ch] mx-auto text-pretty">
              The Node FMS desktop client is a real, runnable native application
              for macOS, Windows, and Linux — not a placeholder. Download a build,
              extract it, and launch. Cloud still works in any browser, but on a
              real computer the desktop app is the recommended way to run Node FMS.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-12 grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {builds.map((b) => (
                <DownloadCard key={b.asset} build={b} />
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-900 text-xs font-mono uppercase tracking-[0.18em]">
              <CheckCircle2 className="size-3.5" />
              Available now · Built from the 0.8 release
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-16 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">How to run it</h2>
            <p className="mt-3 text-muted-foreground max-w-[60ch]">
              The desktop client launches a native window that runs the full
              Node FMS program. Sign in with the same account you use on Cloud.
            </p>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <Step n="1" title="macOS">
              Download the <span className="font-mono text-xs">.zip</span> for your chip
              (Apple Silicon or Intel), double-click to unzip, then drag
              <span className="font-mono text-xs"> Node FMS.app</span> into
              <span className="font-mono text-xs"> /Applications</span>. First
              launch: right-click → Open to bypass Gatekeeper on unsigned builds.
            </Step>
            <Step n="2" title="Windows">
              Download the <span className="font-mono text-xs">.zip</span>, right-click
              → Extract All, then run <span className="font-mono text-xs">Node FMS.exe</span>.
              SmartScreen may warn on the unsigned build — click
              <span className="font-mono text-xs"> More info → Run anyway</span>.
            </Step>
            <Step n="3" title="Linux">
              Extract: <span className="font-mono text-xs">tar -xzf NodeFMS-Linux-x64.tar.gz</span>,
              then run <span className="font-mono text-xs">./'Node FMS-linux-x64'/'Node FMS'</span>.
              Requires glibc 2.28+ (Ubuntu 20.04+, Fedora 32+, Debian 11+).
            </Step>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              What the desktop app actually does
            </h2>
          </Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Real native window", body: "A real OS window with native menu bar, keyboard shortcuts, and full-screen support. Cmd/Ctrl+R reloads, Cmd/Ctrl+H jumps home." },
              { icon: Cloud, title: "Same account, same data", body: "The desktop client signs in to the same Node FMS workspace as Cloud. Files, members, and invites stay in sync." },
              { icon: MonitorDown, title: "RTAO-ready", body: "Future Release-To-Application-Only updates ship through the desktop client first, before the web build catches up." },
            ].map((f) => (
              <div key={f.title} className="p-6 bg-card rounded-2xl ring-1 ring-black/5 h-full">
                <f.icon className="size-5" strokeWidth={1.5} />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border/60">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Prefer to stay in the browser?</h2>
            <p className="mt-4 text-muted-foreground">
              Cloud works in any modern browser. It's not the recommended
              experience on a Mac or Windows machine now that the desktop app is
              shipping, but every feature remains fully available.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/signup" className="bg-ink text-surface px-5 py-2.5 rounded-full text-sm font-medium hover:bg-ink/90 transition-colors">
                Use Cloud in the browser
              </Link>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-ink/10 text-sm font-medium hover:bg-ink/5 transition-colors">
                <Github className="size-4" /> Source on GitHub
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function DownloadCard({ build }: { build: Build }) {
  const href = `${DOWNLOAD_BASE}/${build.asset}`;
  const Icon = build.icon;
  return (
    <div className="group relative p-7 rounded-2xl bg-card ring-1 ring-black/5 text-left overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-ink/[0.04] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex items-start justify-between">
        <Icon className="size-8" strokeWidth={1.5} />
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] px-2 py-1 rounded-full bg-emerald-100 text-emerald-900">
          Available
        </span>
      </div>
      <div className="mt-5">
        <div className="text-lg font-semibold tracking-tight">{build.platform}</div>
        <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1">
          {build.detail} · {build.size}
        </div>
      </div>
      <a
        href={href}
        className="mt-6 w-full block text-center py-2.5 rounded-full bg-ink text-surface text-sm font-medium hover:bg-ink/90 transition-colors"
      >
        Download
      </a>
      <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground text-center">
        Hosted on GitHub Releases
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 bg-card rounded-2xl ring-1 ring-black/5 h-full">
      <div className="flex items-center gap-3">
        <span className="size-7 rounded-full bg-ink text-surface text-xs font-mono grid place-items-center">{n}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
