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

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <button
        aria-label="Close sheet"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative mx-auto w-full max-w-md rounded-t-3xl border border-border bg-surface-elevated p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl animate-in slide-in-from-bottom">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="inline-flex w-full rounded-2xl bg-muted/60 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 rounded-xl px-3 py-2 text-[11px] font-semibold uppercase tracking-wider transition",
              active
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function LineChart({
  data,
  labels,
  color = "var(--color-primary)",
  height = 140,
  suffix = "",
}: {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  suffix?: string;
}) {
  const w = 320;
  const h = height;
  const pad = 20;
  const valid = data.filter((n) => Number.isFinite(n) && n > 0);
  if (valid.length < 2) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-muted/40 text-[11px] text-muted-foreground"
        style={{ height }}
      >
        Not enough data yet
      </div>
    );
  }
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1);
  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y =
      v > 0
        ? pad + (h - pad * 2) - ((v - min) / range) * (h - pad * 2)
        : h - pad;
    return { x, y, v };
  });
  const path = pts
    .filter((p) => p.v > 0)
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="lc" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={w - pad}
            y1={pad + (h - pad * 2) * f}
            y2={pad + (h - pad * 2) * f}
            stroke="var(--color-border)"
            strokeDasharray="2 3"
          />
        ))}
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={`${path} L ${pts[pts.length - 1].x} ${h - pad} L ${pts.filter((p) => p.v > 0)[0].x} ${h - pad} Z`}
          fill="url(#lc)"
        />
        {pts.map((p, i) =>
          p.v > 0 ? (
            <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4 : 2.5} fill={color} />
          ) : null,
        )}
        <text
          x={pts[pts.length - 1].x}
          y={pts[pts.length - 1].y - 8}
          fill={color}
          fontSize="11"
          fontWeight="700"
          textAnchor="end"
        >
          {pts[pts.length - 1].v}
          {suffix}
        </text>
      </svg>
      {labels && (
        <div className="mt-1 flex justify-between px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
