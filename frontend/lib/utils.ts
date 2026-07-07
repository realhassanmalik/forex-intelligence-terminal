export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function pnlColor(value: number): string {
  if (value > 0) return "text-accent";
  if (value < 0) return "text-danger";
  return "text-muted";
}
