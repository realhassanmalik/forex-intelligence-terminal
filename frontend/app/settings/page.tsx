"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { getAccount, updateAccount } from "@/lib/api";
import type { Account } from "@/lib/types";

export default function SettingsPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAccount()
      .then(setAccount)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  const update = <K extends keyof Account>(key: K, value: Account[K]) =>
    setAccount((a) => (a ? { ...a, [key]: value } : a));

  const handleSave = async () => {
    if (!account) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateAccount(account.id, account);
      setAccount(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Topbar title="Settings" subtitle="Account and risk configuration" />
      <div className="space-y-6 p-8">
        {error && <ErrorState message={error} />}

        {!error && !account && <p className="text-sm text-muted">Loading…</p>}

        {account && (
          <Card title="Account">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <Field label="Account Name">
                <input value={account.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Broker / Prop Firm">
                <input value={account.broker ?? ""} onChange={(e) => update("broker", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Is Prop Firm Account">
                <select
                  value={account.is_prop_firm ? "yes" : "no"}
                  onChange={(e) => update("is_prop_firm", e.target.value === "yes")}
                  className={inputClass}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </Field>
              <Field label="Balance">
                <input type="number" step="any" value={account.balance} onChange={(e) => update("balance", Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Default Risk Per Trade (%)">
                <input
                  type="number"
                  step="any"
                  value={account.default_risk_per_trade_pct}
                  onChange={(e) => update("default_risk_per_trade_pct", Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
              <Field label="Max Daily Loss (%)">
                <input type="number" step="any" value={account.max_daily_loss_pct} onChange={(e) => update("max_daily_loss_pct", Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Max Weekly Loss (%)">
                <input type="number" step="any" value={account.max_weekly_loss_pct} onChange={(e) => update("max_weekly_loss_pct", Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Max Monthly Loss (%)">
                <input type="number" step="any" value={account.max_monthly_loss_pct} onChange={(e) => update("max_monthly_loss_pct", Number(e.target.value))} className={inputClass} />
              </Field>
              <Field label="Max Total Drawdown (%)">
                <input
                  type="number"
                  step="any"
                  value={account.max_total_drawdown_pct}
                  onChange={(e) => update("max_total_drawdown_pct", Number(e.target.value))}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
              {saved && <span className="text-sm text-accent">Saved.</span>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-border bg-surfaceAlt px-3 py-2 text-sm text-white";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
      {label}
      {children}
    </label>
  );
}
