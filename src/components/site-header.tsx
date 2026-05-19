import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="w-full py-6 border-b border-border/60">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-5 bg-ink rounded-sm" />
          <span className="text-sm font-semibold tracking-tight">Node</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link to="/features" activeProps={{ className: "text-ink" }} className="hover:text-ink transition-colors">Features</Link>
          <Link to="/pricing" activeProps={{ className: "text-ink" }} className="hover:text-ink transition-colors">Pricing</Link>
          <Link to="/security" activeProps={{ className: "text-ink" }} className="hover:text-ink transition-colors">Security</Link>
          <Link to="/app" activeProps={{ className: "text-ink" }} className="hover:text-ink transition-colors">Product</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/app" className="hidden sm:inline-flex text-sm font-medium px-4 py-2 border border-ink/10 rounded-full hover:bg-ink/5 transition-colors">
            Sign in
          </Link>
          <Link to="/app" className="bg-ink text-surface px-4 py-2 rounded-full text-sm font-medium hover:bg-ink/90 transition-colors">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
