import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Screen({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 pt-2">
        <div className="min-w-0">
          {subtitle && (
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {subtitle}
            </p>
          )}
          <h1 className="truncate text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </header>
      {children}
    </div>
  );
}

export function Card({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn("fx-card p-5", onClick && "cursor-pointer active:scale-[0.99] transition-transform", className)}
    >
      {children}
    </div>
  );
}

export function Ring({
  value,
  size = 128,
  stroke = 12,
  color = "var(--color-primary)",
  trackColor = "var(--color-muted)",
  children,
}: {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

export function Bar({
  value,
  max,
  color = "var(--color-primary)",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: color, transition: "width 500ms ease" }}
      />
    </div>
  );
}

export function Chip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "primary" | "warning" | "success";
}) {
  const tones: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/15 text-primary",
    warning: "bg-[oklch(0.78_0.18_55/0.15)] text-[oklch(0.85_0.18_75)]",
    success: "bg-[oklch(0.75_0.16_155/0.15)] text-[oklch(0.85_0.17_150)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  unit,
  delta,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
      {delta && <p className="mt-0.5 text-xs text-primary">{delta}</p>}
    </div>
  );
}
