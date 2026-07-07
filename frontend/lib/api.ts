import type {
  Account,
  AIMarketAnalysisResult,
  AIReview,
  AMDScanResult,
  AnalyticsSummary,
  CurrencyStrengthResult,
  DashboardSummary,
  EconomicEvent,
  EdgeFinderResult,
  LiquidityMap,
  MarketStructureResult,
  NewsItem,
  PositionSizeResult,
  ReplaySession,
  RiskStatus,
  Trade,
  TradeCreate,
  WatchlistItem,
  WeeklyReport,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Dashboard
export const getDashboard = (accountId = 1) => apiFetch<DashboardSummary>(`/api/dashboard?account_id=${accountId}`);

// AMD Scanner
export const scanAMD = (pair: string, timeframe: string) =>
  apiFetch<AMDScanResult>(`/api/amd-scanner?pair=${pair}&timeframe=${timeframe}`);

// Liquidity Scanner
export const scanLiquidity = (pair: string, timeframe: string) =>
  apiFetch<LiquidityMap>(`/api/liquidity-scanner?pair=${pair}&timeframe=${timeframe}`);

// Market Structure
export const getMarketStructure = (pair: string, timeframe: string) =>
  apiFetch<MarketStructureResult>(`/api/market-structure?pair=${pair}&timeframe=${timeframe}`);

// Currency Strength
export const getCurrencyStrength = () => apiFetch<CurrencyStrengthResult>("/api/currency-strength");

// Economic Calendar
export const getEconomicCalendar = () => apiFetch<EconomicEvent[]>("/api/economic-calendar");

// News
export const getNews = () => apiFetch<NewsItem[]>("/api/news");

// AI Analyst
export const getMarketAnalysis = (pair: string, timeframe: string) =>
  apiFetch<AIMarketAnalysisResult>("/api/ai/market-analysis", {
    method: "POST",
    body: JSON.stringify({ pair, timeframe }),
  });

export const getWeeklyReport = (accountId = 1) => apiFetch<WeeklyReport>(`/api/reports/weekly?account_id=${accountId}`);

// Risk Center
export const getPositionSize = (payload: { account_id: number; entry: number; stop: number; risk_percent: number; pair: string }) =>
  apiFetch<PositionSizeResult>("/api/risk/position-size", { method: "POST", body: JSON.stringify(payload) });

export const getRiskStatus = (accountId = 1) => apiFetch<RiskStatus>(`/api/risk/status?account_id=${accountId}`);

// Accounts / Settings
export const getAccount = (accountId = 1) => apiFetch<Account>(`/api/accounts/${accountId}`);
export const updateAccount = (accountId: number, payload: Partial<Account>) =>
  apiFetch<Account>(`/api/accounts/${accountId}`, { method: "PUT", body: JSON.stringify(payload) });

// Journal
export const listTrades = (accountId = 1) => apiFetch<Trade[]>(`/api/journal?account_id=${accountId}`);
export const createTrade = (payload: TradeCreate) => apiFetch<Trade>("/api/journal", { method: "POST", body: JSON.stringify(payload) });
export const updateTrade = (id: number, payload: Partial<TradeCreate>) =>
  apiFetch<Trade>(`/api/journal/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteTrade = (id: number) => apiFetch<void>(`/api/journal/${id}`, { method: "DELETE" });
export const reviewTrade = (id: number) => apiFetch<AIReview>(`/api/journal/${id}/ai-review`, { method: "POST" });

// Analytics
export const getAnalyticsSummary = (accountId = 1) => apiFetch<AnalyticsSummary>(`/api/analytics/summary?account_id=${accountId}`);
export const getEdgeFinder = (accountId = 1) => apiFetch<EdgeFinderResult>(`/api/analytics/edge-finder?account_id=${accountId}`);

// Replay
export const listReplays = (params?: { pair?: string; setup?: string }) => {
  const entries = Object.entries(params ?? {}).filter((entry): entry is [string, string] => Boolean(entry[1]));
  const qs = new URLSearchParams(entries).toString();
  return apiFetch<ReplaySession[]>(`/api/replay${qs ? `?${qs}` : ""}`);
};
export const createReplay = (payload: Omit<ReplaySession, "id" | "created_at">) =>
  apiFetch<ReplaySession>("/api/replay", { method: "POST", body: JSON.stringify(payload) });

// Watchlist
export const listWatchlist = () => apiFetch<WatchlistItem[]>("/api/watchlist");
export const addWatchlistItem = (pair: string, notes?: string) =>
  apiFetch<WatchlistItem>("/api/watchlist", { method: "POST", body: JSON.stringify({ pair, notes }) });
export const removeWatchlistItem = (id: number) => apiFetch<void>(`/api/watchlist/${id}`, { method: "DELETE" });
