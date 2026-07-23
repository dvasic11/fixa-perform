import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Ring, Chip } from "@/components/ui-bits";
import {
  athlete,
  readinessDynamic,
  intelligenceEngine,
  wellnessToday,
  wellnessLabels,
  type WellnessKey,
} from "@/lib/mock-data";
import {
  Brain,
  ChevronRight,
  Sparkles,
  Utensils,
  Dumbbell,
  HeartPulse,
  MessageCircle,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FIXA — Dynamic Athletic Intelligence" },
      {
        name: "description",
        content:
          "A context-aware AI head coach. FIXA fuses lifts, jumps, sleep, nutrition and daily wellness into one adaptive plan.",
      },
      { property: "og:title", content: "FIXA — Dynamic Athletic Intelligence" },
      {
        property: "og:description",
        content:
          "Your daily readiness, holistic diagnosis, and today's most important intervention — in one glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const domainMeta = {
  program:   { icon: Dumbbell,      color: "var(--color-primary)",       label: "Program" },
  nutrition: { icon: Utensils,      color: "var(--color-accent-orange)", label: "Fuel" },
  prehab:    { icon: HeartPulse,    color: "var(--color-accent-blue)",   label: "Prehab" },
  coaching:  { icon: MessageCircle, color: "var(--color-accent-violet)", label: "Coach" },
} as const;

function Dashboard() {
  const [wellness, setWellness] = useState(wellnessToday);
  const [submitted, setSubmitted] = useState(false);
  const engine = intelligenceEngine;
  const top = engine.interventions[0];

  return (
    <AppShell>
      <Screen
        subtitle={`Hi ${athlete.name.split(" ")[0]} · ${athlete.streakDays}d streak`}
        title="Today"
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
        {/* READINESS HERO — dynamic */}
        <Card className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <Ring value={readinessDynamic.score} size={128} stroke={13}>
              <div className="text-center">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Readiness
                </div>
                <div className="text-4xl font-black leading-none">
                  {readinessDynamic.score}
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-wider text-primary">
                  {readinessDynamic.band}
                </div>
              </div>
            </Ring>
            <div className="min-w-0 flex-1 space-y-2">
              <Chip tone="primary">
                <Brain className="mr-1 inline h-3 w-3" /> Adaptive engine
              </Chip>
              <p className="text-sm font-semibold leading-snug">
                {engine.headline}
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                {engine.windowLabel} · confidence {engine.confidence}%
              </p>
              <Link
                to="/coach"
                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                See diagnosis <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </Card>

        {/* GOAL STRIP */}
        <Link to="/profile" className="block">
          <Card className="!p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  High-level goal
                </p>
                <p className="truncate text-sm font-bold">{athlete.goalLabel}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </Link>

        {/* TODAY'S #1 INTERVENTION — the "what to do now" */}
        <Link to={top.href} className="block">
          <Card className="relative overflow-hidden border-primary/40">
            <div className="absolute inset-0 fx-gradient-premium opacity-[0.08]" />
            <div className="relative">
              <div className="flex items-center gap-2">
                <Chip tone="primary">Priority intervention</Chip>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {domainMeta[top.domain].label}
                </span>
              </div>
              <p className="mt-2 text-base font-black leading-tight">{top.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {top.detail}
              </p>
              <div className="mt-3 rounded-xl bg-background/60 p-3 text-[11px] leading-relaxed">
                <span className="font-semibold text-primary">Do this →</span> {top.action}
              </div>
            </div>
          </Card>
        </Link>

        {/* DAILY WELLNESS QUESTIONNAIRE */}
        <Card>
          <div className="mb-1 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Out-of-gym check-in
              </p>
              <p className="text-sm font-bold">How are you today?</p>
            </div>
            {submitted && <Chip tone="success">Logged</Chip>}
          </div>
          <div className="mt-3 space-y-3">
            {(Object.keys(wellness) as WellnessKey[]).map((k) => (
              <WellnessRow
                key={k}
                k={k}
                value={wellness[k]}
                onChange={(v) => setWellness((w) => ({ ...w, [k]: v }))}
              />
            ))}
          </div>
          <button
            onClick={() => setSubmitted(true)}
            className="mt-4 w-full rounded-xl fx-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-lg active:scale-[0.99]"
          >
            {submitted ? "Update check-in" : "Feed the engine"}
          </button>
        </Card>

        {/* DRIVER BARS — where readiness came from */}
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Readiness drivers
          </p>
          <div className="mt-3 space-y-3">
            {readinessDynamic.drivers.map((d) => (
              <div key={d.label}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-muted-foreground">{d.label}</span>
                  <span className="font-semibold tabular-nums text-foreground">{d.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${d.value}%`,
                      background:
                        d.value > 75
                          ? "var(--color-primary)"
                          : d.value > 60
                          ? "var(--color-accent-blue)"
                          : "var(--color-accent-orange)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* OTHER INTERVENTIONS PEEK */}
        <div>
          <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Other adjustments for today
          </p>
          <div className="grid grid-cols-2 gap-3">
            {engine.interventions.slice(1).map((iv) => {
              const meta = domainMeta[iv.domain];
              const Icon = meta.icon;
              return (
                <Link key={iv.id} to={iv.href} className="fx-card p-4 active:scale-[0.99] transition">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-background"
                    style={{ backgroundColor: meta.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {meta.label}
                  </p>
                  <p className="mt-0.5 text-[13px] font-bold leading-tight">{iv.title}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </Screen>
    </AppShell>
  );
}

function WellnessRow({
  k,
  value,
  onChange,
}: {
  k: WellnessKey;
  value: number;
  onChange: (v: number) => void;
}) {
  const meta = wellnessLabels[k];
  const color =
    value <= 3 ? "var(--color-primary)"
    : value <= 6 ? "var(--color-accent-blue)"
    : value <= 8 ? "var(--color-accent-orange)"
    : "var(--color-destructive)";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-semibold text-foreground">{meta.title}</span>
        <span className="tabular-nums text-muted-foreground">
          {value}/10 · <span style={{ color }}>{value <= 3 ? meta.low : value >= 8 ? meta.high : "Moderate"}</span>
        </span>
      </div>
      <input
        aria-label={meta.title}
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
        style={{ accentColor: color }}
      />
    </div>
  );
}
