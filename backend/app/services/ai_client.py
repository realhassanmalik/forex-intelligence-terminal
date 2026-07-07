"""Thin wrapper around Claude / OpenAI for the AI-driven modules.

Falls back to a deterministic, data-grounded mock whenever no API key is
configured (the default for this scaffold) or the provider call fails for
any reason — callers always get a well-shaped response.
"""

from app.core.config import get_settings

NEGATIVE_EMOTIONS = {"fear", "greed", "revenge", "fomo", "anger", "impatience"}


class AIClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    def _provider(self) -> str:
        if self.settings.ai_provider in ("claude", "openai"):
            return self.settings.ai_provider
        if self.settings.anthropic_api_key:
            return "claude"
        if self.settings.openai_api_key:
            return "openai"
        return "mock"

    # ---- Market analysis -------------------------------------------------

    def market_analysis(self, pair: str, timeframe: str, context: dict) -> dict:
        provider = self._provider()
        prompt = self._market_prompt(pair, timeframe, context)
        try:
            if provider == "claude":
                text = self._call_claude(prompt)
                return self._parse_market_text(text, pair, timeframe, "claude")
            if provider == "openai":
                text = self._call_openai(prompt)
                return self._parse_market_text(text, pair, timeframe, "openai")
        except Exception:
            pass
        return self._mock_market_analysis(pair, timeframe, context)

    def _market_prompt(self, pair: str, timeframe: str, context: dict) -> str:
        return (
            "Analyze market conditions using AMD, liquidity, market structure, currency strength and news.\n"
            f"Pair: {pair} Timeframe: {timeframe}\n"
            f"AMD: {context.get('amd')}\n"
            f"Liquidity: {context.get('liquidity')}\n"
            f"Structure: {context.get('structure')}\n"
            f"Currency Strength: {context.get('currency_strength')}\n"
            f"News: {context.get('news')}\n"
            "Return a market bias, trade ideas, risk factors, and targets."
        )

    def _mock_market_analysis(self, pair: str, timeframe: str, context: dict) -> dict:
        amd = context.get("amd", {})
        structure = context.get("structure", {})
        liquidity = context.get("liquidity", {})

        bias = structure.get("bias", "Neutral")
        phase = amd.get("phase", "Accumulation")
        target = amd.get("potential_target")
        liq_location = amd.get("liquidity_location", "nearby liquidity")

        return {
            "pair": pair.upper(),
            "timeframe": timeframe,
            "market_bias": f"{bias} bias — currently in the {phase} phase",
            "trade_ideas": [
                f"Watch for a reaction at {liq_location} to confirm the {phase.lower()} narrative",
                f"Structure shows a {structure.get('last_event', 'None')} on {timeframe}, aligning with a {bias.lower()} continuation" if bias != "Neutral" else "Structure is mixed — wait for a clean BOS or CHOCH before committing",
            ],
            "risk_factors": [
                "High-impact news on the calendar can invalidate the setup intraday",
                f"Confidence on the AMD read is {amd.get('confidence', 'moderate')}% — treat as a bias, not a certainty",
            ],
            "targets": [str(target)] if target is not None else [],
            "provider": "mock",
        }

    # ---- Trade review ------------------------------------------------

    def trade_review(self, trade: dict) -> dict:
        provider = self._provider()
        try:
            if provider in ("claude", "openai"):
                prompt = self._review_prompt(trade)
                text = self._call_claude(prompt) if provider == "claude" else self._call_openai(prompt)
                return self._parse_review_text(text, trade)
        except Exception:
            pass
        return self._mock_trade_review(trade)

    def _review_prompt(self, trade: dict) -> str:
        return (
            "Score this trade 0-100 on entry quality, rule compliance, risk management, "
            f"execution quality, and psychology: {trade}"
        )

    def _mock_trade_review(self, trade: dict) -> dict:
        rr = trade.get("rr", 0) or 0
        result = trade.get("result", "Open")
        emotion = (trade.get("emotion") or "").lower()
        notes = trade.get("notes") or ""

        entry_quality = 60 + min(rr * 8, 25)
        risk_management = 70 if 0.25 <= (trade.get("risk_percent", 1) or 1) <= 2 else 45
        execution_quality = 80 if result == "Win" else (50 if result == "Breakeven" else 40)
        psychology = 40 if emotion in NEGATIVE_EMOTIONS else 75
        rule_compliance = 80 if notes else 55

        scores = [entry_quality, rule_compliance, risk_management, execution_quality, psychology]
        overall = round(sum(scores) / len(scores))

        summary_bits = []
        if emotion in NEGATIVE_EMOTIONS:
            summary_bits.append(f"Emotional state '{trade.get('emotion')}' likely degraded execution — flag for psychology review.")
        if rr and rr < 1.5:
            summary_bits.append("Risk/reward below 1.5 — look for higher-quality entries with more room to target.")
        if not notes:
            summary_bits.append("No notes recorded — journaling context helps the edge finder learn from this trade.")
        if not summary_bits:
            summary_bits.append("Solid, well-documented trade with reasonable risk parameters.")

        return {
            "trade_id": trade.get("id"),
            "entry_quality": round(entry_quality),
            "rule_compliance": round(rule_compliance),
            "risk_management": round(risk_management),
            "execution_quality": round(execution_quality),
            "psychology": round(psychology),
            "overall_score": overall,
            "summary": " ".join(summary_bits),
        }

    # ---- Weekly CEO report ------------------------------------------------

    def weekly_report(self, week_start: str, week_end: str, trades: list[dict], summary: dict) -> dict:
        provider = self._provider()
        try:
            if provider in ("claude", "openai"):
                prompt = f"Generate a weekly trading CEO report from: {summary} trades={trades}"
                text = self._call_claude(prompt) if provider == "claude" else self._call_openai(prompt)
                return self._parse_weekly_text(text, week_start, week_end, trades, summary)
        except Exception:
            pass
        return self._mock_weekly_report(week_start, week_end, trades, summary)

    def _mock_weekly_report(self, week_start: str, week_end: str, trades: list[dict], summary: dict) -> dict:
        losses = [t for t in trades if t.get("result") == "Loss"]
        wins = [t for t in trades if t.get("result") == "Win"]
        negative_emotion_trades = [t for t in trades if (t.get("emotion") or "").lower() in NEGATIVE_EMOTIONS]

        mistakes = []
        if negative_emotion_trades:
            mistakes.append(f"{len(negative_emotion_trades)} trade(s) taken under negative emotional states")
        if any((t.get("rr") or 0) < 1 for t in losses):
            mistakes.append("Some losing trades had sub-1R planned reward — tighten setup selection")
        if not mistakes:
            mistakes.append("No major recurring mistakes identified this week")

        strengths = []
        if summary.get("best_setup"):
            strengths.append(f"Best performing setup: {summary['best_setup']}")
        if summary.get("best_pair"):
            strengths.append(f"Most profitable pair: {summary['best_pair']}")
        if not strengths:
            strengths.append("Not enough closed trades yet to identify a clear strength")

        weaknesses = []
        if summary.get("worst_pair"):
            weaknesses.append(f"Weakest pair: {summary['worst_pair']}")
        if summary.get("win_rate", 0) < 50 and trades:
            weaknesses.append("Win rate below 50% this week")
        if not weaknesses:
            weaknesses.append("No standout weakness this week")

        return {
            "week_start": week_start,
            "week_end": week_end,
            "trades_taken": len(trades),
            "win_rate": summary.get("win_rate", 0.0),
            "total_pnl": round(sum(t.get("pnl", 0) for t in trades), 2),
            "mistakes": mistakes,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "improvement_plan": [
                "Journal every trade with a screenshot and pre-trade emotion rating",
                "Only take setups matching the best-performing AMD pattern from the edge finder",
            ],
            "focus_next_week": [
                f"Double down on {summary['best_setup']}" if summary.get("best_setup") else "Build sample size before over-optimizing",
                "Avoid trading immediately after a loss to reduce revenge-trading risk",
            ],
        }

    # ---- Daily briefing (Dashboard) ------------------------------------------------

    def daily_briefing(self, context: dict) -> str:
        provider = self._provider()
        try:
            if provider in ("claude", "openai"):
                prompt = f"Write a 2-3 sentence daily trading briefing from: {context}"
                text = self._call_claude(prompt) if provider == "claude" else self._call_openai(prompt)
                return text[:600]
        except Exception:
            pass
        return self._mock_daily_briefing(context)

    def _mock_daily_briefing(self, context: dict) -> str:
        leader = context.get("strongest_currency")
        laggard = context.get("weakest_currency")
        top_event = context.get("top_event")
        alerts = context.get("risk_alerts") or []

        parts = []
        if leader and laggard:
            parts.append(f"{leader} is the strongest currency today while {laggard} lags, favoring {leader}/{laggard} pairs.")
        if top_event:
            parts.append(f"Watch {top_event} today — expect volatility around the release.")
        if alerts:
            parts.append(f"Risk note: {alerts[0]}.")
        if not parts:
            parts.append("Markets are calm with no major standout bias today — stick to your plan and wait for high-quality setups.")
        return " ".join(parts)

    # ---- Provider calls (real APIs) ------------------------------------------------

    def _call_claude(self, prompt: str) -> str:
        import anthropic

        client = anthropic.Anthropic(api_key=self.settings.anthropic_api_key)
        message = client.messages.create(
            model="claude-sonnet-5",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text

    def _call_openai(self, prompt: str) -> str:
        from openai import OpenAI

        client = OpenAI(api_key=self.settings.openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content

    # ---- Parsing real provider output (best-effort; falls back to mock shape upstream) ----

    def _parse_market_text(self, text: str, pair: str, timeframe: str, provider: str) -> dict:
        return {
            "pair": pair.upper(),
            "timeframe": timeframe,
            "market_bias": text[:200],
            "trade_ideas": [text],
            "risk_factors": [],
            "targets": [],
            "provider": provider,
        }

    def _parse_review_text(self, text: str, trade: dict) -> dict:
        base = self._mock_trade_review(trade)
        base["summary"] = text[:500]
        return base

    def _parse_weekly_text(self, text: str, week_start: str, week_end: str, trades: list[dict], summary: dict) -> dict:
        base = self._mock_weekly_report(week_start, week_end, trades, summary)
        base["improvement_plan"] = [text[:500]]
        return base


ai_client = AIClient()
