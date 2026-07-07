"use client";

import { useEffect, useState } from "react";

import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/ui/StatCard";
import { getPositionSize, getRiskStatus } from "@/lib/api";
import type { DrawdownStatus, PositionSizeResult, RiskStatus } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function RiskCenterPage() {
  const [status, setStatus] = useState<RiskStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [pair, setPair] = useState("EURUSD");
  const [entry, setEntry] = useState(1.085);
  const [stop, setStop] = useState(1.08);
  const [riskPercent, setRiskPercent] = useState(1);
  const [sizeResult, setSizeResult] = useState<PositionSizeResult | null>(null);
  const [sizing, setSizing] = useState(false);

  useEffect(() => {
    getRiskStatus()
      .then(setStatus)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleCalculate = async () => {
    setSizing(true);
    try {
      const result = await getPositionSize({ account_id: 1, entry, stop, risk_percent: riskPercent, pair });
      setSizeResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSizing(false);
    }
  };

  return (
    <div>
      <Topbar title="Risk Center" subtitle="Position sizing, drawdown tracking, and prop firm limits" />
      <div className="space-y-6 p-8">
        <Card title="Position Size Calculator">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
              Pair
              <input value={pair} disabled className="rounded-lg border border-border bg-surfaceAlt px-3 py-2 text-sm text-white disabled:opacity-60" />
            </label>
            <NumberField label="Entry" value={entry} onChange={setEntry} />
            <NumberField label="Stop" value={stop} onChange={setStop} />
            <NumberField label="Risk %" value={riskPercent} onChange={setRiskPercent} />
            <div className="flex items-end">
              <Button onClick={handleCalculate} disabled={sizing}>
                {sizing ? "Calculating…" : "Calculate"}
              </Button>
            </div>
          </div>
          <div className="mt-3 flex gap-3">
            {["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"].map((p) => (
              <button
                key={p}
                onClick={() => setPair(p)}
                className={`rounded-full border px-3 py-1 text-xs ${pair === p ? "border-accent text-accent" : "border-border text-muted"}`}
              >
                {p}
              </button>
            ))}
          </div>
          {sizeResult && (
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Position Size (lots)" value={sizeResult.position_size_lots.toString()} />
              <StatCard label="Position Size (units)" value={sizeResult.position_size_units.toString()} />
              <StatCard label="Risk Amount" value={formatCurrency(sizeResult.risk_amount)} />
              <StatCard label="Stop Distance (pips)" value={sizeResult.stop_distance_pips.toString()} />
            </div>
          )}
        </Card>

        {error && <ErrorState message={error} />}

        {!error && (
          <Card title="Drawdown Status">
            {loading || !status ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <DrawdownCard status={status.daily} />
                  <DrawdownCard status={status.weekly} />
                  <DrawdownCard status={status.monthly} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <StatCard label="Account Balance" value={formatCurrency(status.balance)} />
                  <StatCard label="Total Drawdown" value={formatPercent(status.total_drawdown_pct)} />
                </div>
                {status.alerts.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {status.alerts.map((alert, i) => (
                      <div key={i} className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                        {alert}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

function DrawdownCard({ status }: { status: DrawdownStatus }) {
  return (
    <div className="rounded-xl border border-border bg-surfaceAlt p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted">{status.period}</p>
        {status.breached && <Badge tone="bearish">Limit Reached</Badge>}
      </div>
      <p className="mt-2 text-lg font-semibold text-white">{formatPercent(status.used_pct)} of limit used</p>
      <p className="text-xs text-muted">
        PnL {status.pnl.toFixed(2)} · Limit {formatCurrency(status.limit_amount)} ({status.limit_pct}%)
      </p>
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
      {label}
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-border bg-surfaceAlt px-3 py-2 text-sm text-white"
      />
    </label>
  );
}
