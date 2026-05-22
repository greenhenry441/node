import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Node FMS" },
      { name: "description", content: "Simple, flat pricing for Node FMS. Start free, upgrade or cancel anytime." },
      { property: "og:title", content: "Pricing — Node FMS" },
      { property: "og:description", content: "Simple, flat pricing for Node FMS. Start free, upgrade or cancel anytime." },
      { property: "og:url", content: "https://nodefms.lovable.app/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/pricing" }],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Free",
    price: "$0",
    per: "forever",
    useCase: "Personal projects and temporary businesses.",
    features: ["100 GB storage", "File syncing", "File editing"],
  },
  {
    name: "Starter",
    price: "$25.99",
    per: "per month",
    useCase: "Very small businesses.",
    features: ["500 GB storage", "File syncing", "File editing", "More file types supported"],
  },
  {
    name: "Steady",
    price: "$50.99",
    per: "per month",
    useCase: "Small businesses.",
    features: ["1 TB storage", "Advanced file syncing and editing", "More file types supported"],
    featured: true,
  },
  {
    name: "Node Suite",
    price: "$75.99",
    per: "per month",
    useCase: "Small and medium businesses.",
    features: [
      "Unlimited storage",
      "All Node File Management",
      "Node Task Management",
      "Later: Node Intelligence features",
    ],
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Node File Management
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-balance max-w-[22ch] mx-auto">
            Price list.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-[52ch] mx-auto">
            Upgrade or cancel anytime. Every plan scales with your team.
          </p>

          <div className="mt-16 grid md:grid-cols-2 xl:grid-cols-4 gap-6 text-left">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`p-8 rounded-2xl flex flex-col ${
                  t.featured ? "bg-ink text-surface ring-1 ring-ink shadow-elegant" : "bg-card ring-1 ring-black/5"
                }`}
              >
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    t.featured ? "opacity-60" : "text-muted-foreground"
                  }`}
                >
                  {t.name}
                </span>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight">{t.price}</span>
                  <span className={`text-sm ${t.featured ? "opacity-60" : "text-muted-foreground"}`}>
                    {t.per}
                  </span>
                </div>
                <p className={`mt-3 text-sm ${t.featured ? "opacity-80" : "text-muted-foreground"}`}>
                  <span className="font-semibold">Use case:</span> {t.useCase}
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`size-4 mt-0.5 shrink-0 ${t.featured ? "" : "text-ink"}`} />
                      <span className={t.featured ? "" : "text-ink/85"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`mt-8 w-full py-2.5 px-4 rounded-full text-sm font-medium text-center transition-colors ${
                    t.featured
                      ? "bg-surface text-ink hover:bg-zinc-100"
                      : "border border-ink/10 hover:bg-ink hover:text-surface"
                  }`}
                >
                  {t.name === "Free" ? "Get started" : "Start free trial"}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs uppercase tracking-widest text-muted-foreground">
            Upgrade or cancel anytime
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
