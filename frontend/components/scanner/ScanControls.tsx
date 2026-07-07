"use client";

const PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "NZDUSD", "USDCHF", "USDCAD", "XAUUSD"];
const TIMEFRAMES = ["M5", "M15", "M30", "H1", "H4", "D1"];

export function ScanControls({
  pair,
  timeframe,
  onPairChange,
  onTimeframeChange,
}: {
  pair: string;
  timeframe: string;
  onPairChange: (pair: string) => void;
  onTimeframeChange: (timeframe: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <label className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-primary/80">
        Pair
        <select
          value={pair}
          onChange={(e) => onPairChange(e.target.value)}
          className="rounded-md border border-primary/40 bg-surfaceAlt/70 px-3 py-2 font-mono text-sm text-white shadow-glow-primary/0 outline-none transition focus:border-primary focus:shadow-glow-primary"
        >
          {PAIRS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-primary/80">
        Timeframe
        <select
          value={timeframe}
          onChange={(e) => onTimeframeChange(e.target.value)}
          className="rounded-md border border-primary/40 bg-surfaceAlt/70 px-3 py-2 font-mono text-sm text-white outline-none transition focus:border-primary focus:shadow-glow-primary"
        >
          {TIMEFRAMES.map((tf) => (
            <option key={tf} value={tf}>
              {tf}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
