const TONE_CLASSES: Record<string, string> = {
  bullish: "bg-accent/10 text-accent border-accent/40 shadow-[0_0_8px_rgba(43,255,179,0.25)]",
  bearish: "bg-danger/10 text-danger border-danger/40 shadow-[0_0_8px_rgba(255,59,107,0.25)]",
  neutral: "bg-primary/10 text-primary border-primary/40 shadow-[0_0_8px_rgba(56,232,255,0.2)]",
  warning: "bg-warning/10 text-warning border-warning/40 shadow-[0_0_8px_rgba(255,194,71,0.2)]",
};

function toneFor(text: string): string {
  const lower = text.toLowerCase();
  if (["bullish", "win", "long", "accumulation", "high"].some((k) => lower.includes(k))) return "bullish";
  if (["bearish", "loss", "short", "distribution"].some((k) => lower.includes(k))) return "bearish";
  if (["manipulation", "medium", "breach"].some((k) => lower.includes(k))) return "warning";
  return "neutral";
}

export function Badge({ children, tone }: { children: string; tone?: "bullish" | "bearish" | "neutral" | "warning" }) {
  const resolved = tone ?? toneFor(children);
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${TONE_CLASSES[resolved]}`}
    >
      {children}
    </span>
  );
}
