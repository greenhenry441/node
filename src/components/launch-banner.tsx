import { Link } from "@tanstack/react-router";
import { Download, ArrowRight } from "lucide-react";

export function LaunchBanner() {
  return (
    <div className="w-full bg-ink text-surface">
      <Link
        to="/download"
        className="block group"
      >
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-2 font-medium">
            <Download className="size-3.5" strokeWidth={2} />
            Node FMS desktop apps are here — Mac, Windows, and Linux
          </span>
          <span className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 group-hover:gap-1.5 transition-all">
            Download <ArrowRight className="size-3.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}
