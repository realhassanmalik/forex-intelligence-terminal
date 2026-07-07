"use client";

import { useEffect, useState } from "react";

import { Topbar } from "@/components/layout/Topbar";
import { ScanControls } from "@/components/scanner/ScanControls";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/ui/StatCard";
import { getMarketStructure, scanAMD } from "@/lib/api";
import type { AMDScanResult, MarketStructureResult } from "@/lib/types";

export default function AMDScannerPage() {
  const [pair, setPair] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [result, setResult] = useState<AMDScanResult | null>(null);
  const [structure, setStructure] = useState<MarketStructureResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([scanAMD(pair, timeframe), getMarketStructure(pair, timeframe)])
      .then(([amd, struct]) => {
        if (!cancelled) {
          setResult(amd);
          setStructure(struct);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pair, timeframe]);

  return (
    <div>
      <Topbar title="AMD Scanner" subtitle="Accumulation, Manipulation, Distribution phase detection" />
      <div className="space-y-6 p-8">
        <Card>
          <ScanControls pair={pair} timeframe={timeframe} onPairChange={setPair} onTimeframeChange={setTimeframe} />
        </Card>

        {error && <ErrorState message={error} />}

        {!error && (
          <Card title={`${pair} · ${timeframe}`}>
            {loading || !result ? (
              <p className="text-sm text-muted">Scanning…</p>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-xl border border-border bg-surfaceAlt p-4">
                    <p className="text-xs uppercase tracking-wide text-muted">AMD Phase</p>
                    <div className="mt-2">
                      <Badge>{result.phase}</Badge>
                    </div>
                  </div>
                  <StatCard label="Confidence" value={`${result.confidence}%`} />
                  <StatCard label="Potential Target" value={result.potential_target.toString()} />
                  <StatCard label="Liquidity Location" value={result.liquidity_location} />
                </div>
                <p className="text-sm text-white/80">{result.notes}</p>
              </div>
            )}
          </Card>
        )}

        {!error && structure && (
          <Card title="Market Structure">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-surfaceAlt p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Bias</p>
                <div className="mt-2">
                  <Badge>{structure.bias}</Badge>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surfaceAlt p-4">
                <p className="text-xs uppercase tracking-wide text-muted">Last Event</p>
                <div className="mt-2">
                  <Badge tone={structure.last_event === "None" ? "neutral" : "warning"}>{structure.last_event}</Badge>
                </div>
              </div>
              <StatCard label="Swing Points Tracked" value={structure.points.length.toString()} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {structure.points.map((p, i) => (
                <Badge key={i} tone={p.kind === "HH" || p.kind === "HL" ? "bullish" : "bearish"}>
                  {`${p.kind} @ ${p.price}`}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
