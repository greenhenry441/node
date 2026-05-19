import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="py-12 border-t border-border/60 mt-24">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-4 bg-ink rounded-sm" />
          <span className="text-sm font-semibold tracking-tight">Node File Management Suite</span>
        </Link>
        <div className="flex gap-8 text-xs font-medium text-muted-foreground">
          <Link to="/security" className="hover:text-ink">Security</Link>
          <Link to="/pricing" className="hover:text-ink">Pricing</Link>
          <a href="#" className="hover:text-ink">Privacy</a>
          <a href="#" className="hover:text-ink">Status</a>
        </div>
        <span className="text-xs text-muted-foreground">© 2026 Node FMS — a division of Node, Inc.</span>
      </div>
    </footer>
  );
}
