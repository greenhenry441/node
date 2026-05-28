import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { LaunchBanner } from "@/components/launch-banner";
import { GITHUB_URL } from "@/lib/links";

export function SiteHeader() {
  return (
    <>
    <LaunchBanner />
    <header className="w-full py-6 border-b border-border/60 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-5 bg-ink rounded-sm" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Node FMS</div>
            <div className="text-[10px] text-muted-foreground -mt-0.5">A division of Node</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
          <Link to="/features" activeProps={{ className: "text-ink" }} className="hover:text-ink transition-colors">Features</Link>
          <Link to="/pricing" activeProps={{ className: "text-ink" }} className="hover:text-ink transition-colors">Pricing</Link>
          <Link to="/download" activeProps={{ className: "text-ink" }} className="hover:text-ink transition-colors">Download</Link>
          <Link to="/security" activeProps={{ className: "text-ink" }} className="hover:text-ink transition-colors">Security</Link>
          <Link to="/about" activeProps={{ className: "text-ink" }} className="hover:text-ink transition-colors">About</Link>
          <Link to="/contact" activeProps={{ className: "text-ink" }} className="hover:text-ink transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Node FMS on GitHub"
            className="hidden sm:inline-flex size-9 items-center justify-center rounded-full border border-ink/10 hover:bg-ink/5 transition-colors"
          >
            <Github className="size-4" strokeWidth={1.75} />
          </a>
          <Link to="/login" className="hidden sm:inline-flex text-sm font-medium px-4 py-2 border border-ink/10 rounded-full hover:bg-ink/5 transition-colors">
            Sign in
          </Link>
          <Link to="/signup" className="bg-ink text-surface px-4 py-2 rounded-full text-sm font-medium hover:bg-ink/90 transition-colors">
            Get started
          </Link>
        </div>
      </div>
    </header>
    </>
  );
}
