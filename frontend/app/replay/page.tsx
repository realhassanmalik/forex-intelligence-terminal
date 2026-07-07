"use client";

import { useEffect, useState } from "react";

import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { createReplay, listReplays } from "@/lib/api";
import type { ReplaySession } from "@/lib/types";

const EMPTY_FORM = {
  pair: "EURUSD",
  setup: "",
  chart_screenshot_url: "",
  entry_screenshot_url: "",
  exit_screenshot_url: "",
  notes: "",
  trade_id: null as number | null,
};

export default function ReplayPage() {
  const [sessions, setSessions] = useState<ReplaySession[]>([]);
  const [pairFilter, setPairFilter] = useState("");
  const [setupFilter, setSetupFilter] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    listReplays({ pair: pairFilter || undefined, setup: setupFilter || undefined })
      .then(setSessions)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, [pairFilter, setupFilter]);

  const handleSave = async () => {
    if (!form.setup.trim()) return;
    try {
      await createReplay(form);
      setForm(EMPTY_FORM);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div>
      <Topbar title="Replay" subtitle="Archive and search past trade setups" />
      <div className="space-y-6 p-8">
        <Card title="Archive a Setup">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Input label="Pair" value={form.pair} onChange={(v) => setForm((f) => ({ ...f, pair: v.toUpperCase() }))} />
            <Input label="Setup" value={form.setup} onChange={(v) => setForm((f) => ({ ...f, setup: v }))} />
            <Input
              label="Chart Screenshot URL"
              value={form.chart_screenshot_url}
              onChange={(v) => setForm((f) => ({ ...f, chart_screenshot_url: v }))}
            />
            <Input
              label="Entry Screenshot URL"
              value={form.entry_screenshot_url}
              onChange={(v) => setForm((f) => ({ ...f, entry_screenshot_url: v }))}
            />
            <Input
              label="Exit Screenshot URL"
              value={form.exit_screenshot_url}
              onChange={(v) => setForm((f) => ({ ...f, exit_screenshot_url: v }))}
            />
            <Input label="Notes" className="col-span-2" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} />
          </div>
          <div className="mt-4">
            <Button onClick={handleSave}>Save to Replay</Button>
          </div>
        </Card>

        <Card title="Pattern Search">
          <div className="flex flex-wrap gap-3">
            <Input label="Filter by Pair" value={pairFilter} onChange={setPairFilter} />
            <Input label="Filter by Setup" value={setupFilter} onChange={setSetupFilter} />
          </div>
        </Card>

        {error && <ErrorState message={error} />}

        {!error && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading && <p className="text-sm text-muted">Loading…</p>}
            {!loading && sessions.length === 0 && <p className="text-sm text-muted">No archived setups yet.</p>}
            {sessions.map((s) => (
              <Card key={s.id} title={`${s.pair} — ${s.setup}`}>
                <p className="text-xs text-muted">{new Date(s.created_at).toLocaleString()}</p>
                {s.notes && <p className="mt-2 text-sm text-white/80">{s.notes}</p>}
                <div className="mt-3 space-y-1 text-xs text-muted">
                  {s.chart_screenshot_url && <p>Chart: {s.chart_screenshot_url}</p>}
                  {s.entry_screenshot_url && <p>Entry: {s.entry_screenshot_url}</p>}
                  {s.exit_screenshot_url && <p>Exit: {s.exit_screenshot_url}</p>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-xs uppercase tracking-wide text-muted ${className}`}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surfaceAlt px-3 py-2 text-sm text-white"
      />
    </label>
  );
}
