import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Ring, Bar, Chip, Stat } from "@/components/ui-bits";
import {
  athlete,
  nutritionToday,
  jumpMetrics,
  recovery,
  sleepLog,
  recommendations,
  videoLifts,
} from "@/lib/mock-data";
import {
  Flame,
  TrendingUp,
  Shield,
  ChevronRight,
  Zap,
  Sparkles,
  Brain,
  Video,
  Moon,
  Activity,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FIXA — Athletic Intelligence Hub" },
      {
        name: "description",
        content:
          "The unified intelligence hub for all athletes: lifts, jumps, nutrition, and sleep synthesised into one readiness signal.",
      },
      { property: "og:title", content: "FIXA — Athletic Intelligence Hub" },
      {
        property: "og:description",
        content:
          "The unified intelligence hub for all athletes: lifts, jumps, nutrition, and sleep synthesised into one readiness signal.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const kcalPct = Math.round((nutritionToday.caloriesConsumed / nutritionToday.caloriesGoal) * 100);
  const topBottleneck = recommendations.bottlenecks[0];
  const latestLift = videoLifts[0];

  return (
    <AppShell>
      <Screen
        subtitle={`Hi ${athlete.name.split(" ")[0]} · ${athlete.streakDays}d streak`}
        title="Intelligence"
        right={
          <Link
            to="/profile"
            className="flex h-11 w-11 items-center justify-center rounded-full fx-gradient-primary text-sm font-bold text-primary-foreground shadow-lg"
            aria-label="Open profile"
          >
            {athlete.avatarInitials}
          </Link>
        }
      >
        {/* READINESS HERO — synthesis of everything */}
        <Card className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <Ring value={recommendations.readiness} size={132} stroke={13}>
              <div className="text-center">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Readiness
                </div>
                <div className="text-4xl font-black leading-none">
                  {recommendations.readiness}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-primary">
                  Primed
                </div>
              </div>
            </Ring>
            <div className="min-w-0 flex-1 space-y-2">
              <Chip tone="primary">
                <Brain className="mr-1 inline h-3 w-3" /> Master engine
              </Chip>
              <p className="text-sm font-semibold leading-snug">
                {recommendations.headline}
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Sleep, lifts, and body-comp were fused into today's score.
              </p>
              <Link
                to="/coach"
                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                Open blueprint <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Input rail */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            <InputPill label="Sleep" value={`${sleepLog.hours}h`} good />
            <InputPill label="HRV" value={`${sleepLog.hrv}`} good />
            <InputPill label="Fuel" value={`${kcalPct}%`} />
            <InputPill label="Sore" value={`${sleepLog.soreness}/10`} good />
          </div>
        </Card>

        {/* SYSTEM METRICS */}
        <div className="grid grid-cols-2 gap-3">
          <MetricTile
            to="/performance"
            icon={<TrendingUp className="h-4 w-4" />}
            iconBg="var(--color-accent-lime)"
            label="Vertical"
            value={`${jumpMetrics.current}`}
            unit="cm"
            delta={`+${jumpMetrics.delta7d}cm · 7d`}
          />
          <MetricTile
            to="/lifts"
            icon={<Zap className="h-4 w-4" />}
            iconBg="var(--color-accent-violet)"
            label="Est. 1RM Squat"
            value={`${latestLift.estimated1RM}`}
            unit="kg"
            delta={`${latestLift.relStrength.toFixed(2)}× BW`}
          />
          <MetricTile
            to="/recovery"
            icon={<Shield className="h-4 w-4" />}
            iconBg="var(--color-accent-blue)"
            label="Recovery"
            value={`${recovery.score}`}
            unit="/100"
            delta={`Risk · ${recovery.injuryRisk}`}
          />
          <MetricTile
            to="/nutrition"
            icon={<Flame className="h-4 w-4" />}
            iconBg="var(--color-accent-orange)"
            label="Deficit"
            value={`${nutritionToday.caloriesGoal - nutritionToday.caloriesConsumed}`}
            unit="kcal left"
            delta={`${nutritionToday.macros.protein.consumed}g / ${nutritionToday.macros.protein.goal}g P`}
          />
        </div>

        {/* TOP BOTTLENECK — flagship insight */}
        <Link to="/coach" className="block">
          <Card className="border-primary/40">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Brain className="h-5 w-5" strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{topBottleneck.title}</p>
                  <Chip tone="warning">High</Chip>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {topBottleneck.detail}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {topBottleneck.linked.map((l) => (
                    <span
                      key={l}
                      className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Link>

        {/* CARB TIMING */}
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl fx-gradient-primary">
              <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Performance Carb Timing</p>
                <Chip tone="primary">+{nutritionToday.carbTiming.grams}g</Chip>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {nutritionToday.carbTiming.reason}
              </p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-primary">
                {nutritionToday.carbTiming.windowLabel} · {nutritionToday.carbTiming.session}
              </p>
            </div>
          </div>
        </Card>

        {/* LATEST VIDEO LIFT */}
        <Link to="/lifts" className="block">
          <Card>
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Latest video analysis
              </p>
              <span className="flex items-center gap-1 text-xs font-medium text-primary">
                Open <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: `linear-gradient(135deg, oklch(0.6 0.18 ${latestLift.thumbnail}), oklch(0.35 0.1 ${latestLift.thumbnail}))`,
                }}
              >
                <Video className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{latestLift.lift}</p>
                <p className="text-[11px] text-muted-foreground">
                  {latestLift.load}kg × {latestLift.reps} · {latestLift.meanVelocity.toFixed(2)} m/s mean
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Chip tone="primary">Form {latestLift.formScore}</Chip>
                  <span className="text-[11px] text-muted-foreground">
                    Est. 1RM {latestLift.estimated1RM}kg
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Link>

        {/* SLEEP + RECOVERY QUICK */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="!p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-accent-violet)]/20 text-[color:var(--color-accent-violet)]">
              <Moon className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <Stat label="Sleep" value={sleepLog.hours} unit="hrs" delta={`Quality ${sleepLog.quality}%`} />
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-accent-blue)]/20 text-[color:var(--color-accent-blue)]">
              <Activity className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <Stat label="HRV" value={sleepLog.hrv} unit="ms" delta={`RHR ${sleepLog.restingHr} bpm`} />
            </div>
          </Card>
        </div>

        {/* MACROS QUICK */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Today's fuel
            </p>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {nutritionToday.caloriesConsumed} / {nutritionToday.caloriesGoal} kcal
            </span>
          </div>
          <div className="space-y-3">
            <MacroRow label="Protein" v={nutritionToday.macros.protein.consumed} g={nutritionToday.macros.protein.goal} color="var(--color-accent-lime)" />
            <MacroRow label="Carbs" v={nutritionToday.macros.carbs.consumed} g={nutritionToday.macros.carbs.goal} color="var(--color-accent-orange)" />
            <MacroRow label="Fat" v={nutritionToday.macros.fat.consumed} g={nutritionToday.macros.fat.goal} color="var(--color-accent-blue)" />
          </div>
        </Card>

        {/* PREMIUM */}
        <Link to="/premium" className="block">
          <Card className="relative overflow-hidden border-primary/30">
            <div className="absolute inset-0 fx-gradient-premium opacity-[0.14]" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl fx-gradient-premium">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Unlock FIXA Elite</p>
                <p className="text-xs text-muted-foreground">
                  Unlimited AI video analysis & full engine · €5/mo
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </Screen>
    </AppShell>
  );
}

function InputPill({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-xl bg-muted/60 px-2 py-2 text-center">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-bold tabular-nums ${good ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

function MacroRow({ label, v, g, color }: { label: string; v: number; g: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground">
          {v}
          <span className="text-muted-foreground">/{g}g</span>
        </span>
      </div>
      <Bar value={v} max={g} color={color} />
    </div>
  );
}

function MetricTile({
  to,
  icon,
  iconBg,
  label,
  value,
  unit,
  delta,
}: {
  to: "/performance" | "/lifts" | "/nutrition" | "/recovery" | "/coach";
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  unit: string;
  delta: string;
}) {
  return (
    <Link to={to} className="fx-card p-4 block active:scale-[0.99] transition-transform">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="mt-3">
        <Stat label={label} value={value} unit={unit} delta={delta} />
      </div>
    </Link>
  );
}
