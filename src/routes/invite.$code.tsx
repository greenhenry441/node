import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getInviteByCode, acceptInvite, joinWorkspaceByCode } from "@/lib/workspaces.functions";

export const Route = createFileRoute("/invite/$code")({
  head: () => ({ meta: [{ title: "Join workspace — Node FMS" }] }),
  component: InvitePage,
});

function InvitePage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [sessionEmail, setSessionEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSessionEmail(data.user?.email ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setSessionEmail(s?.user?.email ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  const lookupFn = useServerFn(getInviteByCode);
  const acceptFn = useServerFn(acceptInvite);
  const joinFn = useServerFn(joinWorkspaceByCode);

  const q = useQuery({
    queryKey: ["invite", code],
    queryFn: () => lookupFn({ data: { code } }),
  });

  const acceptMut = useMutation({
    mutationFn: () => acceptFn({ data: { code } }),
    onSuccess: () => { toast.success("You're in!"); navigate({ to: "/settings" }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const joinMut = useMutation({
    mutationFn: () => joinFn({ data: { code } }),
    onSuccess: () => { toast.success("Joined workspace"); navigate({ to: "/settings" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen grid place-items-center bg-surface text-ink px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Link to="/" className="text-xs uppercase tracking-widest text-muted-foreground">Node FMS</Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">You've been invited</h1>

        {q.isLoading && (
          <div className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Checking invite…
          </div>
        )}

        {q.data && !q.data.invite && (
          <div className="mt-6 text-sm flex items-start gap-2 text-destructive">
            <AlertCircle className="size-4 mt-0.5" /> This invite link is invalid or has been revoked.
          </div>
        )}

        {q.data?.invite && (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Join <span className="font-semibold text-ink">{q.data.invite.workspace?.name ?? "the workspace"}</span> as a{" "}
              <span className="font-semibold text-ink">{q.data.invite.role}</span>.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Invited email: {q.data.invite.email}</p>

            {q.data.invite.accepted_at && (
              <div className="mt-6 text-sm text-muted-foreground">This invite was already used.</div>
            )}

            {!q.data.invite.accepted_at && (
              <div className="mt-6 space-y-3">
                {sessionEmail === undefined ? (
                  <div className="text-sm text-muted-foreground"><Loader2 className="inline size-4 animate-spin mr-1" /> Loading…</div>
                ) : sessionEmail === null ? (
                  <Link
                    to="/login"
                    search={{ next: `/invite/${code}` } as never}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-surface text-sm font-medium hover:bg-ink/90"
                  >
                    Sign in to accept <ArrowRight className="size-4" />
                  </Link>
                ) : sessionEmail.toLowerCase() !== q.data.invite.email.toLowerCase() ? (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    You're signed in as <strong>{sessionEmail}</strong>. Sign in as {q.data.invite.email} to accept.
                  </div>
                ) : (
                  <button
                    onClick={() => acceptMut.mutate()}
                    disabled={acceptMut.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-surface text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
                  >
                    {acceptMut.isPending && <Loader2 className="size-4 animate-spin" />}
                    Accept invite <ArrowRight className="size-4" />
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
