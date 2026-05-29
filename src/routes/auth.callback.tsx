import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Confirming your account — Node FMS" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const finish = (path: "/onboarding" | "/login") => {
      if (!cancelled) navigate({ to: path });
    };

    const run = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const redirect = url.searchParams.get("redirect");
      const errDesc = url.searchParams.get("error_description") || url.hash.match(/error_description=([^&]+)/)?.[1];
      const destination = redirect && redirect.startsWith("/") ? redirect : "/onboarding";

      if (errDesc) {
        setError(decodeURIComponent(errDesc.replace(/\+/g, " ")));
        return;
      }

      // PKCE flow (?code=...)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          setError(error.message);
          return;
        }
        if (!cancelled) window.location.href = destination;
        return;
      }

      // Implicit flow (#access_token=...). supabase-js parses this automatically.
      // Give it a tick, then check the session.
      await new Promise((r) => setTimeout(r, 50));
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        if (!cancelled) window.location.href = destination;
      } else {
        finish("/login");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-surface px-6">
      <div className="text-center max-w-sm">
        {error ? (
          <>
            <h1 className="text-lg font-semibold text-ink">We couldn't confirm your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => navigate({ to: "/login" })}
              className="mt-6 inline-flex bg-ink text-surface px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Confirming your account…
          </div>
        )}
      </div>
    </div>
  );
}
