import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { LaunchBanner } from "@/components/launch-banner";
import { GITHUB_URL } from "@/lib/links";

export function SiteHeader({ theme = "light" }: { theme?: "light" | "dark" } = {}) {
  const isDark = theme === "dark";
  const navIdle = isDark ? "text-white/70" : "text-muted-foreground";
  const navHover = isDark ? "hover:text-white" : "hover:text-ink";
  const activeCls = isDark ? "text-white" : "text-ink";
  const iconBorder = isDark ? "border-white/15 hover:bg-white/10" : "border-ink/10 hover:bg-ink/5";
  const signInCls = isDark
    ? "border-white/20 text-white hover:bg-white/10"
    : "border-ink/10 hover:bg-ink/5";
  const ctaCls = isDark
    ? "bg-white text-[#06070d] hover:bg-white/90"
    : "bg-ink text-surface hover:bg-ink/90";
  const titleCls = isDark ? "text-white" : "";
  const subCls = isDark ? "text-white/50" : "text-muted-foreground";
  return (
    <>
    <LaunchBanner />
    <header className="w-full py-6 relative z-10">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/node-dot-logo.png" alt="Node" className="size-5" />
          <div className="leading-tight">
            <div className={`text-sm font-semibold tracking-tight ${titleCls}`}>Node</div>
            <div className={`text-[10px] -mt-0.5 ${subCls}`}>Files · Tasks · Calendar</div>
          </div>
        </Link>
        <nav className={`hidden md:flex items-center gap-7 text-sm font-medium ${navIdle}`}>
          <Link to="/features" activeProps={{ className: activeCls }} className={`${navHover} transition-colors`}>Products</Link>
          <Link to="/pricing" activeProps={{ className: activeCls }} className={`${navHover} transition-colors`}>Pricing</Link>
          <Link to="/download" activeProps={{ className: activeCls }} className={`${navHover} transition-colors`}>Download</Link>
          <Link to="/docs" activeProps={{ className: activeCls }} className={`${navHover} transition-colors`}>Docs</Link>
          <Link to="/forum" activeProps={{ className: activeCls }} className={`${navHover} transition-colors`}>Forum</Link>
          <Link to="/about" activeProps={{ className: activeCls }} className={`${navHover} transition-colors`}>About</Link>
          <Link to="/contact" activeProps={{ className: activeCls }} className={`${navHover} transition-colors`}>Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Node on GitHub"
            className={`hidden sm:inline-flex size-9 items-center justify-center rounded-full border transition-colors ${iconBorder} ${isDark ? "text-white" : ""}`}
          >
            <Github className="size-4" strokeWidth={1.75} />
          </a>
          <Link to="/login" className={`hidden sm:inline-flex text-sm font-medium px-4 py-2 border rounded-full transition-colors ${signInCls}`}>
            Sign in
          </Link>
          <Link to="/signup" className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${ctaCls}`}>
            Get started
          </Link>
        </div>
      </div>
    </header>
    </>
  );
}
