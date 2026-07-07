"use client";

import { useEffect, useState } from "react";

import { Topbar } from "@/components/layout/Topbar";
import { ScanControls } from "@/components/scanner/ScanControls";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Table } from "@/components/ui/Table";
import { scanLiquidity } from "@/lib/api";
import type { LiquidityMap } from "@/lib/types";

export default function LiquidityScannerPage() {
  const [pair, setPair] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [result, setResult] = useState<LiquidityMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    scanLiquidity(pair, timeframe)
      .then((data) => {
        if (!cancelled) setResult(data);
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
      <Topbar title="Liquidity Scanner" subtitle="Equal highs/lows, PDH/PDL, weekly levels, and sweeps" />
      <div className="space-y-6 p-8">
        <Card>
          <ScanControls pair={pair} timeframe={timeframe} onPairChange={setPair} onTimeframeChange={setTimeframe} />
        </Card>

        {error && <ErrorState message={error} />}

        {!error && (
          <Card title={`Liquidity Map · ${pair} · ${timeframe}`}>
            {loading || !result ? (
              <p className="text-sm text-muted">Scanning…</p>
            ) : (
              <Table
                columns={[
                  { header: "Level", render: (l) => l.kind },
                  { header: "Price", render: (l) => l.price },
                  { header: "Distance (pips)", render: (l) => l.distance_pips },
                  { header: "Status", render: (l) => <Badge tone={l.swept ? "warning" : "neutral"}>{l.swept ? "Swept" : "Unswept"}</Badge> },
                ]}
                rows={result.levels}
              />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
