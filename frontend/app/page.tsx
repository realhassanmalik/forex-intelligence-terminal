import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/ui/StatCard";
import { Table } from "@/components/ui/Table";
import { getDashboard } from "@/lib/api";
import { formatCurrency, pnlColor } from "@/lib/utils";

export default async function DashboardPage() {
  try {
    const data = await getDashboard();

    return (
      <div>
        <Topbar title="Dashboard" subtitle="Your trading day at a glance" />
        <div className="space-y-6 p-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Account Balance" value={formatCurrency(data.account_balance)} />
            <StatCard label="Daily PnL" value={formatCurrency(data.daily_pnl)} valueClassName={pnlColor(data.daily_pnl)} />
            <StatCard label="Weekly PnL" value={formatCurrency(data.weekly_pnl)} valueClassName={pnlColor(data.weekly_pnl)} />
            <StatCard label="Monthly PnL" value={formatCurrency(data.monthly_pnl)} valueClassName={pnlColor(data.monthly_pnl)} />
          </div>

          <Card title="Daily AI Briefing">
            <p className="text-sm leading-relaxed text-white/90">{data.ai_briefing}</p>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Open Trades">
              <Table
                columns={[
                  { header: "Pair", render: (t) => t.pair },
                  { header: "Direction", render: (t) => <Badge>{t.direction}</Badge> },
                  { header: "Entry", render: (t) => t.entry },
                  { header: "Stop", render: (t) => t.stop },
                  { header: "Target", render: (t) => t.target },
                  { header: "RR", render: (t) => t.rr.toFixed(2) },
                ]}
                rows={data.open_trades}
                emptyMessage="No open trades right now."
              />
            </Card>

            <Card title="Top Currency Strength">
              <Table
                columns={[
                  { header: "Rank", render: (e) => `#${e.rank}` },
                  { header: "Currency", render: (e) => e.currency },
                  { header: "Score", render: (e) => e.score.toFixed(1) },
                ]}
                rows={data.currency_strength.slice(0, 5)}
              />
            </Card>

            <Card title="Upcoming News">
              <Table
                columns={[
                  { header: "Event", render: (e) => e.title },
                  { header: "Currency", render: (e) => e.currency },
                  { header: "Impact", render: (e) => <Badge>{e.impact}</Badge> },
                  { header: "When", render: (e) => new Date(e.event_time).toLocaleString() },
                ]}
                rows={data.upcoming_news}
                emptyMessage="Nothing on the calendar in the next 7 days."
              />
            </Card>

            <Card title="Watchlist">
              <Table
                columns={[
                  { header: "Pair", render: (w) => w.pair },
                  { header: "Notes", render: (w) => <span className="text-muted">{w.notes ?? "—"}</span> },
                ]}
                rows={data.watchlist}
                emptyMessage="Your watchlist is empty."
              />
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div>
        <Topbar title="Dashboard" />
        <div className="p-8">
          <ErrorState message={err instanceof Error ? err.message : String(err)} />
        </div>
      </div>
    );
  }
}
