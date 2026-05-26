import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Node FMS" },
      { name: "description", content: "Node File Management Suite is a division of Node, building secure, focused software for small businesses." },
      { property: "og:title", content: "About — Node FMS" },
      { property: "og:description", content: "Node File Management Suite is a division of Node, building secure, focused software for small businesses." },
      { property: "og:url", content: "https://nodefms.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/about" }],
  }),
  component: AboutPage,
});

const stats = [
  { k: "June 1, 2026", v: "Public launch date" },
  { k: "180 days", v: "File history on every plan" },
  { k: "3 regions", v: "Data residency: US, EU, AU" },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">About</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            Built for the businesses the enterprise tools forgot.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            Node FMS is the File Management Suite division of Node — a software studio focused on operational tools for
            small and medium businesses. We started Node FMS because the leading file platforms either treat small
            teams as an afterthought or charge them like a Fortune 500. Node FMS is a new product launching{" "}
            <span className="text-ink font-medium">June 1, 2026</span> — we don't have customers or reviews yet, and
            we'd rather say that plainly than fake it.
          </p>

          <div className="mt-14 grid sm:grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.k} className="p-6 bg-card rounded-2xl ring-1 ring-black/5">
                <div className="text-3xl font-semibold tracking-tight">{s.k}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>

          <h2 className="mt-16 text-2xl font-semibold tracking-tight">What we believe</h2>
          <ul className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <li><span className="text-ink font-medium">Security is table stakes.</span> SOC 2, SSO, audit logs — included, not upsold.</li>
            <li><span className="text-ink font-medium">Pricing should be honest.</span> Flat tiers, no per-seat surprises, cancel anytime.</li>
            <li><span className="text-ink font-medium">Speed matters.</span> Sync, search, and sharing should feel instant on a small-team laptop.</li>
          </ul>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
