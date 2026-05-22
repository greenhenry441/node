import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Field, Divider, GoogleIcon } from "./login";
import { Check, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your Node workspace" },
      { name: "description", content: "Start your 14-day free trial of Node — secure file storage for small businesses." },
    ],
  }),
  component: SignupPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  company: z.string().trim().min(1, "Company name is required").max(80),
  email: z.string().trim().email("Enter a valid work email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
  terms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
});

function pwStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", company: "", email: "", password: "" });
  const [terms, setTerms] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkInbox, setCheckInbox] = useState(false);

  const score = useMemo(() => pwStrength(form.password), [form.password]);
  const strengthLabel = ["Too weak", "Weak", "Okay", "Strong", "Excellent"][score];

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ ...form, terms });
    if (!result.success) {
      const f = result.error.flatten().fieldErrors;
      setErrors({
        name: f.name?.[0],
        company: f.company?.[0],
        email: f.email?.[0],
        password: f.password?.[0],
        terms: (f as Record<string, string[] | undefined>).terms?.[0],
      });
      return;
    }
    setErrors({});
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
        data: { full_name: form.name, company: form.company },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // If email confirmation is required, there's no session yet.
    if (!data.session) {
      setCheckInbox(true);
      return;
    }
    toast.success("Workspace created");
    navigate({ to: "/onboarding" });
  };

  const signUpWithGoogle = async () => {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/onboarding",
    });
    if (result.error) {
      setGoogleLoading(false);
      toast.error("Google sign-up failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/onboarding" });
  };

  if (checkInbox) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle={`We sent a confirmation link to ${form.email}. Click it to activate your workspace.`}
        footer={
          <Link to="/login" className="text-ink font-medium hover:underline underline-offset-4">
            Back to sign in
          </Link>
        }
      >
        <div className="rounded-lg border border-border bg-card p-5 flex items-start gap-3">
          <MailCheck className="size-5 text-emerald-600 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium text-ink">Confirmation email sent</div>
            <p className="text-muted-foreground mt-1">
              Didn't get it? Check spam, or wait a minute and try again.
            </p>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Start a free 14-day trial. No credit card required."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-ink font-medium hover:underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <button
        type="button"
        onClick={signUpWithGoogle}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-2.5 py-2.5 text-sm font-medium rounded-md border border-border bg-card hover:bg-muted transition disabled:opacity-60"
      >
        {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>
      <Divider>or sign up with email</Divider>

      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" error={errors.name}>
            <input
              value={form.name}
              onChange={update("name")}
              autoComplete="name"
              placeholder="Jane Doe"
              className="w-full px-3 py-2.5 text-sm rounded-md bg-card border border-border focus:border-ink/40 outline-none"
            />
          </Field>
          <Field label="Company" error={errors.company}>
            <input
              value={form.company}
              onChange={update("company")}
              autoComplete="organization"
              placeholder="Acme, Inc."
              className="w-full px-3 py-2.5 text-sm rounded-md bg-card border border-border focus:border-ink/40 outline-none"
            />
          </Field>
        </div>

        <Field label="Work email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={update("email")}
            autoComplete="email"
            placeholder="you@company.com"
            className="w-full px-3 py-2.5 text-sm rounded-md bg-card border border-border focus:border-ink/40 outline-none"
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={update("password")}
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
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i < score ? (score >= 3 ? "bg-emerald-500" : score >= 2 ? "bg-amber-500" : "bg-destructive") : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <div className="mt-1.5 text-[11px] text-muted-foreground">Password strength: {strengthLabel}</div>
            </div>
          )}
        </Field>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 rounded border-border"
          />
          <span>
            I agree to Node's{" "}
            <a href="#" className="text-ink underline-offset-4 hover:underline">Terms</a> and{" "}
            <a href="#" className="text-ink underline-offset-4 hover:underline">Privacy Policy</a>.
          </span>
        </label>
        {errors.terms && <div className="text-xs text-destructive -mt-2">{errors.terms}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-surface py-2.5 rounded-md text-sm font-medium hover:bg-ink/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Create workspace
        </button>

        <ul className="pt-2 space-y-2 text-xs text-muted-foreground">
          {["14-day free trial of Professional", "No credit card required", "Cancel anytime"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check className="size-3.5 text-ink" /> {t}
            </li>
          ))}
        </ul>
      </form>
    </AuthShell>
  );
}
