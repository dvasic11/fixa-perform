import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Chip, Bar, Ring } from "@/components/ui-bits";
import { recommendations, athlete, jumpMetrics, videoLifts } from "@/lib/mock-data";
import {
  Brain,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Target,
  Dumbbell,
  Utensils,
  Moon,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Coach · FIXA Master Engine" },
      {
        name: "description",
        content:
          "The Master Recommendation Engine synthesises your lifts, jumps, sleep and nutrition into a daily performance blueprint.",
      },
      { property: "og:title", content: "Coach · FIXA Master Engine" },
      {
        property: "og:description",
        content:
          "Detected bottlenecks, exercise prescription, and integrated nutrition + recovery directives — all personalised.",
      },
    ],
  }),
  component: CoachPage,
});

function CoachPage() {
  const r = recommendations;
  return (
    <AppShell>
      <Screen subtitle="Master Engine" title="Today's Blueprint">
        {/* Synthesis hero */}
        <Card className="relative overflow-hidden border-primary/40">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <Ring value={r.readiness} size={110} stroke={11}>
              <div className="text-center">
                <div className="text-3xl font-black leading-none">{r.readiness}</div>
                <div className="mt-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                  Readiness
                </div>
              </div>
            </Ring>
            <div className="min-w-0 flex-1">
              <Chip tone="primary">
                <Brain className="mr-1 inline h-3 w-3" /> {r.generatedAt}
              </Chip>
              <p className="mt-2 text-sm font-bold leading-snug">{r.headline}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {r.summary}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <SignalPill label="Lifts" value={`${videoLifts.length}`} />
            <SignalPill label="Jumps" value={`${jumpMetrics.current}cm`} />
            <SignalPill label="Sleep" value="82%" />
            <SignalPill label="Comp" value={`${athlete.bodyFat}%`} />
          </div>
        </Card>

        {/* Bottlenecks */}
        <Section title="Biomechanical bottlenecks" icon={<AlertTriangle className="h-3.5 w-3.5" />}>
          <div className="space-y-2">
            {r.bottlenecks.map((b) => (
              <Card key={b.id} className="!p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      b.severity === "high"
                        ? "bg-[color:var(--color-accent-orange)]/20 text-[color:var(--color-accent-orange)]"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{b.title}</p>
                      <Chip tone={b.severity === "high" ? "warning" : "default"}>
                        {b.severity}
                      </Chip>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {b.detail}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {b.linked.map((l) => (
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
            ))}
          </div>
        </Section>

        {/* Priorities weighting */}
        <Section title="What to strengthen" icon={<Target className="h-3.5 w-3.5" />}>
          <Card>
            <div className="space-y-3.5">
              {r.priorities.map((p) => (
                <div key={p.id}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground">{p.label}</span>
                    <span className="font-semibold tabular-nums text-primary">{p.weight}%</span>
                  </div>
                  <Bar value={p.weight} max={100} color="var(--color-primary)" />
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* Exercise prescription */}
        <Section title="Exercise prescription" icon={<Dumbbell className="h-3.5 w-3.5" />}>
          <div className="space-y-2">
            {r.exerciseRx.map((e) => (
              <Card key={e.id} className="!p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Dumbbell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{e.name}</p>
                      <Chip tone="primary">{e.tag}</Chip>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{e.scheme}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Integrated directives */}
        <div className="grid grid-cols-1 gap-3">
          <DirectiveCard
            icon={<Utensils className="h-4 w-4" />}
            title="Nutrition directive"
            label={r.nutritionDirective.label}
            direction={r.nutritionDirective.direction}
            detail={r.nutritionDirective.detail}
            href="/nutrition"
          />
          <DirectiveCard
            icon={<Moon className="h-4 w-4" />}
            title="Recovery directive"
            label={r.recoveryDirective.label}
            direction={r.recoveryDirective.direction}
            detail={r.recoveryDirective.detail}
            href="/recovery"
          />
        </div>

        {/* Sport-specific focus */}
        <Card className="relative overflow-hidden border-primary/25">
          <div className="absolute inset-0 fx-gradient-premium opacity-[0.08]" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Sport-specific focus
                </p>
                <p className="text-sm font-bold">{r.sportSpecific.sport}</p>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5">
              {r.sportSpecific.focus.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </Screen>
    </AppShell>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 px-1">
        <span className="text-primary">{icon}</span>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function SignalPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-2 py-2 text-center">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}

function DirectiveCard({
  icon,
  title,
  label,
  direction,
  detail,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  label: string;
  direction: "up" | "down" | "hold";
  detail: string;
  href: "/nutrition" | "/recovery";
}) {
  const TrendIcon =
    direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Target;
  return (
    <Link to={href} className="block">
      <Card>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {title}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="text-sm font-bold">{label}</p>
              <TrendIcon className="h-3.5 w-3.5 text-primary" />
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {detail}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
