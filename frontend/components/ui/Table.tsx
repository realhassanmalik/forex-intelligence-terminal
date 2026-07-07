import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function Table<T>({ columns, rows, emptyMessage = "No data yet." }: { columns: Column<T>[]; rows: T[]; emptyMessage?: string }) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center font-mono text-xs uppercase tracking-widest text-muted">
        <span className="text-primary/60">[ </span>
        {emptyMessage}
        <span className="text-primary/60"> ]</span>
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left font-mono text-sm">
        <thead>
          <tr className="border-b border-primary/25 text-[10px] uppercase tracking-[0.2em] text-primary/80">
            {columns.map((col) => (
              <th key={col.header} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/40 tabular-nums transition-colors last:border-0 hover:bg-primary/5"
            >
              {columns.map((col) => (
                <td key={col.header} className={`whitespace-nowrap px-3 py-2.5 text-[#c3d4e6] ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
