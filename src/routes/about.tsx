import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GraduationCap, Sparkles, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Node" },
      { name: "description", content: "Node is a small software studio building NodeFMS, Node Tasks, and Node Calendar. Made by Henry Green, an 11-year-old in Milford, MI." },
      { property: "og:title", content: "About — Node" },
      { property: "og:description", content: "Meet Henry, the 11-year-old building Node — a tiny studio making file management, task tracking, and calendar tools for small businesses." },
      { property: "og:url", content: "https://nodefms.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />

      <section className="py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">About Node</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            A small studio making the tools I wish existed.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            Node is a tiny software studio. Right now it's three things working together:{" "}
            <span className="text-ink font-medium">NodeFMS</span> for files,{" "}
            <span className="text-ink font-medium">Node Tasks</span> for getting work done, and{" "}
            <span className="text-ink font-medium">Node Calendar</span> for keeping everything on time.
            Built so a small team can stop juggling six different apps just to run a normal week.
          </p>
        </div>
      </section>

      {/* Bio */}
      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-card rounded-3xl ring-1 ring-black/5 overflow-hidden shadow-elegant">
            <div className="grid md:grid-cols-[280px_1fr] gap-0">
              <div className="bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50 p-6 grid place-items-center">
                <img
                  src="/henry-avatar.png"
                  alt="Henry Green — the 11-year-old behind Node"
                  width={280}
                  height={280}
                  loading="lazy"
                  className="w-44 h-44 md:w-56 md:h-56 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              </div>
              <div className="p-7 md:p-9">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hi, I'm</span>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">Henry Green</h2>
                <p className="mt-1 text-sm text-muted-foreground">11 · Milford, Michigan · Huron Valley Schools</p>

                <div className="mt-5 space-y-4 text-[15px] text-ink/85 leading-relaxed">
                  <p>
                    I'm 11 years old and I go to school in the <span className="font-medium text-ink">HVS District</span>{" "}
                    (Huron Valley Schools) in Milford, MI. I built Node as my{" "}
                    <span className="font-medium text-ink">Gifted &amp; Talented project</span> this year.
                  </p>
                  <p>
                    I chose to build this because every time someone in my family — or anyone running a small business —
                    tries to keep their stuff organized, they end up paying for like five different apps that all kind of
                    do the same thing but never quite work together. I thought: what if one small, simple set of tools
                    could just <em>handle it</em>? So I made one.
                  </p>
                  <p>
                    Node is still really new. There's a lot I want to add. But the whole point is that it gets built by
                    someone who actually <em>uses</em> it, not by a giant company that's never met you. If you find a
                    bug or have an idea, please tell me — I read everything.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Link to="/contact" className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink text-surface rounded-full text-sm font-medium hover:bg-ink/90">
                    <HeartHandshake className="size-4" /> Say hi
                  </Link>
                  <Link to="/features" className="inline-flex items-center gap-1.5 px-4 py-2 border border-ink/10 rounded-full text-sm font-medium hover:bg-ink/5">
                    See what Node does
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-semibold tracking-tight">What Node is about</h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-5">
            {[
              { icon: GraduationCap, title: "Made by a kid, on purpose", body: "This started as a school project. It's not pretending to be something it isn't." },
              { icon: Sparkles, title: "Small, simple, honest", body: "If a feature doesn't help a small team, it doesn't ship. No fake reviews. No surprise per-seat fees." },
              { icon: HeartHandshake, title: "Built with you", body: "Tell me what's broken or what you need. I actually listen, because there's only one of me." },
            ].map((v) => (
              <div key={v.title} className="p-5 bg-card rounded-2xl ring-1 ring-black/5">
                <v.icon className="size-5 text-ink" strokeWidth={1.5} />
                <h3 className="mt-3 font-semibold text-sm">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
