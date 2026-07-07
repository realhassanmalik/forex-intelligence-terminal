import type { ReactNode } from "react";

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`hud-panel hud-corners rounded-lg p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between border-b border-primary/10 pb-3">
          {title && (
            <h2 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              <span className="text-accent">▹</span>
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
