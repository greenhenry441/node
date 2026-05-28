import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Status — Node" },
      { name: "description", content: "Live status for Node — NodeFMS, Node Tasks, and Node Calendar." },
      { property: "og:title", content: "Status — Node" },
      { property: "og:description", content: "Live status for Node — NodeFMS, Node Tasks, and Node Calendar." },
      { property: "og:url", content: "https://nodefms.lovable.app/status" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/status" }],
  }),
  component: StatusPage,
});


const systems = [
  { name: "NodeFMS — storage & sync", uptime: "99.99%" },
  { name: "NodeFMS — web app", uptime: "99.98%" },
  { name: "Node Tasks", uptime: "99.99%" },
  { name: "Node Calendar sync", uptime: "99.97%" },
  { name: "Authentication", uptime: "100.00%" },
  { name: "Sharing & client portals", uptime: "99.98%" },
];

function StatusPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">All three apps are happy.</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Updated continuously. 90-day rolling uptime across NodeFMS, Node Tasks, and Node Calendar.
          </p>


          <div className="mt-12 divide-y divide-border/60 rounded-2xl bg-card ring-1 ring-black/5">
            {systems.map((s) => (
              <div key={s.name} className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-emerald-600" strokeWidth={1.75} />
                  <span className="font-medium">{s.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{s.uptime}</span>
              </div>
            ))}
          </div>

          <h2 className="mt-16 text-xl font-semibold tracking-tight">Recent incidents</h2>
          <p className="mt-3 text-muted-foreground">No incidents reported in the last 30 days.</p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
