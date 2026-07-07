"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Table } from "@/components/ui/Table";
import { createTrade, listTrades, reviewTrade } from "@/lib/api";
import type { AIReview, Trade, TradeCreate } from "@/lib/types";
import { pnlColor } from "@/lib/utils";

const SESSIONS = ["Asia", "London", "New York", "Overlap"];
const AMD_PHASES = ["Accumulation", "Manipulation", "Distribution"];
const RESULTS = ["Open", "Win", "Loss", "Breakeven"];

const EMPTY_FORM: TradeCreate = {
  account_id: 1,
  trade_date: new Date().toISOString().slice(0, 16),
  pair: "EURUSD",
  session: "London",
  direction: "Long",
  setup: "",
  amd_phase: "Accumulation",
  entry: 0,
  stop: 0,
  target: 0,
  rr: 0,
  risk_percent: 1,
  result: "Open",
  pnl: 0,
  screenshot_url: "",
  emotion: "",
  notes: "",
};

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [form, setForm] = useState<TradeCreate>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<number | null>(null);
  const [activeReview, setActiveReview] = useState<AIReview | null>(null);

  const refresh = () => {
    setLoading(true);
    listTrades()
      .then(setTrades)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const update = <K extends keyof TradeCreate>(key: K, value: TradeCreate[K]) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    try {
      await createTrade({ ...form, trade_date: new Date(form.trade_date).toISOString() });
      setForm(EMPTY_FORM);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleReview = async (id: number) => {
    setReviewing(id);
    try {
      const review = await reviewTrade(id);
      setActiveReview(review);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div>
      <Topbar title="Trade Journal" subtitle="Log every trade and get an AI review" />
      <div className="space-y-6 p-8">
        <Card title="New Trade">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Field label="Date">
              <input
                type="datetime-local"
                value={form.trade_date}
                onChange={(e) => update("trade_date", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Pair">
              <input value={form.pair} onChange={(e) => update("pair", e.target.value.toUpperCase())} className={inputClass} />
            </Field>
            <Field label="Session">
              <select value={form.session} onChange={(e) => update("session", e.target.value)} className={inputClass}>
                {SESSIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Direction">
              <select value={form.direction} onChange={(e) => update("direction", e.target.value)} className={inputClass}>
                <option>Long</option>
                <option>Short</option>
              </select>
            </Field>
            <Field label="Setup">
              <input value={form.setup} onChange={(e) => update("setup", e.target.value)} className={inputClass} />
            </Field>
            <Field label="AMD Phase">
              <select value={form.amd_phase ?? ""} onChange={(e) => update("amd_phase", e.target.value)} className={inputClass}>
                {AMD_PHASES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Entry">
              <input type="number" step="any" value={form.entry} onChange={(e) => update("entry", Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Stop">
              <input type="number" step="any" value={form.stop} onChange={(e) => update("stop", Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Target">
              <input type="number" step="any" value={form.target} onChange={(e) => update("target", Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="RR">
              <input type="number" step="any" value={form.rr} onChange={(e) => update("rr", Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Result">
              <select value={form.result} onChange={(e) => update("result", e.target.value)} className={inputClass}>
                {RESULTS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="PnL">
              <input type="number" step="any" value={form.pnl} onChange={(e) => update("pnl", Number(e.target.value))} className={inputClass} />
            </Field>
            <Field label="Emotion">
              <input value={form.emotion ?? ""} onChange={(e) => update("emotion", e.target.value)} placeholder="Calm, fear, greed…" className={inputClass} />
            </Field>
            <Field label="Screenshot URL">
              <input value={form.screenshot_url ?? ""} onChange={(e) => update("screenshot_url", e.target.value)} className={inputClass} />
            </Field>
            <Field label="Notes" className="col-span-2 md:col-span-4">
              <textarea value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value)} rows={2} className={inputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Button onClick={handleSubmit}>Save Trade</Button>
          </div>
        </Card>

        {error && <ErrorState message={error} />}

        {!error && (
          <Card title="Journal">
            {loading ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : (
              <Table
                columns={[
                  { header: "Date", render: (t) => new Date(t.trade_date).toLocaleDateString() },
                  { header: "Pair", render: (t) => t.pair },
                  { header: "Session", render: (t) => t.session },
                  { header: "Direction", render: (t) => <Badge>{t.direction}</Badge> },
                  { header: "Setup", render: (t) => t.setup },
                  { header: "RR", render: (t) => t.rr.toFixed(2) },
                  { header: "Result", render: (t) => <Badge>{t.result}</Badge> },
                  { header: "PnL", render: (t) => <span className={pnlColor(t.pnl)}>{t.pnl.toFixed(2)}</span> },
                  {
                    header: "AI Score",
                    render: (t) => (t.ai_review_score != null ? <Badge tone="neutral">{`${t.ai_review_score}/100`}</Badge> : "—"),
                  },
                  {
                    header: "",
                    render: (t) => (
                      <Button variant="secondary" disabled={reviewing === t.id} onClick={() => handleReview(t.id)}>
                        {reviewing === t.id ? "Reviewing…" : "AI Review"}
                      </Button>
                    ),
                  },
                ]}
                rows={trades}
                emptyMessage="No trades logged yet."
              />
            )}
          </Card>
        )}

        {activeReview && (
          <Card title={`AI Trade Review — Trade #${activeReview.trade_id}`}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <Metric label="Entry Quality" value={activeReview.entry_quality} />
              <Metric label="Rule Compliance" value={activeReview.rule_compliance} />
              <Metric label="Risk Management" value={activeReview.risk_management} />
              <Metric label="Execution" value={activeReview.execution_quality} />
              <Metric label="Psychology" value={activeReview.psychology} />
            </div>
            <p className="mt-4 text-sm font-semibold text-white">Overall Score: {activeReview.overall_score}/100</p>
            <p className="mt-2 text-sm text-white/80">{activeReview.summary}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-border bg-surfaceAlt px-3 py-2 text-sm text-white";

function Field({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-xs uppercase tracking-wide text-muted ${className}`}>
      {label}
      {children}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surfaceAlt p-3 text-center">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
