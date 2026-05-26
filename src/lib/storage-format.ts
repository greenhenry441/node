export function formatBytes(n: number | null): string {
  if (n === null) return "Unlimited";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 2 : v < 100 ? 1 : 0)} ${units[i]}`;
}

export const PLAN_LABEL: Record<"free" | "starter" | "steady" | "suite", string> = {
  free: "Free",
  starter: "Starter",
  steady: "Steady",
  suite: "Node Suite",
};
