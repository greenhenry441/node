import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { WebGLBackground } from "@/components/webgl-background";

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
          <img src="/node-logo.png" alt="Node" className="size-5" />
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

      <aside className="hidden lg:flex relative bg-[#06070d] text-white p-12 flex-col justify-between overflow-hidden">
        <WebGLBackground />
        <div className="absolute inset-0 bg-gradient-to-br from-[#06070d]/60 via-[#06070d]/30 to-[#06070d]/85 pointer-events-none" />
        <div className="relative z-10 text-[11px] font-mono uppercase tracking-[0.18em] text-white/70 inline-flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          NODE_FMS // a single source of truth
        </div>
        <div className="relative z-10 space-y-4 max-w-md">
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-balance">
            The file system your business actually deserves.
          </h2>
          <p className="text-white/70 text-pretty">
            Secure cloud storage, versioning, and client portals — purpose-built for
            small teams. Launching June 1, 2026.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden text-xs ring-1 ring-white/10">
          {[
            ["99.99%", "Uptime"],
            ["SOC 2", "Type II"],
            ["180d", "History"],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#06070d]/85 backdrop-blur p-4">
              <div className="font-semibold text-base">{k}</div>
              <div className="opacity-60">{v}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
