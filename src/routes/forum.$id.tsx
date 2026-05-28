import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import {
  getForumTopic,
  createForumReply,
  deleteForumTopic,
} from "@/lib/forum.functions";

export const Route = createFileRoute("/forum/$id")({
  head: ({ params }) => ({
    meta: [
      { title: "Topic — Node Forum" },
      { name: "description", content: "Discussion thread on the Node FMS community forum." },
      { property: "og:title", content: "Topic — Node Forum" },
      { property: "og:description", content: "Discussion thread on the Node FMS community forum." },
      { property: "og:url", content: `https://nodefms.lovable.app/forum/${params.id}` },
    ],
  }),
  component: TopicPage,
});

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function TopicPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const fetchTopic = useServerFn(getForumTopic);
  const postReply = useServerFn(createForumReply);
  const deleteTopic = useServerFn(deleteForumTopic);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setMe(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setMe(s?.user.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["forum-topic", id],
    queryFn: () => fetchTopic({ data: { id } }),
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) {
      toast.info("Sign in to reply");
      router.navigate({ to: "/login" });
      return;
    }
    if (reply.trim().length < 1) return;
    setSubmitting(true);
    try {
      await postReply({ data: { topic_id: id, body: reply.trim() } });
      setReply("");
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reply");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this topic and all replies?")) return;
    try {
      await deleteTopic({ data: { id } });
      toast.success("Topic deleted");
      router.navigate({ to: "/forum" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <SiteHeader />
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link to="/forum" className="text-sm text-muted-foreground hover:text-ink">
            ← Back to forum
          </Link>

          {isLoading && <div className="mt-8 text-sm text-muted-foreground">Loading…</div>}
          {error && (
            <div className="mt-8 text-sm text-red-600">
              {error instanceof Error ? error.message : "Failed to load"}
            </div>
          )}

          {data && (
            <>
              <article className="mt-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {data.topic.category}
                </span>
                <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
                  {data.topic.title}
                </h1>
                <div className="mt-3 text-sm text-muted-foreground">
                  by <span className="text-ink font-medium">{data.topic.author_name ?? "user"}</span> ·{" "}
                  {fmtDate(data.topic.created_at)}
                </div>
                <div className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                  {data.topic.body}
                </div>
                {me === data.topic.user_id && (
                  <button
                    onClick={remove}
                    className="mt-6 text-xs text-red-600 hover:underline"
                  >
                    Delete topic
                  </button>
                )}
              </article>

              <div className="mt-12">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {data.replies.length} {data.replies.length === 1 ? "reply" : "replies"}
                </h2>
                <ul className="mt-4 space-y-4">
                  {data.replies.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-border/60 bg-card p-5"
                    >
                      <div className="text-xs text-muted-foreground">
                        <span className="text-ink font-medium">{r.author_name ?? "user"}</span> ·{" "}
                        {fmtDate(r.created_at)}
                      </div>
                      <div className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                        {r.body}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <form onSubmit={submit} className="mt-10 rounded-2xl border border-border/60 bg-card p-5">
                <div className="text-sm font-semibold text-ink">
                  {me ? "Post a reply" : "Sign in to reply"}
                </div>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={5}
                  maxLength={10000}
                  disabled={!me}
                  placeholder={me ? "Write your reply…" : "You must be signed in to post."}
                  className="mt-3 w-full px-3 py-2 rounded-md border border-ink/10 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-ink/20 disabled:opacity-60"
                />
                <div className="mt-4 flex justify-end">
                  {me ? (
                    <button
                      type="submit"
                      disabled={submitting || reply.trim().length === 0}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-ink text-surface hover:bg-ink/90 disabled:opacity-60"
                    >
                      {submitting ? "Posting…" : "Post reply"}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-full text-sm font-medium bg-ink text-surface hover:bg-ink/90"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
