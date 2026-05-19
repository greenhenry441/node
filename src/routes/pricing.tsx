import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Node" },
      { name: "description", content: "Simple, flat pricing for small businesses. Start free, upgrade as your team grows." },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Essential", price: "$29", per: "per team / mo",
    desc: "For boutique studios and solo operators.",
    features: ["2 TB storage", "Up to 5 users", "180-day history", "Smart links", "Email support"],
  },
  {
    name: "Professional", price: "$79", per: "per team / mo",
    desc: "For growing teams that share with clients.",
    features: ["10 TB storage", "Unlimited users", "Client portals", "Audit log", "SSO (Google + Microsoft)", "Priority support"],
    featured: true,
  },
  {
    name: "Business", price: "$199", per: "per team / mo",
    desc: "For multi-office teams with compliance needs.",
    features: ["50 TB storage", "SAML SSO", "Custom DLP rules", "Dedicated CSM", "Custom data residency", "99.99% uptime SLA"],
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance max-w-[20ch] mx-auto">
            Pricing that scales with the team, not the seat count.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-[52ch] mx-auto">
            Flat per-team pricing. 14-day free trial. No credit card required.
          </p>
          <div className="mt-16 grid md:grid-cols-3 gap-6 text-left">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`p-8 rounded-2xl flex flex-col ${
                  t.featured ? "bg-ink text-surface ring-1 ring-ink shadow-elegant" : "bg-card ring-1 ring-black/5"
                }`}
              >
                <span className={`text-xs font-semibold uppercase tracking-wider ${t.featured ? "opacity-60" : "text-muted-foreground"}`}>{t.name}</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold">{t.price}</span>
                  <span className={`text-sm ${t.featured ? "opacity-60" : "text-muted-foreground"}`}>{t.per}</span>
                </div>
                <p className={`mt-3 text-sm ${t.featured ? "opacity-80" : "text-muted-foreground"}`}>{t.desc}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`size-4 mt-0.5 shrink-0 ${t.featured ? "" : "text-ink"}`} />
                      <span className={t.featured ? "" : "text-ink/80"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/app"
                  className={`mt-8 w-full py-2.5 px-4 rounded-full text-sm font-medium text-center transition-colors ${
                    t.featured ? "bg-surface text-ink hover:bg-zinc-100" : "border border-ink/10 hover:bg-ink hover:text-surface"
                  }`}
                >
                  Start free trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
