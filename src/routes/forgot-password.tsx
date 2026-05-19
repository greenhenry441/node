import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "./login";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Node" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPage,
});

const schema = z.object({ email: z.string().trim().email("Enter a valid email").max(255) });

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ email });
    if (!r.success) {
      setError(r.error.flatten().fieldErrors.email?.[0]);
      return;
    }
    setError(undefined);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) {
      toast.error(err.message);
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={
        sent
          ? `We've sent a reset link to ${email}. It may take a minute to arrive.`
          : "Enter the email tied to your Node workspace and we'll send a reset link."
      }
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 text-ink font-medium hover:underline underline-offset-4">
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="rounded-lg border border-border bg-card p-5 flex items-start gap-3">
          <MailCheck className="size-5 text-emerald-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-ink">Reset link sent</div>
            <p className="text-muted-foreground mt-1">
              Didn't get it? Check spam, or{" "}
              <button onClick={() => setSent(false)} className="text-ink underline-offset-4 hover:underline">
                try a different email
              </button>
              .
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Work email" error={error}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-3 py-2.5 text-sm rounded-md bg-card border border-border focus:border-ink/40 outline-none"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-surface py-2.5 rounded-md text-sm font-medium hover:bg-ink/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Send reset link
          </button>
        </form>
      )}
    </AuthShell>
  );
}
