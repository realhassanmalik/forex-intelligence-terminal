export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="relative border-b border-primary/15 px-8 py-6">
      <div className="flex items-center gap-3">
        <span className="h-4 w-0.5 bg-accent shadow-glow-accent" />
        <h1 className="font-display text-xl font-bold uppercase tracking-[0.15em] text-white">
          {title}
        </h1>
        <span className="blink-caret text-accent" />
      </div>
      {subtitle && (
        <p className="mt-1.5 pl-3.5 font-mono text-xs uppercase tracking-widest text-muted">
          <span className="text-primary/70">// </span>
          {subtitle}
        </p>
      )}
    </header>
  );
}
