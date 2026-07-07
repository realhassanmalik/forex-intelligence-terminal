"""Trade journal analytics and the personal edge finder."""

from collections import defaultdict

from app.models.trade import Trade
from app.schemas.analytics import AnalyticsSummary, EdgeFinderResult

CLOSED_RESULTS = {"Win", "Loss", "Breakeven"}


def _group_sum(trades: list[Trade], key_fn) -> dict[str, float]:
    totals: dict[str, float] = defaultdict(float)
    for t in trades:
        key = key_fn(t)
        if key:
            totals[key] += t.pnl
    return totals


def _best_key(totals: dict[str, float]) -> str | None:
    return max(totals, key=totals.get) if totals else None


def _worst_key(totals: dict[str, float]) -> str | None:
    return min(totals, key=totals.get) if totals else None


def _risk_bucket(risk_percent: float) -> str:
    if risk_percent <= 0.5:
        return "Conservative (<=0.5%)"
    if risk_percent <= 1.0:
        return "Standard (0.5-1%)"
    if risk_percent <= 2.0:
        return "Aggressive (1-2%)"
    return "High Risk (>2%)"


def compute_analytics_summary(trades: list[Trade]) -> AnalyticsSummary:
    closed = [t for t in trades if t.result in CLOSED_RESULTS]

    if not closed:
        return AnalyticsSummary(
            total_trades=0,
            win_rate=0.0,
            average_rr=0.0,
            profit_factor=0.0,
            expectancy=0.0,
            max_drawdown_pct=0.0,
        )

    wins = [t for t in closed if t.result == "Win"]
    losses = [t for t in closed if t.result == "Loss"]

    win_rate = round(len(wins) / len(closed) * 100, 1)
    average_rr = round(sum(t.rr for t in closed) / len(closed), 2)

    gross_profit = sum(t.pnl for t in closed if t.pnl > 0)
    gross_loss = abs(sum(t.pnl for t in closed if t.pnl < 0))
    profit_factor = round(gross_profit / gross_loss, 2) if gross_loss > 0 else round(gross_profit, 2)

    expectancy = round(sum(t.pnl for t in closed) / len(closed), 2)

    ordered = sorted(closed, key=lambda t: t.trade_date)
    equity = 0.0
    peak = 0.0
    max_dd = 0.0
    for t in ordered:
        equity += t.pnl
        peak = max(peak, equity)
        drawdown = peak - equity
        if peak > 0:
            max_dd = max(max_dd, drawdown / peak * 100)

    by_session = _group_sum(closed, lambda t: t.session)
    by_pair = _group_sum(closed, lambda t: t.pair)
    by_setup = _group_sum(closed, lambda t: t.setup)

    return AnalyticsSummary(
        total_trades=len(closed),
        win_rate=win_rate,
        average_rr=average_rr,
        profit_factor=profit_factor,
        expectancy=expectancy,
        max_drawdown_pct=round(max_dd, 2),
        best_session=_best_key(by_session),
        best_pair=_best_key(by_pair),
        worst_pair=_worst_key(by_pair),
        best_setup=_best_key(by_setup),
    )


def compute_edge_finder(trades: list[Trade]) -> EdgeFinderResult:
    closed = [t for t in trades if t.result in CLOSED_RESULTS]

    by_pair = _group_sum(closed, lambda t: t.pair)
    by_session = _group_sum(closed, lambda t: t.session)
    by_amd = _group_sum(closed, lambda t: t.amd_phase)
    by_risk_model = _group_sum(closed, lambda t: _risk_bucket(t.risk_percent))
    by_condition = _group_sum(closed, lambda t: f"{t.session} + {t.amd_phase}" if t.amd_phase else None)

    return EdgeFinderResult(
        most_profitable_pair=_best_key(by_pair),
        most_profitable_session=_best_key(by_session),
        best_amd_pattern=_best_key(by_amd),
        best_risk_model=_best_key(by_risk_model),
        best_market_condition=_best_key(by_condition),
        sample_size=len(closed),
    )
