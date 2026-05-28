import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { chatOnboarding, getBusinessProfile } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [{ title: "Welcome to Node FMS — Onboarding" }],
  }),
  component: OnboardingPage,
});

type Msg = { role: "user" | "assistant"; content: string };
type Profile = {
  company_name?: string;
  industry?: string;
  team_size?: string;
  location?: string;
  products_services?: string;
  target_customers?: string;
  goals?: string;
  current_tools?: string;
  notes?: string;
  completed?: boolean;
};

const FIELD_LABELS: { key: keyof Profile; label: string }[] = [
  { key: "company_name", label: "Company" },
  { key: "industry", label: "Industry" },
  { key: "team_size", label: "Team size" },
  { key: "location", label: "Location" },
  { key: "products_services", label: "What you offer" },
  { key: "target_customers", label: "Target customers" },
  { key: "goals", label: "Goals" },
  { key: "current_tools", label: "Current tools" },
  { key: "notes", label: "Notes" },
];

const INITIAL_ASSISTANT: Msg = {
  role: "assistant",
  content:
    "Welcome to Node FMS. I'll learn a bit about your business so we can tailor your workspace. To start — what's the name of your company?",
};

function OnboardingPage() {
  const navigate = useNavigate();
  const chat = useServerFn(chatOnboarding);
  const fetchProfile = useServerFn(getBusinessProfile);

  const [messages, setMessages] = useState<Msg[]>([INITIAL_ASSISTANT]);
  const [profile, setProfile] = useState<Profile>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProfile()
      .then((r) => {
        if (r.profile) setProfile(r.profile);
        if (r.profile?.completed) {
          navigate({ to: "/app" });
        }
      })
      .catch(() => {});
  }, [fetchProfile, navigate]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const filledCount = FIELD_LABELS.filter((f) => !!profile[f.key]).length;
  const progress = Math.round((filledCount / FIELD_LABELS.length) * 100);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await chat({ data: { messages: next.slice(-20) } });
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      if (res.profile) setProfile(res.profile);
      if (res.profile?.completed) {
        toast.success("Profile complete — taking you to your workspace");
        setTimeout(() => navigate({ to: "/app" }), 1200);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(msg);
      setMessages((m) => m.slice(0, -1));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border/60 px-6 py-4 flex items-center justify-between">
          <img src="/logo-icon.png" alt="Node FMS" className="size-5" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Node FMS</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">Welcome aboard</div>
          </div>
        </div>
        <button
          onClick={() => navigate({ to: "/app" })}
          className="text-xs font-medium text-muted-foreground hover:text-ink"
        >
          Skip for now
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-5 gap-6">
        {/* Chat */}
        <section className="lg:col-span-3 flex flex-col bg-card rounded-2xl ring-1 ring-black/5 h-[calc(100vh-160px)] min-h-[520px]">
          <div className="px-6 py-4 border-b border-border/60 flex items-center gap-2">
            <Sparkles className="size-4 text-ink" />
            <h1 className="text-sm font-semibold">Tell me about your business</h1>
          </div>
          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-ink text-surface rounded-br-sm"
                      : "bg-muted text-ink rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="px-4 py-3 border-t border-border/60 flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer…"
              disabled={sending}
              className="flex-1 px-4 py-2.5 text-sm rounded-full bg-surface ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-ink disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="size-10 grid place-items-center rounded-full bg-ink text-surface hover:bg-ink/90 disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </form>
        </section>

        {/* Profile box that fills up */}
        <aside className="lg:col-span-2 bg-card rounded-2xl ring-1 ring-black/5 p-6 h-fit lg:sticky lg:top-8">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-ink" />
            <h2 className="text-sm font-semibold">Your business profile</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            This fills in as we chat. {filledCount}/{FIELD_LABELS.length} sections complete.
          </p>
          <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-ink transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <dl className="mt-6 space-y-4">
            {FIELD_LABELS.map((f) => {
              const v = profile[f.key] as string | undefined;
              const filled = !!v;
              return (
                <div
                  key={f.key}
                  className={`rounded-lg border p-3 transition-colors ${
                    filled ? "border-ink/15 bg-surface" : "border-dashed border-border bg-muted/30"
                  }`}
                >
                  <dt className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>{f.label}</span>
                    {filled && <CheckCircle2 className="size-3.5 text-emerald-600" />}
                  </dt>
                  <dd className={`mt-1 text-sm ${filled ? "text-ink" : "text-muted-foreground/60 italic"}`}>
                    {filled ? v : "—"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </aside>
      </div>
    </div>
  );
}
