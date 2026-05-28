import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import {
  listForumTopics,
  createForumTopic,
  type ForumCategory,
  type ForumTopic,
} from "@/lib/forum.functions";

export const Route = createFileRoute("/forum")({
  head: () => ({
    meta: [
      { title: "Forum — Node FMS" },
      {
        name: "description",
        content:
          "The Node FMS community forum — ask for help, share feedback, request features, and read announcements from the Node team.",
      },
      { property: "og:title", content: "Forum — Node FMS" },
      {
        property: "og:description",
        content:
          "The Node FMS community forum — ask for help, share feedback, request features, and read announcements from the Node team.",
      },
      { property: "og:url", content: "https://nodefms.lovable.app/forum" },
    ],
    links: [{ rel: "canonical", href: "https://nodefms.lovable.app/forum" }],
  }),
  component: ForumIndex,
});

const CATEGORIES: { id: ForumCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "announcements", label: "Announcements" },
  { id: "help", label: "Help" },
  { id: "feedback", label: "Feedback" },
  { id: "showcase", label: "Showcase" },
  { id: "general", label: "General" },
];

const CATEGORY_STYLE: Record<ForumCategory, string> = {
  announcements: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
  help: "bg-blue-500/10 text-blue-700 ring-blue-500/20",
  feedback: "bg-purple-500/10 text-purple-700 ring-purple-500/20",
  showcase: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  general: "bg-ink/5 text-ink ring-ink/10",
};

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function ForumIndex() {
  const [cat, setCat] = useState<ForumCategory | "all">("all");
  const [composing, setComposing] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const fetchList = useServerFn(listForumTopics);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSignedIn(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const { data: topics, isLoading, refetch } = useQuery({
    queryKey: ["forum-topics", cat],
    queryFn: () => fetchList({ data: { category: cat } }),
  });

  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Community
              </span>
              <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight">Node Forum</h1>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Ask questions, share what you're building, and follow along with announcements from the Node team. Anyone
                can read — sign in to post.
              </p>
            </div>
            <button
              onClick={() => {
                if (!signedIn) {
                  toast.info("Sign in to start a topic");
                  router.navigate({ to: "/login" });
                  return;
                }
                setComposing(true);
              }}
              className="px-4 py-2 rounded-full text-sm font-medium bg-ink text-surface hover:bg-ink/90 transition-colors"
            >
              New topic
            </button>
          </div>

          {/* Category filter */}
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ring-1 transition-colors ${
                  cat === c.id
                    ? "bg-ink text-surface ring-ink"
                    : "bg-card text-muted-foreground ring-ink/10 hover:text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {composing && (
            <NewTopicForm
              onCancel={() => setComposing(false)}
              onCreated={() => {
                setComposing(false);
                refetch();
              }}
            />
          )}

          <div className="mt-8 rounded-2xl border border-border/60 bg-card overflow-hidden">
            {isLoading && (
              <div className="p-12 text-center text-sm text-muted-foreground">Loading topics…</div>
            )}
            {!isLoading && (topics?.length ?? 0) === 0 && (
              <div className="p-16 text-center">
                <div className="text-lg font-semibold">No topics yet</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Be the first to start a conversation in this category.
                </p>
              </div>
            )}
            <ul className="divide-y divide-border/60">
              {topics?.map((t) => (
                <TopicRow key={t.id} topic={t} />
              ))}
            </ul>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function TopicRow({ topic }: { topic: ForumTopic }) {
  return (
    <li>
      <Link
        to="/forum/$id"
        params={{ id: topic.id }}
        className="flex items-start gap-4 p-5 hover:bg-ink/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ring-1 ${CATEGORY_STYLE[topic.category]}`}
            >
              {topic.category}
            </span>
            <h3 className="text-sm md:text-base font-semibold text-ink truncate">{topic.title}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{topic.body}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            by <span className="text-ink/80 font-medium">{topic.author_name ?? "user"}</span> ·{" "}
            {timeAgo(topic.last_activity_at)}
          </div>
        </div>
        <div className="text-center shrink-0">
          <div className="text-lg font-semibold text-ink">{topic.reply_count}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {topic.reply_count === 1 ? "reply" : "replies"}
          </div>
        </div>
      </Link>
    </li>
  );
}

function NewTopicForm({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<ForumCategory>("general");
  const [submitting, setSubmitting] = useState(false);
  const create = useServerFn(createForumTopic);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return toast.error("Title must be at least 3 characters");
    if (body.trim().length < 1) return toast.error("Body is required");
    setSubmitting(true);
    try {
      const res = await create({ data: { title: title.trim(), body: body.trim(), category } });
      toast.success("Topic posted");
      onCreated();
      navigate({ to: "/forum/$id", params: { id: res.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 rounded-2xl border border-border/60 bg-card p-5">
      <div className="text-sm font-semibold text-ink">Start a new topic</div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Topic title"
        maxLength={200}
        className="mt-4 w-full px-3 py-2 rounded-md border border-ink/10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ForumCategory)}
        className="mt-3 w-full px-3 py-2 rounded-md border border-ink/10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
      >
        <option value="general">General</option>
        <option value="help">Help</option>
        <option value="feedback">Feedback</option>
        <option value="showcase">Showcase</option>
        <option value="announcements">Announcements</option>
      </select>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share the details. Markdown-style line breaks are supported."
        rows={6}
        maxLength={10000}
        className="mt-3 w-full px-3 py-2 rounded-md border border-ink/10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ink/20"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full text-sm font-medium border border-ink/10 hover:bg-ink/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-full text-sm font-medium bg-ink text-surface hover:bg-ink/90 disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post topic"}
        </button>
      </div>
    </form>
  );
}
