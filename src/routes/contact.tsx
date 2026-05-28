import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { submitContact } from "@/lib/contact.functions";
import { CheckCircle2, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Node FMS" },
      { name: "description", content: "Send a message to the Node File Management Suite team. We read every one." },
      { property: "og:title", content: "Contact — Node FMS" },
      { property: "og:description", content: "Send a message to the Node File Management Suite team. We read every one." },
      { property: "og:url", content: "https://nodefms.lovable.app/contact" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/contact" }],
  }),
  component: ContactPage,
});

const promises = [
  { icon: Clock, title: "One business day", body: "Every message gets a real reply within one business day." },
  { icon: ShieldCheck, title: "No ticket black holes", body: "We don't auto-close, auto-route, or auto-anything." },
  { icon: CheckCircle2, title: "Read by the team", body: "Messages go directly to the people building Node FMS." },
];

function ContactPage() {
  const [sending, setSending] = useState(false);
  const send = useServerFn(submitContact);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    if (!name || !email || !message) {
      toast.error("Please fill out every field.");
      return;
    }
    if (name.length > 200 || email.length > 320 || message.length > 5000) {
      toast.error("Message is too long.");
      return;
    }

    setSending(true);
    try {
      const res = await send({
        data: {
          name,
          email,
          message,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : undefined,
        },
      });
      if (res.ok) {
        form.reset();
        toast.success("Message sent — we'll be in touch within one business day.");
      } else {
        toast.error(res.error ?? "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not send your message. Please try again.");
    } finally {
      setSending(false);
    }
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
              Fill out the form and your message lands directly in our inbox. That's it — no
              ticket queues, no chatbots.
            </p>
            <div className="mt-10 space-y-6">
              {promises.map((c) => (
                <div key={c.title} className="flex gap-4">
                  <div className="size-10 rounded-xl bg-card ring-1 ring-black/5 grid place-items-center shrink-0">
                    <c.icon className="size-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="font-semibold">{c.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 bg-card rounded-2xl ring-1 ring-black/5 space-y-5">
            <h2 className="text-xl font-semibold tracking-tight">Send a message</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="name">Name</label>
              <input id="name" name="name" required maxLength={200} className="w-full px-3 py-2 rounded-lg bg-surface ring-1 ring-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-ink" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="email">Work email</label>
              <input id="email" name="email" type="email" required maxLength={320} className="w-full px-3 py-2 rounded-lg bg-surface ring-1 ring-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-ink" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium" htmlFor="message">Message</label>
              <textarea id="message" name="message" required rows={5} maxLength={5000} className="w-full px-3 py-2 rounded-lg bg-surface ring-1 ring-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-ink resize-none" />
            </div>
            <button type="submit" disabled={sending} className="w-full bg-ink text-surface py-2.5 rounded-full text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-60">
              {sending ? "Sending…" : "Send message"}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">
              By submitting you agree to receive a one-time reply from the Node FMS team.
            </p>
          </form>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
