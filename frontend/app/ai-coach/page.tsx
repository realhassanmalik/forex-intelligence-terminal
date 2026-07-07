"use client";

import { useEffect, useState } from "react";

import { Topbar } from "@/components/layout/Topbar";
import { ScanControls } from "@/components/scanner/ScanControls";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { getMarketAnalysis, getWeeklyReport } from "@/lib/api";
import type { AIMarketAnalysisResult, WeeklyReport } from "@/lib/types";

export default function AICoachPage() {
  const [pair, setPair] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [analysis, setAnalysis] = useState<AIMarketAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      setAnalysis(await getMarketAnalysis(pair, timeframe));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    runAnalysis();
    getWeeklyReport()
      .then(setReport)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Topbar title="AI Coach" subtitle="AI market analyst and your weekly CEO report" />
      <div className="space-y-6 p-8">
        <Card title="AI Market Analyst">
          <div className="flex flex-wrap items-end gap-3">
            <ScanControls pair={pair} timeframe={timeframe} onPairChange={setPair} onTimeframeChange={setTimeframe} />
            <Button onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? "Analyzing…" : "Run Analysis"}
            </Button>
          </div>

          {error && (
            <div className="mt-4">
              <ErrorState message={error} />
            </div>
          )}

          {analysis && !error && (
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-2">
                <Badge>{analysis.market_bias}</Badge>
                <span className="text-xs text-muted">via {analysis.provider}</span>
              </div>
              <Section title="Trade Ideas" items={analysis.trade_ideas} />
              <Section title="Risk Factors" items={analysis.risk_factors} />
              <Section title="Targets" items={analysis.targets} />
            </div>
          )}
        </Card>

        {report && (
          <Card title={`Weekly CEO Report — ${report.week_start} to ${report.week_end}`}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Stat label="Trades Taken" value={report.trades_taken.toString()} />
              <Stat label="Win Rate" value={`${report.win_rate}%`} />
              <Stat label="Total PnL" value={report.total_pnl.toFixed(2)} />
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Section title="Strengths" items={report.strengths} />
              <Section title="Weaknesses" items={report.weaknesses} />
              <Section title="Mistakes" items={report.mistakes} />
              <Section title="Improvement Plan" items={report.improvement_plan} />
            </div>
            <div className="mt-4">
              <Section title="Focus For Next Week" items={report.focus_next_week} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/85">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surfaceAlt p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
