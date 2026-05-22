import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Node FMS" },
      { name: "description", content: "How Node File Management Suite collects, uses, and protects your business's data." },
      { property: "og:title", content: "Privacy — Node FMS" },
      { property: "og:description", content: "How Node File Management Suite collects, uses, and protects your business's data." },
      { property: "og:url", content: "https://nodefms.lovable.app/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    h: "What we collect",
    p: "Account details (name, work email, company), authentication metadata, file contents you upload, and product telemetry needed to operate the service.",
  },
  {
    h: "How we use it",
    p: "To deliver file storage, syncing, sharing, and editing; to secure the service against abuse; and to communicate operational updates.",
  },
  {
    h: "How we protect it",
    p: "AES-256 at rest, TLS 1.3 in transit, role-based access on our side, and customer-controlled permissions on yours. See the Security page for details.",
  },
  {
    h: "Who we share it with",
    p: "Sub-processors strictly required to run Node FMS (hosting, email delivery, error monitoring). We never sell your data.",
  },
  {
    h: "Your rights",
    p: "Access, export, correct, or delete your data at any time from inside the app, or by emailing privacy@nodefms.example.",
  },
  {
    h: "Retention",
    p: "Files are retained as long as your account is active and for 30 days after cancellation to allow restoration. Audit logs are retained for 12 months.",
  },
];

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Privacy</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">Your data, your business.</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Effective May 22, 2026. This summary explains how Node FMS handles the information you trust us with.
          </p>
          <div className="mt-12 space-y-10">
            {sections.map((s) => (
              <div key={s.h}>
                <h2 className="text-xl font-semibold tracking-tight">{s.h}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
          <p className="mt-16 text-sm text-muted-foreground">
            Questions? Reach the Node FMS privacy team at <span className="text-ink">privacy@nodefms.example</span>.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
