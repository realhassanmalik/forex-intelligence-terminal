import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-accent/15 text-accent border border-accent/50 hover:bg-accent/25 hover:shadow-glow-accent",
  secondary:
    "bg-surfaceAlt/60 text-primary border border-primary/40 hover:bg-primary/10 hover:shadow-glow-primary",
  danger:
    "bg-danger/15 text-danger border border-danger/50 hover:bg-danger/25 hover:shadow-glow-danger",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-md px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
