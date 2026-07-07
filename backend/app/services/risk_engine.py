"""Position sizing and prop-firm drawdown tracking."""

from datetime import datetime

from app.models.account import Account
from app.models.trade import Trade
from app.schemas.risk import DrawdownStatus, PositionSizeResult, RiskStatus
from app.services.mock_market_data import pip_size


def calculate_position_size(entry: float, stop: float, risk_percent: float, account_balance: float, pair: str) -> PositionSizeResult:
    pip = pip_size(pair)
    stop_distance_pips = abs(entry - stop) / pip
    risk_amount = account_balance * risk_percent / 100

    if pair.upper() == "XAUUSD":
        pip_value_per_lot = 1.0
    elif "JPY" in pair.upper():
        pip_value_per_lot = 1000.0 / entry
    else:
        pip_value_per_lot = 10.0

    if stop_distance_pips <= 0:
        position_size_lots = 0.0
    else:
        position_size_lots = risk_amount / (stop_distance_pips * pip_value_per_lot)

    return PositionSizeResult(
        position_size_units=round(position_size_lots * 100_000, 2),
        position_size_lots=round(position_size_lots, 2),
        risk_amount=round(risk_amount, 2),
        stop_distance_pips=round(stop_distance_pips, 1),
        pip_value_per_lot=round(pip_value_per_lot, 4),
    )


def _period_status(period: str, pnl: float, balance: float, limit_pct: float) -> DrawdownStatus:
    limit_amount = balance * limit_pct / 100
    loss = abs(min(pnl, 0))
    used_pct = round((loss / limit_amount * 100) if limit_amount > 0 else 0, 1)
    return DrawdownStatus(
        period=period,
        pnl=round(pnl, 2),
        limit_pct=limit_pct,
        limit_amount=round(limit_amount, 2),
        used_pct=used_pct,
        breached=loss >= limit_amount and limit_amount > 0,
    )


def compute_risk_status(account: Account, trades: list[Trade]) -> RiskStatus:
    now = datetime.utcnow()
    iso_year, iso_week, _ = now.isocalendar()

    daily_pnl = weekly_pnl = monthly_pnl = 0.0
    for t in trades:
        if t.account_id != account.id:
            continue
        if t.trade_date.date() == now.date():
            daily_pnl += t.pnl
        t_year, t_week, _ = t.trade_date.isocalendar()
        if (t_year, t_week) == (iso_year, iso_week):
            weekly_pnl += t.pnl
        if t.trade_date.year == now.year and t.trade_date.month == now.month:
            monthly_pnl += t.pnl

    daily = _period_status("daily", daily_pnl, account.balance, account.max_daily_loss_pct)
    weekly = _period_status("weekly", weekly_pnl, account.balance, account.max_weekly_loss_pct)
    monthly = _period_status("monthly", monthly_pnl, account.balance, account.max_monthly_loss_pct)

    total_drawdown_pct = round(max(0.0, (account.starting_balance - account.balance) / account.starting_balance * 100), 2)

    alerts = []
    if daily.breached:
        alerts.append("Daily Loss Limit Reached — Stop Trading Warning")
    elif daily.used_pct >= 80:
        alerts.append("Approaching daily loss limit")
    if weekly.breached:
        alerts.append("Weekly Loss Limit Reached — Stop Trading Warning")
    elif weekly.used_pct >= 80:
        alerts.append("Approaching weekly loss limit")
    if monthly.breached:
        alerts.append("Monthly Loss Limit Reached — Stop Trading Warning")
    elif monthly.used_pct >= 80:
        alerts.append("Approaching monthly loss limit")
    if total_drawdown_pct >= account.max_total_drawdown_pct:
        alerts.append("Total drawdown limit breached — Stop Trading Warning")

    return RiskStatus(
        account_id=account.id,
        balance=account.balance,
        daily=daily,
        weekly=weekly,
        monthly=monthly,
        total_drawdown_pct=total_drawdown_pct,
        alerts=alerts,
    )
