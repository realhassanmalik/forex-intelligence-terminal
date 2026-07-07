import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { StatCard } from "@/components/ui/StatCard";
import { getAnalyticsSummary, getEdgeFinder } from "@/lib/api";
import { formatPercent } from "@/lib/utils";

export default async function AnalyticsPage() {
  try {
    const [summary, edge] = await Promise.all([getAnalyticsSummary(), getEdgeFinder()]);

    return (
      <div>
        <Topbar title="Analytics" subtitle="Performance stats and your personal trading edge" />
        <div className="space-y-6 p-8">
          <Card title="Performance Summary">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <StatCard label="Total Trades" value={summary.total_trades.toString()} />
              <StatCard label="Win Rate" value={formatPercent(summary.win_rate)} />
              <StatCard label="Average RR" value={summary.average_rr.toFixed(2)} />
              <StatCard label="Profit Factor" value={summary.profit_factor.toFixed(2)} />
              <StatCard label="Expectancy" value={summary.expectancy.toFixed(2)} />
              <StatCard label="Max Drawdown" value={formatPercent(summary.max_drawdown_pct)} />
              <StatCard label="Best Session" value={summary.best_session ?? "—"} />
              <StatCard label="Best Pair" value={summary.best_pair ?? "—"} />
              <StatCard label="Worst Pair" value={summary.worst_pair ?? "—"} />
              <StatCard label="Best Setup" value={summary.best_setup ?? "—"} />
            </div>
          </Card>

          <Card title="Personal Edge Finder" action={<span className="text-xs text-muted">Based on {edge.sample_size} closed trades</span>}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <StatCard label="Most Profitable Pair" value={edge.most_profitable_pair ?? "—"} />
              <StatCard label="Most Profitable Session" value={edge.most_profitable_session ?? "—"} />
              <StatCard label="Best AMD Pattern" value={edge.best_amd_pattern ?? "—"} />
              <StatCard label="Best Risk Model" value={edge.best_risk_model ?? "—"} />
              <StatCard label="Best Market Condition" value={edge.best_market_condition ?? "—"} />
            </div>
          </Card>
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div>
        <Topbar title="Analytics" />
        <div className="p-8">
          <ErrorState message={err instanceof Error ? err.message : String(err)} />
        </div>
      </div>
    );
  }
}
