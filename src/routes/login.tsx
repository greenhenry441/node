import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/auth-shell";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Node" },
      { name: "description", content: "Sign in to your Node workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      const f = result.error.flatten().fieldErrors;
      setErrors({ email: f.email?.[0], password: f.password?.[0] });
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate({ to: "/app" });
    }, 600);
  };

  return (
    <AuthShell
      title="Sign in to Node"
      subtitle="Welcome back. Enter your details to access your workspace."
      footer={
        <>
          New to Node?{" "}
          <Link to="/signup" className="text-ink font-medium hover:underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <div className="space-y-3">
        <SocialButton provider="Google" />
        <SocialButton provider="Microsoft" />
      </div>
      <Divider>or continue with email</Divider>

      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Work email" error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full px-3 py-2.5 text-sm rounded-md bg-card border border-border focus:border-ink/40 outline-none"
          />
        </Field>
        <Field
          label="Password"
          error={errors.password}
          right={
            <Link to="/forgot-password" className="text-xs font-medium text-muted-foreground hover:text-ink">
              Forgot?
            </Link>
          }
        >
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="rounded border-border" defaultChecked />
          Keep me signed in for 30 days
        </label>

        {errors.form && <div className="text-xs text-destructive">{errors.form}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-surface py-2.5 rounded-md text-sm font-medium hover:bg-ink/90 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Sign in
        </button>
      </form>
    </AuthShell>
  );
}

export function Field({
  label,
  error,
  right,
  children,
}: {
  label: string;
  error?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-ink">{label}</label>
        {right}
      </div>
      {children}
      {error && <div className="mt-1.5 text-xs text-destructive">{error}</div>}
    </div>
  );
}

export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 my-6 text-[11px] uppercase tracking-widest text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      {children}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function SocialButton({ provider }: { provider: "Google" | "Microsoft" | "Apple" }) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-2.5 py-2.5 text-sm font-medium rounded-md border border-border bg-card hover:bg-muted transition"
    >
      <span className="size-4 rounded-sm bg-ink/80" />
      Continue with {provider}
    </button>
  );
}
