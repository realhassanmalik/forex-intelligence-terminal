export interface Trade {
  id: number;
  account_id: number;
  trade_date: string;
  pair: string;
  session: string;
  direction: string;
  setup: string;
  amd_phase: string | null;
  entry: number;
  stop: number;
  target: number;
  rr: number;
  risk_percent: number;
  result: string;
  pnl: number;
  screenshot_url: string | null;
  emotion: string | null;
  notes: string | null;
  ai_review_score: number | null;
  ai_review_summary: string | null;
  created_at: string;
}

export type TradeCreate = Omit<Trade, "id" | "ai_review_score" | "ai_review_summary" | "created_at">;

export interface WatchlistItem {
  id: number;
  pair: string;
  notes: string | null;
  added_at: string;
}

export interface EconomicEvent {
  id: number;
  title: string;
  currency: string;
  impact: string;
  event_time: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  affected_pairs: string[];
}

export interface NewsItem {
  id: number;
  headline: string;
  source: string;
  summary: string | null;
  sentiment: string;
  related_pairs: string[];
  published_at: string;
}

export interface AMDScanResult {
  pair: string;
  timeframe: string;
  phase: string;
  confidence: number;
  potential_target: number;
  liquidity_location: string;
  notes: string;
}

export interface LiquidityLevel {
  kind: string;
  price: number;
  swept: boolean;
  distance_pips: number;
}

export interface LiquidityMap {
  pair: string;
  timeframe: string;
  levels: LiquidityLevel[];
}

export interface StructurePoint {
  kind: string;
  price: number;
  label: string | null;
}

export interface MarketStructureResult {
  pair: string;
  timeframe: string;
  bias: string;
  last_event: string;
  points: StructurePoint[];
}

export interface CurrencyStrengthEntry {
  currency: string;
  score: number;
  rank: number;
}

export interface CurrencyStrengthResult {
  entries: CurrencyStrengthEntry[];
  computed_at: string;
}

export interface AIMarketAnalysisResult {
  pair: string;
  timeframe: string;
  market_bias: string;
  trade_ideas: string[];
  risk_factors: string[];
  targets: string[];
  provider: string;
}

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  trades_taken: number;
  win_rate: number;
  total_pnl: number;
  mistakes: string[];
  strengths: string[];
  weaknesses: string[];
  improvement_plan: string[];
  focus_next_week: string[];
}

export interface PositionSizeResult {
  position_size_units: number;
  position_size_lots: number;
  risk_amount: number;
  stop_distance_pips: number;
  pip_value_per_lot: number;
}

export interface DrawdownStatus {
  period: string;
  pnl: number;
  limit_pct: number;
  limit_amount: number;
  used_pct: number;
  breached: boolean;
}

export interface RiskStatus {
  account_id: number;
  balance: number;
  daily: DrawdownStatus;
  weekly: DrawdownStatus;
  monthly: DrawdownStatus;
  total_drawdown_pct: number;
  alerts: string[];
}

export interface AnalyticsSummary {
  total_trades: number;
  win_rate: number;
  average_rr: number;
  profit_factor: number;
  expectancy: number;
  max_drawdown_pct: number;
  best_session: string | null;
  best_pair: string | null;
  worst_pair: string | null;
  best_setup: string | null;
}

export interface EdgeFinderResult {
  most_profitable_pair: string | null;
  most_profitable_session: string | null;
  best_amd_pattern: string | null;
  best_risk_model: string | null;
  best_market_condition: string | null;
  sample_size: number;
}

export interface ReplaySession {
  id: number;
  trade_id: number | null;
  pair: string;
  setup: string;
  chart_screenshot_url: string | null;
  entry_screenshot_url: string | null;
  exit_screenshot_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Account {
  id: number;
  name: string;
  broker: string | null;
  is_prop_firm: boolean;
  starting_balance: number;
  balance: number;
  max_daily_loss_pct: number;
  max_weekly_loss_pct: number;
  max_monthly_loss_pct: number;
  max_total_drawdown_pct: number;
  default_risk_per_trade_pct: number;
  created_at: string;
}

export interface DashboardSummary {
  account_balance: number;
  daily_pnl: number;
  weekly_pnl: number;
  monthly_pnl: number;
  open_trades: Trade[];
  upcoming_news: EconomicEvent[];
  currency_strength: CurrencyStrengthEntry[];
  watchlist: WatchlistItem[];
  ai_briefing: string;
}

export interface AIReview {
  trade_id: number;
  entry_quality: number;
  rule_compliance: number;
  risk_management: number;
  execution_quality: number;
  psychology: number;
  overall_score: number;
  summary: string;
}
