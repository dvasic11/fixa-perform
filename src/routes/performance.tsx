import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Chip, Stat } from "@/components/ui-bits";
import { jumpMetrics, athlete } from "@/lib/mock-data";
import { Plus, TrendingUp, Camera, Lock } from "lucide-react";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Perform · FIXA" },
      {
        name: "description",
        content:
          "Track vertical jump, single-leg stability, and explosive force metrics for basketball athletes.",
      },
      { property: "og:title", content: "Perform · FIXA" },
      {
        property: "og:description",
        content: "Explosive performance & vertical jump analytics.",
      },
    ],
  }),
  component: PerformancePage,
});

function PerformancePage() {
  const j = jumpMetrics;
  const goalPct = Math.round((j.current / j.goal) * 100);
  return (
    <AppShell>
      <Screen
        subtitle="Perform"
        title="Vertical & Force"
        right={
          <button className="flex h-11 items-center gap-1.5 rounded-full fx-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg">
            <Plus className="h-4 w-4" strokeWidth={2.6} /> Log jump
          </button>
        }
      >
        {/* Hero jump card */}
        <Card className="relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-end justify-between">
            <div>
              <Chip tone="primary">
                <TrendingUp className="mr-1 inline h-3 w-3" /> +{j.delta7d} cm · 7d
              </Chip>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight">{j.current}</span>
                <span className="text-lg font-semibold text-muted-foreground">cm</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Best {j.best} cm · Goal {j.goal} cm
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                To goal
              </div>
              <div className="text-2xl font-bold text-primary">{goalPct}%</div>
            </div>
          </div>

          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full fx-gradient-primary"
              style={{ width: `${goalPct}%` }}
            />
          </div>

          {/* Sparkline */}
          <Sparkline data={j.history.map((h) => h.cm)} />
        </Card>

        {/* Force + asymmetry */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <Stat
              label="Force Index"
              value={j.forceIndex}
              unit="/100"
              delta="Explosive · High"
            />
          </Card>
          <Card>
            <Stat
              label="Asymmetry"
              value={`${j.singleLeg.asymmetry}`}
              unit="%"
              delta="Target < 10%"
            />
          </Card>
        </div>

        {/* Single-leg stability */}
        <Card>
          <p className="text-sm font-semibold">Single-leg stability</p>
          <p className="text-[11px] text-muted-foreground">Balance & control · last test</p>
          <div className="mt-4 space-y-3">
            <LegBar label="Left leg" value={j.singleLeg.leftStability} />
            <LegBar label="Right leg" value={j.singleLeg.rightStability} />
          </div>
        </Card>

        {/* AI biometrics teaser */}
        <Card className="relative overflow-hidden border-primary/25">
          <div className="absolute inset-0 fx-gradient-premium opacity-[0.1]" />
          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">AI Body Fat & Biometrics</p>
                <Chip tone="primary">
                  <Lock className="mr-1 inline h-3 w-3" /> Elite
                </Chip>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload a photo and let FIXA AI estimate body-fat %, lean mass, and track composition over time.
              </p>
              <button className="mt-3 text-xs font-semibold text-primary">
                Preview scanner →
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Athlete profile
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <MiniStat label="Height" value={`${athlete.height}`} unit="cm" />
            <MiniStat label="Weight" value={`${athlete.weight}`} unit="kg" />
            <MiniStat label="Age" value={`${athlete.age}`} unit="yrs" />
          </div>
        </Card>
      </Screen>
    </AppShell>
  );
}

function LegBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value}%`,
            backgroundColor:
              value > 85 ? "var(--color-primary)" : "var(--color-accent-orange)",
          }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold leading-none">
        {value}
        <span className="ml-0.5 text-xs font-medium text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 300;
  const h = 60;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 8) - 4}`)
    .join(" ");
  return (
    <div className="mt-5">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full">
        <defs>
          <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <polygon fill="url(#spark)" points={`0,${h} ${points} ${w},${h}`} />
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {data.map((_, i) => (
          <span key={i}>W{i + 1}</span>
        ))}
      </div>
    </div>
  );
}
