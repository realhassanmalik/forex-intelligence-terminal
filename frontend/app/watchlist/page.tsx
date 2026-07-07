"use client";

import { useEffect, useState } from "react";

import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Table } from "@/components/ui/Table";
import { addWatchlistItem, listWatchlist, removeWatchlistItem } from "@/lib/api";
import type { WatchlistItem } from "@/lib/types";

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [pair, setPair] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    listWatchlist()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const handleAdd = async () => {
    if (!pair.trim()) return;
    try {
      await addWatchlistItem(pair.trim().toUpperCase(), notes.trim() || undefined);
      setPair("");
      setNotes("");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await removeWatchlistItem(id);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div>
      <Topbar title="Watchlist" subtitle="Pairs you're tracking" />
      <div className="space-y-6 p-8">
        <Card title="Add Pair">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted">
              Pair
              <input
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                placeholder="EURUSD"
                className="rounded-lg border border-border bg-surfaceAlt px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs uppercase tracking-wide text-muted">
              Notes
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why are you watching this pair?"
                className="rounded-lg border border-border bg-surfaceAlt px-3 py-2 text-sm text-white"
              />
            </label>
            <Button onClick={handleAdd}>Add to Watchlist</Button>
          </div>
        </Card>

        {error && <ErrorState message={error} />}

        {!error && (
          <Card title="Tracked Pairs">
            {loading ? (
              <p className="text-sm text-muted">Loading…</p>
            ) : (
              <Table
                columns={[
                  { header: "Pair", render: (w) => <span className="font-semibold">{w.pair}</span> },
                  { header: "Notes", render: (w) => <span className="text-muted">{w.notes ?? "—"}</span> },
                  { header: "Added", render: (w) => new Date(w.added_at).toLocaleDateString() },
                  {
                    header: "",
                    render: (w) => (
                      <Button variant="danger" onClick={() => handleRemove(w.id)}>
                        Remove
                      </Button>
                    ),
                  },
                ]}
                rows={items}
                emptyMessage="Your watchlist is empty."
              />
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
