"use client";

import { useEffect, useState } from "react";

const TICKERS = [
  { s: "EUR/USD", v: "1.1687", up: true },
  { s: "GBP/USD", v: "1.2941", up: true },
  { s: "USD/JPY", v: "156.82", up: false },
  { s: "XAU/USD", v: "2418.6", up: true },
  { s: "USD/CHF", v: "0.8794", up: false },
  { s: "AUD/USD", v: "0.6612", up: true },
];

export function StatusBar() {
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "UTC",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="hud-sweep relative z-10 flex items-center gap-4 border-b border-primary/20 bg-surface/70 px-5 py-2 text-[11px] uppercase tracking-widest backdrop-blur">
      <div className="flex items-center gap-2 whitespace-nowrap">
        <span className="led" />
        <span className="glow-text-accent font-semibold">LIVE</span>
        <span className="text-muted">// SYSTEM ONLINE</span>
      </div>

      {/* scrolling ticker */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex gap-6 whitespace-nowrap">
          {[...TICKERS, ...TICKERS].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-muted">
              <span className="text-primary/90">{t.s}</span>
              <span className={t.up ? "text-accent" : "text-danger"}>
                {t.v} {t.up ? "▲" : "▼"}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="hidden items-center gap-4 whitespace-nowrap md:flex">
        <span className="text-muted">
          FEED <span className="text-accent">MOCK</span>
        </span>
        <span className="text-muted">
          LAT <span className="text-primary">08ms</span>
        </span>
        <span className="text-primary tabular-nums">{clock} UTC</span>
      </div>
    </header>
  );
}
