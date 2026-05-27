import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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

type Release = {
  version: string;
  date: string;
  tag: "Pre-release" | "Minor" | "Major" | "Patch";
  highlights: string[];
};

// Append a new entry at the top each time we publish.
// Follow semver: MAJOR.MINOR.PATCH.
const releases: Release[] = [
  {
    version: "0.6.0",
    date: "May 26, 2026",
    tag: "Pre-release",
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
    tag: "Minor",
    highlights: [
      "AI-powered onboarding chat for new sign-ups",
      "Business profile auto-fills as you describe your company",
      "Storage-based pricing tiers (100 GB → Unlimited)",
    ],
  },
  {
    version: "0.4.0",
    date: "May 24, 2026",
    tag: "Minor",
    highlights: [
      "About, Contact, Privacy, and Status pages",
      "Full sitemap.xml with all public routes",
      "Per-route meta, OG, and canonical tags",
    ],
  },
  {
    version: "0.3.0",
    date: "May 23, 2026",
    tag: "Minor",
    highlights: [
      "Rebrand to Node File Management Suite (Node FMS)",
      "Homepage pricing section with all four tiers",
    ],
  },
  {
    version: "0.2.0",
    date: "May 22, 2026",
    tag: "Minor",
    highlights: [
      "Real authentication: sign up, sign in, Google OAuth",
      "Protected /app route behind sign-in",
      "Forgot password and reset password flows",
    ],
  },
  {
    version: "0.1.0",
    date: "May 21, 2026",
    tag: "Pre-release",
    highlights: [
      "Initial marketing site: Features, Pricing, Security",
      "Login, signup, and forgot-password pages",
      "Design system: typography, color tokens, components",
    ],
  },
];

const tagStyles: Record<Release["tag"], string> = {
  "Pre-release": "bg-amber-100 text-amber-900",
  Minor: "bg-blue-100 text-blue-900",
  Major: "bg-emerald-100 text-emerald-900",
  Patch: "bg-zinc-100 text-zinc-700",
};

function ChangelogPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Changelog</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            What's new in Node FMS
          </h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            We use{" "}
            <a href="https://semver.org" target="_blank" rel="noreferrer" className="underline underline-offset-4">
              semantic versioning
            </a>
            . Every publish ships here with the features, fixes, and changes it includes.
          </p>

          <div className="mt-12 space-y-10">
            {releases.map((r) => (
              <article key={r.version} className="border-l-2 border-border pl-6 relative">
                <div className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-ink" />
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight">v{r.version}</h2>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${tagStyles[r.tag]}`}>
                    {r.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-ink/80">
                  {r.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="text-muted-foreground">—</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
