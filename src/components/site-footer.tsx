import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { GITHUB_URL } from "@/lib/links";

export function SiteFooter() {
  return (
    <footer className="py-12 border-t border-border/60 mt-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-4 bg-ink rounded-sm" />
          <span className="text-sm font-semibold tracking-tight">Node File Management Suite</span>
        </Link>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
          <Link to="/features" className="hover:text-ink">Features</Link>
          <Link to="/pricing" className="hover:text-ink">Pricing</Link>
          <Link to="/download" className="hover:text-ink">Download</Link>
          <Link to="/editor" className="hover:text-ink">Editor</Link>
          <Link to="/about" className="hover:text-ink">About</Link>
          <Link to="/contact" className="hover:text-ink">Contact</Link>
          <Link to="/status" className="hover:text-ink">Status</Link>
          <Link to="/changelog" className="hover:text-ink">Changelog</Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-ink inline-flex items-center gap-1">
            <Github className="size-3" /> GitHub
          </a>
        </div>
        <span className="text-xs text-muted-foreground">© 2026 Node FMS — a division of Node, Inc.</span>
      </div>
    </footer>
  );
}
