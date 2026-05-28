import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Node" },
      { name: "description", content: "Honest, flat pricing for Node. Start free. The Node Suite tier bundles NodeFMS, Node Tasks, and Node Calendar." },
      { property: "og:title", content: "Pricing — Node" },
      { property: "og:description", content: "Free forever for basics. Node Suite bundles all three apps for one price." },
      { property: "og:url", content: "https://nodefms.lovable.app/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/pricing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Node",
          description:
            "Node — three small apps for small businesses: NodeFMS for files, Node Tasks for work, Node Calendar for time.",
          brand: { "@type": "Brand", name: "Node" },
          offers: [
            { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD", url: "https://nodefms.lovable.app/pricing", description: "NodeFMS basics, unlimited during launch week" },
            { "@type": "Offer", name: "Starter", price: "25.99", priceCurrency: "USD", url: "https://nodefms.lovable.app/pricing", description: "NodeFMS for very small businesses" },
            { "@type": "Offer", name: "Steady", price: "50.99", priceCurrency: "USD", url: "https://nodefms.lovable.app/pricing", description: "NodeFMS for small businesses" },
            { "@type": "Offer", name: "Node Suite", price: "75.99", priceCurrency: "USD", url: "https://nodefms.lovable.app/pricing", description: "NodeFMS + Node Tasks + Node Calendar" },
          ],
        }),
      },
    ],
  }),
  component: PricingPage,
});


const tiers = [
  {
    name: "Free",
    price: "$0",
    per: "forever",
    useCase: "Everyone — unlimited storage while we're in launch week.",
    features: [
      "Unlimited storage (launch promo)",
      "File syncing",
      "File editing",
      "15 GB per file upload",
    ],
    disabled: false,
  },
  {
    name: "Starter",
    price: "$25.99",
    per: "per month",
    useCase: "Very small businesses.",
    features: ["1 TB storage", "File syncing", "File editing", "More file types supported"],
    disabled: true,
  },
  {
    name: "Steady",
    price: "$50.99",
    per: "per month",
    useCase: "Small businesses.",
    features: ["5 TB storage", "Advanced file syncing and editing", "More file types supported"],
    featured: true,
    disabled: true,
  },
  {
    name: "Node Suite",
    price: "$75.99",
    per: "per month",
    useCase: "Small and medium businesses.",
    features: [
      "Unlimited storage in NodeFMS",
      "Full NodeFMS features",
      "Full Node Tasks (List, Board, Calendar views)",
      "Node Calendar with Google + Outlook sync",
    ],

    disabled: true,
  },
];


function PricingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Node pricing
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-balance max-w-[22ch] mx-auto">
            Pick what fits. Bundle when you're ready.
          </h1>
          <p className="mt-4 text-muted-foreground text-pretty max-w-[56ch] mx-auto">
            The first three tiers are NodeFMS only. Node Suite adds Node Tasks and Node Calendar.
          </p>
          <p className="mt-6 text-sm font-medium text-ink/80 max-w-[60ch] mx-auto bg-amber-100 border border-amber-200 rounded-full px-5 py-2">
            Launch week: paid plans are paused while I shake out bugs. Free gets unlimited storage in the meantime.
          </p>


          <div className="mt-12 grid md:grid-cols-2 xl:grid-cols-4 gap-6 text-left">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`p-8 rounded-2xl flex flex-col relative ${
                  t.disabled ? "bg-card/60 ring-1 ring-black/5 opacity-70" :
                  t.featured ? "bg-ink text-surface ring-1 ring-ink shadow-elegant" : "bg-card ring-1 ring-black/5"
                }`}
              >
                {t.disabled && (
                  <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700">
                    Coming soon
                  </span>
                )}
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    t.featured && !t.disabled ? "opacity-60" : "text-muted-foreground"
                  }`}
                >
                  {t.name}
                </span>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight">{t.price}</span>
                  <span className={`text-sm ${t.featured && !t.disabled ? "opacity-60" : "text-muted-foreground"}`}>
                    {t.per}
                  </span>
                </div>
                <p className={`mt-3 text-sm ${t.featured && !t.disabled ? "opacity-80" : "text-muted-foreground"}`}>
                  <span className="font-semibold">Use case:</span> {t.useCase}
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`size-4 mt-0.5 shrink-0 ${t.featured && !t.disabled ? "" : "text-ink"}`} />
                      <span className={t.featured && !t.disabled ? "" : "text-ink/85"}>{f}</span>
                    </li>
                  ))}
                </ul>
                {t.disabled ? (
                  <button
                    disabled
                    className="mt-8 w-full py-2.5 px-4 rounded-full text-sm font-medium text-center bg-zinc-200 text-zinc-500 cursor-not-allowed"
                  >
                    Temporarily unavailable
                  </button>
                ) : (
                  <Link
                    to="/signup"
                    className={`mt-8 w-full py-2.5 px-4 rounded-full text-sm font-medium text-center transition-colors ${
                      t.featured
                        ? "bg-surface text-ink hover:bg-zinc-100"
                        : "border border-ink/10 hover:bg-ink hover:text-surface"
                    }`}
                  >
                    Get started — free
                  </Link>
                )}
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs uppercase tracking-widest text-muted-foreground">
            Paid plans return after launch week
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
