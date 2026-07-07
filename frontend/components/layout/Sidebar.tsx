"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", code: "DSH" },
  { href: "/market-intelligence", label: "Market Intel", code: "MKT" },
  { href: "/amd-scanner", label: "AMD Scanner", code: "AMD" },
  { href: "/liquidity-scanner", label: "Liquidity Scan", code: "LQD" },
  { href: "/watchlist", label: "Watchlist", code: "WCH" },
  { href: "/journal", label: "Trade Journal", code: "JRN" },
  { href: "/analytics", label: "Analytics", code: "ANL" },
  { href: "/replay", label: "Replay", code: "RPL" },
  { href: "/risk-center", label: "Risk Center", code: "RSK" },
  { href: "/ai-coach", label: "AI Coach", code: "AIC" },
  { href: "/settings", label: "Settings", code: "SYS" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative z-10 flex h-screen w-64 flex-col border-r border-primary/20 bg-surface/60 backdrop-blur">
      {/* boot header */}
      <div className="hud-sweep relative border-b border-primary/20 px-5 py-5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded border border-primary/50 bg-primary/10 shadow-glow-primary">
            <span className="font-display text-sm font-bold text-primary">F</span>
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-widest text-white">
              FOREX<span className="text-primary">INTEL</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Terminal v1.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="px-2 pb-2 text-[10px] uppercase tracking-[0.3em] text-muted/70">// Modules</p>
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all ${
                active
                  ? "bg-primary/10 text-white shadow-glow-primary"
                  : "text-muted hover:bg-surfaceAlt/60 hover:text-white"
              }`}
            >
              {/* left active bar */}
              <span
                className={`absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-full transition-all ${
                  active ? "w-0.5 bg-accent shadow-glow-accent" : "w-0 bg-transparent"
                }`}
              />
              <span className="flex items-center gap-2.5">
                <span
                  className={`font-mono text-[10px] tracking-wider ${
                    active ? "text-accent" : "text-muted/60 group-hover:text-primary/70"
                  }`}
                >
                  {item.code}
                </span>
                {item.label}
              </span>
              {active && <span className="led" />}
            </Link>
          );
        })}
      </nav>

      {/* system readout */}
      <div className="border-t border-primary/20 px-4 py-3 text-[10px] uppercase tracking-widest text-muted">
        <div className="flex items-center justify-between">
          <span>Core</span>
          <span className="text-accent">● Nominal</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span>Uplink</span>
          <span className="text-primary">Secure</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surfaceAlt">
          <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent shadow-glow-accent" />
        </div>
      </div>
    </aside>
  );
}
