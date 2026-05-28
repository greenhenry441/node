import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Reveal } from "@/components/reveal";
import { GITHUB_URL } from "@/lib/links";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — Node FMS" },
      { name: "description", content: "Every Node FMS release, tracked with semantic versioning. New features, fixes, and what's coming next." },
      { property: "og:title", content: "Changelog — Node FMS" },
      { property: "og:description", content: "Every Node FMS release, tracked with semantic versioning." },
      { property: "og:url", content: "https://nodefms.lovable.app/changelog" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/changelog" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Node FMS Changelog",
          description: "Semantic-versioned release history for Node FMS.",
          url: "https://nodefms.lovable.app/changelog",
          isPartOf: { "@type": "WebSite", name: "Node FMS", url: "https://nodefms.lovable.app" },
        }),
      },
    ],
  }),
  component: ChangelogPage,
});

type ReleaseTag =
  | "Revamp"
  | "Major"
  | "Minor"
  | "Patch"
  | "Emergency Update"
  | "Pre-Release"
  | "Pre-Alpha"
  | "Alpha"
  | "Open-Beta"
  | "Closed-Beta"
  | "Release Candidate"
  | "Stable"
  | "LTS"
  | "LTS Patch"
  | "EOL"
  | "RTAO";

type Release = {
  version: string;
  date: string;
  tags: ReleaseTag[];
  title?: string;
  highlights: string[];
};

// Append a new entry at the top each time we publish.
// Follow semver: MAJOR.MINOR.PATCH. Tag with one or more of the
// release labels declared in `ReleaseTag` above.
const releases: Release[] = [
  {
    version: "1.0.1",
    date: "May 28, 2026",
    tags: ["LTS Patch"],
    title: "Launch week hotfix",
    highlights: [
      "Paid plans temporarily disabled in-app — free tier is unlimited during launch week",
      "Announcement banner swapped to highlight the new desktop downloads",
      "Final typecheck, security scan, and SEO pass before GA",
    ],
  },
  {
    version: "1.0.0",
    date: "May 28, 2026",
    tags: ["Major", "Stable", "LTS"],
    title: "Node FMS 1.0 — Generally Available, LTS",
    highlights: [
      "Node FMS is officially launched — no more waiting for the 1st",
      "First Long-Term Support release: extended maintenance and security patches",
      "Stable API surface — safe to build on in production",
      "All Alpha and Beta feature flags graduated to GA",
      "Hardened workspace permissions, quotas, and storage pipeline",
    ],
  },
  {
    version: "0.9.0",
    date: "May 28, 2026",
    tags: ["Minor", "Stable"],
    title: "Pre-1.0 stabilization",
    highlights: [
      "Final polish pass across marketing, app, and settings",
      "Performance improvements to file list rendering and uploads",
      "Tightened RLS policies and workspace role checks",
      "Bug sweep across invites, billing, and onboarding flows",
    ],
  },
  {
    version: "0.8.0",
    date: "May 28, 2026",
    tags: ["Major", "Stable", "RTAO"],
    title: "Real desktop apps — Mac, Windows, and Linux",
    highlights: [
      "Shipped real, runnable native desktop clients for macOS (Apple Silicon and Intel), Windows x64, and Linux x64",
      "Native OS window with proper menu bar, keyboard shortcuts (Cmd/Ctrl+R reload, Cmd/Ctrl+H home), and full-screen support",
      "External links open in the user's default browser; in-app navigation stays inside the desktop window",
      "Desktop client signs in to the same Node FMS workspace as Cloud — files, members, and invites stay in sync",
      "Hosted on GitHub Releases — download from /download and launch",
      "/download page rewritten with per-platform install steps for macOS, Windows, and Linux",
      "RTAO pipeline opened: future Release-To-Application-Only updates will ship to the desktop client first",
    ],
  },
  {
    version: "0.7.1",
    date: "May 28, 2026",
    tags: ["Patch"],
    title: "WebGL fix, workspace invites, and settings",
    highlights: [
      "Fixed WebGL hero contrast so all text is readable against the dark background",
      "Upgraded WebGL shader with perspective grid, data streams, and mouse-tracked plasma",
      "Workspace collaboration system: create workspaces, invite by email, accept via invite code",
      "High-speed uploads via direct-to-storage signed URLs (parallel, up to 15 GB per file)",
      "New /settings page for profile, workspace management, and member invites",
      "New /invite/:code route for accepting workspace invitations",
      "/download page now marks Mac and Windows apps as Available now",
      "Added release-label legend to the changelog so every tag is explained",
    ],
  },
  {
    version: "0.7.0",
    date: "May 28, 2026",
    tags: ["Minor", "Open-Beta"],
    title: "Storage limits, technological refresh, downloads page",
    highlights: [
      "Per-file upload limit raised from 25 MB to 15 GB",
      "Storage plans restructured: Free 500 GB, Starter 1 TB, Steady 5 TB, Node Suite unlimited",
      "WebGL hero background now actually renders (was hidden behind the page surface)",
      "Scroll-triggered reveal animations across the marketing site",
      "New /download page for the upcoming Mac and Windows native apps (shipping 2027)",
      "GitHub button added to the site header, footer, and changelog",
      "Expanded release-label vocabulary: Pre-Alpha, Alpha, Open-Beta, Closed-Beta, RC, Stable, LTS, EOL, RTAO, Emergency Update, Revamp",
    ],
  },
  {
    version: "0.6.0",
    date: "May 26, 2026",
    tags: ["Minor", "Open-Beta"],
    title: "Open Beta begins",
    highlights: [
      "Launch countdown banner across the marketing site",
      "Email verification callback now correctly signs you in",
      "New /changelog page with semantic versioning history",
      "Updated Fast sync copy: desktop apps coming 2027",
      "Removed pre-launch usage claims from the About page",
    ],
  },
  {
    version: "0.5.0",
    date: "May 25, 2026",
    tags: ["Minor", "Alpha"],
    highlights: [
      "AI-powered onboarding chat for new sign-ups",
      "Business profile auto-fills as you describe your company",
      "Storage-based pricing tiers (100 GB → Unlimited)",
    ],
  },
  {
    version: "0.4.0",
    date: "May 24, 2026",
    tags: ["Minor", "Alpha"],
    highlights: [
      "About, Contact, Privacy, and Status pages",
      "Full sitemap.xml with all public routes",
      "Per-route meta, OG, and canonical tags",
    ],
  },
  {
    version: "0.3.0",
    date: "May 23, 2026",
    tags: ["Minor", "Alpha"],
    highlights: [
      "Rebrand to Node File Management Suite (Node FMS)",
      "Homepage pricing section with all four tiers",
    ],
  },
  {
    version: "0.2.0",
    date: "May 22, 2026",
    tags: ["Minor", "Alpha"],
    highlights: [
      "Real authentication: sign up, sign in, Google OAuth",
      "Protected /app route behind sign-in",
      "Forgot password and reset password flows",
    ],
  },
  {
    version: "0.1.0",
    date: "May 21, 2026",
    tags: ["Pre-Release", "Pre-Alpha"],
    highlights: [
      "Initial marketing site: Features, Pricing, Security",
      "Login, signup, and forgot-password pages",
      "Design system: typography, color tokens, components",
    ],
  },
];


const tagStyles: Record<ReleaseTag, string> = {
  Revamp: "bg-fuchsia-100 text-fuchsia-900",
  Major: "bg-emerald-100 text-emerald-900",
  Minor: "bg-blue-100 text-blue-900",
  Patch: "bg-zinc-100 text-zinc-700",
  "Emergency Update": "bg-red-100 text-red-900",
  "Pre-Release": "bg-amber-100 text-amber-900",
  "Pre-Alpha": "bg-orange-100 text-orange-900",
  Alpha: "bg-yellow-100 text-yellow-900",
  "Open-Beta": "bg-sky-100 text-sky-900",
  "Closed-Beta": "bg-indigo-100 text-indigo-900",
  "Release Candidate": "bg-teal-100 text-teal-900",
  Stable: "bg-emerald-100 text-emerald-900",
  LTS: "bg-violet-100 text-violet-900",
  "LTS Patch": "bg-violet-50 text-violet-900",
  EOL: "bg-zinc-800 text-zinc-100",
  RTAO: "bg-rose-100 text-rose-900",
};

const tagMeaning: Record<ReleaseTag, string> = {
  Revamp: "Full visual or architectural rewrite of an area",
  Major: "Breaking changes — review before upgrading",
  Minor: "New features, fully backwards compatible",
  Patch: "Bug fixes and small polish, no new features",
  "Emergency Update": "Hot-shipped fix for a critical or security issue",
  "Pre-Release": "Shipped before general availability — expect rough edges",
  "Pre-Alpha": "Earliest internal builds, things will break",
  Alpha: "Feature-incomplete preview for early testers",
  "Open-Beta": "Public beta, anyone can opt in",
  "Closed-Beta": "Beta limited to invited testers and design partners",
  "Release Candidate": "Final candidate — shipping unless we find regressions",
  Stable: "Generally available, recommended for everyone",
  LTS: "Long-term support — extended maintenance window",
  "LTS Patch": "Maintenance or security-only update for an LTS version",
  EOL: "End of life — no longer supported, please upgrade",
  RTAO: "Release to Application Only — desktop app required",
};

function ChangelogPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <div className="flex items-start justify-between gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Changelog</span>
                <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-balance">
                  What's new in Node FMS
                </h1>
              </div>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ink/10 text-sm font-medium hover:bg-ink/5 transition-colors"
              >
                <Github className="size-4" /> View on GitHub
              </a>
            </div>
            <p className="mt-6 text-lg text-muted-foreground text-pretty">
              We use{" "}
              <a href="https://semver.org" target="_blank" rel="noreferrer" className="underline underline-offset-4">
                semantic versioning
              </a>
              . Every publish ships here with the features, fixes, and changes it includes.
            </p>
            <div className="mt-8 rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                What each label means
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
                {(Object.keys(tagStyles) as ReleaseTag[]).map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm">
                    <span className={`shrink-0 mt-0.5 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${tagStyles[t]}`}>
                      {t}
                    </span>
                    <span className="text-muted-foreground">{tagMeaning[t]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>


          <div className="mt-12 space-y-10">
            {releases.map((r, i) => (
              <Reveal key={r.version} delay={i * 50} as="article">
                <div className="border-l-2 border-border pl-6 relative">
                  <div className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-ink" />
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight">v{r.version}</h2>
                    {r.tags.map((t) => (
                      <span key={t} className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${tagStyles[t]}`}>
                        {t}
                      </span>
                    ))}
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  {r.title && (
                    <p className="mt-2 text-sm font-medium text-ink/70">{r.title}</p>
                  )}
                  <ul className="mt-4 space-y-2 text-sm text-ink/80">
                    {r.highlights.map((h) => (
                      <li key={h} className="flex gap-2">
                        <span className="text-muted-foreground">—</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
