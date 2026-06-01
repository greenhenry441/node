import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WebGLBackground } from "@/components/webgl-background";
import { Reveal } from "@/components/reveal";
import { useMemo, useState } from "react";
import { Mail, Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — Node" },
      { name: "description", content: "Donate to Node to help cover a Lovable Pro subscription and, eventually, a custom domain. Built by an 11-year-old in Milford, MI." },
      { property: "og:title", content: "Donate — Node" },
      { property: "og:description", content: "Chip in toward Node's Lovable Pro subscription and a future custom domain." },
      { property: "og:url", content: "https://nodefms.lovable.app/donate" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/donate" }],
  }),
  component: DonatePage,
});

const PRIMARY_EMAIL = "greenhenry3@icloud.com";
const SECONDARY_EMAIL = "greenhenry441@gmail.com";

function DonatePage() {
  const [amount, setAmount] = useState("");
  const [exchange, setExchange] = useState("");

  const num = Number(amount) || 0;

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("I'd like to donate to Node");
    const body = encodeURIComponent(
      `Hi Henry,\n\nI'd like to donate to Node.\n\nAmount I'm willing to donate: $${num.toLocaleString()}\nExchange amount: ${exchange || "(nothing needed — happy to help!)"}\n\nThanks!`,
    );
    return `mailto:${PRIMARY_EMAIL}?subject=${subject}&body=${body}`;
  }, [num, exchange]);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <section className="relative overflow-hidden bg-[#06070d] text-white">
        <WebGLBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-[#06070d]/70 via-[#06070d]/40 to-[#06070d]/85 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,7,13,0.55)_70%)] pointer-events-none" />
        <div className="relative z-10">
          <SiteHeader theme="dark" />
          <div className="py-20 md:py-28">
            <div className="max-w-3xl mx-auto px-6 text-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur text-[11px] font-mono uppercase tracking-[0.18em] text-white/70 mb-6">
                  <Heart className="size-3" /> Donate to Node
                </div>
                <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight text-balance">
                  Help keep Node growing.
                </h1>
                <p className="mt-6 text-lg text-white/70 text-pretty max-w-[52ch] mx-auto">
                  Donations go toward my Lovable Pro subscription and, eventually, a custom domain
                  for Node. Every bit helps a kid keep building.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-semibold tracking-tight">How to donate</h2>
          <ol className="mt-6 space-y-4">
            <li className="flex gap-4 p-5 bg-card rounded-2xl ring-1 ring-black/5">
              <span className="size-7 shrink-0 grid place-items-center rounded-full bg-ink text-surface text-sm font-semibold">1</span>
              <div>
                <div className="font-semibold">Reach out by email</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Message{" "}
                  <a href={`mailto:${PRIMARY_EMAIL}`} className="text-ink font-medium underline underline-offset-2">{PRIMARY_EMAIL}</a>{" "}
                  or email{" "}
                  <a href={`mailto:${SECONDARY_EMAIL}`} className="text-ink font-medium underline underline-offset-2">{SECONDARY_EMAIL}</a>.
                </p>
              </div>
            </li>
            <li className="flex gap-4 p-5 bg-card rounded-2xl ring-1 ring-black/5">
              <span className="size-7 shrink-0 grid place-items-center rounded-full bg-ink text-surface text-sm font-semibold">2</span>
              <div>
                <div className="font-semibold">Add the amount you're willing to donate and the exchange amount</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell me how much you'd like to donate, and anything you'd like in exchange. Use the
                  calculator below to draft your message.
                </p>
              </div>
            </li>
          </ol>

          <div className="mt-8 p-6 md:p-8 bg-card rounded-3xl ring-1 ring-black/5 shadow-elegant">
            <h3 className="text-lg font-semibold tracking-tight">Draft your donation</h3>
            <div className="mt-5 grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="amount" className="text-xs font-medium">Amount you're willing to donate ($)</label>
                <div className="flex items-center rounded-lg bg-surface ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-ink">
                  <span className="pl-3 text-muted-foreground">$</span>
                  <input
                    id="amount"
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10"
                    className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="exchange" className="text-xs font-medium">Exchange amount (what you'd like in return)</label>
                <input
                  id="exchange"
                  type="text"
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  placeholder="e.g. nothing, a thank-you, or a shout-out"
                  className="w-full rounded-lg bg-surface ring-1 ring-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink"
                />
              </div>
            </div>
            <a
              href={mailto}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-surface rounded-full text-sm font-medium hover:bg-ink/90 transition-colors"
            >
              <Mail className="size-4" /> Email my donation <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
