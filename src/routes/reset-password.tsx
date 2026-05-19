import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "./login";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Node" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPage,
});

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // Supabase emits a PASSWORD_RECOVERY event after parsing the URL hash.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse({ password, confirm });
    if (!r.success) {
      const f = r.error.flatten().fieldErrors;
      setErrors({ password: f.password?.[0], confirm: f.confirm?.[0] });
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/app" });
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle={ready ? "Choose a strong password you haven't used before." : "Verifying your reset link…"}
      footer={null}
    >
      {!ready ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Verifying…
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="New password" error={errors.password}>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full px-3 py-2.5 pr-10 text-sm rounded-md bg-card border border-border focus:border-ink/40 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute inset-y-0 right-2 grid place-items-center text-muted-foreground hover:text-ink"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirm new password" error={errors.confirm}>
            <input
              type={showPw ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="w-full px-3 py-2.5 text-sm rounded-md bg-card border border-border focus:border-ink/40 outline-none"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-surface py-2.5 rounded-md text-sm font-medium hover:bg-ink/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Update password
          </button>
        </form>
      )}
    </AuthShell>
  );
}
