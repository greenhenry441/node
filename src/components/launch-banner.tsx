import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";

// June 1, 2026 at 9:23 AM (user's local time).
const LAUNCH = new Date(2026, 5, 1, 9, 23, 0).getTime();

function diff(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function LaunchBanner() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;
  const remaining = LAUNCH - now;
  const launched = remaining <= 0;
  const t = diff(remaining);

  return (
    <div className="w-full bg-ink text-surface">
      <div className="max-w-7xl mx-auto px-6 py-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs sm:text-sm">
        <span className="inline-flex items-center gap-2 font-medium">
          <Rocket className="size-3.5" strokeWidth={2} />
          {launched
            ? "Node FMS is live — welcome aboard."
            : "Node FMS launches June 1, 2026 at 9:23 AM"}
        </span>
        {!launched && (
          <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-surface/90">
            <Unit value={t.d} label="d" />
            <Sep />
            <Unit value={t.h} label="h" />
            <Sep />
            <Unit value={t.m} label="m" />
            <Sep />
            <Unit value={t.s} label="s" />
          </span>
        )}
      </div>
    </div>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <span>
      {String(value).padStart(2, "0")}
      <span className="opacity-60 ml-0.5">{label}</span>
    </span>
  );
}

function Sep() {
  return <span className="opacity-40">:</span>;
}
