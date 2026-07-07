export function StatCard({ label, value, valueClassName = "" }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="hud-panel hud-corners group relative overflow-hidden rounded-lg p-4">
      {/* accent edge */}
      <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-primary to-accent opacity-70 shadow-glow-primary" />
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold tabular-nums text-white ${valueClassName}`}>{value}</p>
    </div>
  );
}
