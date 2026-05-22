import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Mail, MessageSquare, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Node FMS" },
      { name: "description", content: "Get in touch with the Node File Management Suite team — sales, support, or partnerships." },
      { property: "og:title", content: "Contact — Node FMS" },
      { property: "og:description", content: "Get in touch with the Node File Management Suite team — sales, support, or partnerships." },
      { property: "og:url", content: "https://nodefms.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/contact" }],
  }),
  component: ContactPage,
});

const channels = [
  { icon: Mail, title: "Support", body: "support@nodefms.example", hint: "Replies within one business day." },
  { icon: MessageSquare, title: "Sales", body: "sales@nodefms.example", hint: "For plans of 10+ seats or custom needs." },
  { icon: Building2, title: "Press & partnerships", body: "press@nodefms.example", hint: "Node division inquiries welcome." },
];

function ContactPage() {
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Message sent — we'll be in touch within one business day.");
    }, 700);
  }

  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-balance">Talk to a human.</h1>
            <p className="mt-6 text-lg text-muted-foreground text-pretty">
              No bots, no ticket queues that disappear. Pick the channel that fits.
            </p>
            <div className="mt-10 space-y-6">
              {channels.map((c) => (
                <div key={c.title} className="flex gap-4">
                  <div className="size-10 rounded-xl bg-card ring-1 ring-black/5 grid place-items-center shrink-0">
                    <c.icon className="size-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-sm text-ink">{c.body}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{c.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 bg-card rounded-2xl ring-1 ring-black/5 space-y-5">
            <h2 className="text-xl font-semibold tracking-tight">Send a message</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="name">Name</label>
              <input id="name" name="name" required className="w-full px-3 py-2 rounded-lg bg-surface ring-1 ring-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-ink" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="email">Work email</label>
              <input id="email" name="email" type="email" required className="w-full px-3 py-2 rounded-lg bg-surface ring-1 ring-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-ink" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="message">Message</label>
              <textarea id="message" name="message" required rows={5} className="w-full px-3 py-2 rounded-lg bg-surface ring-1 ring-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-ink resize-none" />
            </div>
            <button type="submit" disabled={sending} className="w-full bg-ink text-surface py-2.5 rounded-full text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-60">
              {sending ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
