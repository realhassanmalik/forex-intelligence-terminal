import { Topbar } from "@/components/layout/Topbar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Table } from "@/components/ui/Table";
import { getCurrencyStrength, getEconomicCalendar, getNews } from "@/lib/api";

export default async function MarketIntelligencePage() {
  try {
    const [strength, events, news] = await Promise.all([getCurrencyStrength(), getEconomicCalendar(), getNews()]);

    return (
      <div>
        <Topbar title="Market Intelligence" subtitle="Currency strength, the economic calendar, and news sentiment" />
        <div className="space-y-6 p-8">
          <Card title="Currency Strength Ranking">
            <Table
              columns={[
                { header: "Rank", render: (e) => `#${e.rank}` },
                { header: "Currency", render: (e) => <span className="font-semibold">{e.currency}</span> },
                { header: "Score", render: (e) => e.score.toFixed(1) },
              ]}
              rows={strength.entries}
            />
          </Card>

          <Card title="Economic Calendar">
            <Table
              columns={[
                { header: "Event", render: (e) => e.title },
                { header: "Currency", render: (e) => e.currency },
                { header: "Impact", render: (e) => <Badge>{e.impact}</Badge> },
                { header: "Forecast", render: (e) => e.forecast ?? "—" },
                { header: "Previous", render: (e) => e.previous ?? "—" },
                { header: "Affected Pairs", render: (e) => e.affected_pairs.join(", ") },
                { header: "When", render: (e) => new Date(e.event_time).toLocaleString() },
              ]}
              rows={events}
              emptyMessage="No upcoming events."
            />
          </Card>

          <Card title="News Intelligence">
            <div className="space-y-3">
              {news.length === 0 && <p className="text-sm text-muted">No news yet.</p>}
              {news.map((item) => (
                <div key={item.id} className="rounded-lg border border-border/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{item.headline}</p>
                    <Badge>{item.sentiment}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {item.source} · {new Date(item.published_at).toLocaleString()} · {item.related_pairs.join(", ")}
                  </p>
                  {item.summary && <p className="mt-2 text-sm text-white/80">{item.summary}</p>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  } catch (err) {
    return (
      <div>
        <Topbar title="Market Intelligence" />
        <div className="p-8">
          <ErrorState message={err instanceof Error ? err.message : String(err)} />
        </div>
      </div>
    );
  }
}
