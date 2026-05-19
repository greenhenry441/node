import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Shield, Lock, Server, FileCheck2, KeyRound, Eye } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security — Node" },
      { name: "description", content: "SOC 2 Type II, end-to-end encryption, SSO, and granular audit logs. Security your business and your clients can trust." },
    ],
  }),
  component: SecurityPage,
});

const items = [
  { icon: Shield, title: "SOC 2 Type II", body: "Independently audited annually. Reports available on request." },
  { icon: Lock, title: "Encryption everywhere", body: "AES-256 at rest, TLS 1.3 in transit. Optional customer-managed keys on Business." },
  { icon: KeyRound, title: "SSO and MFA", body: "Google, Microsoft, and SAML SSO. Enforce MFA org-wide in one click." },
  { icon: Eye, title: "Audit log", body: "Every action recorded — uploads, downloads, shares, permission changes. Export anytime." },
  { icon: Server, title: "Regional data residency", body: "Choose US, EU, or AU storage. Files never leave your selected region." },
  { icon: FileCheck2, title: "Compliance ready", body: "GDPR, HIPAA, and CCPA tooling. BAAs available on the Business plan." },
];

function SecurityPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-[42ch]">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Security</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-balance">
              Security your clients can trust.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-pretty">
              Node is built on the same security primitives as Fortune 500 platforms — packaged for small business pricing and onboarding.
            </p>
          </div>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((f) => (
              <div key={f.title} className="p-6 bg-card rounded-2xl ring-1 ring-black/5">
                <f.icon className="size-5" strokeWidth={1.5} />
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
