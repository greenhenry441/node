import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface text-ink">
      <div className="flex flex-col px-6 py-8 lg:px-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-5 bg-ink rounded-sm" />
          <span className="text-sm font-semibold tracking-tight">Node</span>
        </Link>
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-sm mx-auto">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance">{title}</h1>
            <p className="mt-3 text-sm text-muted-foreground text-pretty">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 text-sm text-muted-foreground">{footer}</div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">© 2026 Node, Inc.</div>
      </div>

      <aside className="hidden lg:flex relative bg-ink text-surface p-12 flex-col justify-between overflow-hidden">
        <div className="text-xs font-semibold uppercase tracking-widest opacity-60">
          A single source of truth
        </div>
        <div className="space-y-6">
          <blockquote className="text-2xl font-medium leading-snug text-balance">
            "We moved our entire client archive into Node in an afternoon. Our team has never
            been less worried about a missing file."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-surface/15" />
            <div className="text-sm">
              <div className="font-semibold">Camille Okafor</div>
              <div className="opacity-60">Operations Lead, Northstar Studio</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-px bg-surface/10 rounded-xl overflow-hidden text-xs">
          {[
            ["99.99%", "Uptime"],
            ["SOC 2", "Type II"],
            ["180d", "History"],
          ].map(([k, v]) => (
            <div key={k} className="bg-ink p-4">
              <div className="font-semibold text-base">{k}</div>
              <div className="opacity-60">{v}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
