import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Chip, Bar } from "@/components/ui-bits";
import { athlete, sleepLog } from "@/lib/mock-data";
import { Camera, Moon, Target, User, Ruler, Weight, Award, ChevronRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · FIXA" },
      {
        name: "description",
        content:
          "Your biometrics, sport profile, and lifestyle inputs — the foundation the FIXA engine builds from.",
      },
      { property: "og:title", content: "Profile · FIXA" },
      {
        property: "og:description",
        content: "Biometrics, sport & position, goals, and sleep — all in one place.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AppShell>
      <Screen subtitle="You" title="Athlete Profile">
        {/* Identity */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl fx-gradient-primary text-xl font-black text-primary-foreground shadow-lg">
              {athlete.avatarInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-black leading-tight">{athlete.name}</p>
              <p className="text-xs text-muted-foreground">
                {athlete.team} · {athlete.position}
              </p>
              <div className="mt-1.5 flex gap-1.5">
                <Chip tone="primary">{athlete.age} yrs</Chip>
                <Chip>{athlete.sport}</Chip>
              </div>
            </div>
          </div>
        </Card>

        {/* Biometrics */}
        <Section title="Biometrics" icon={<User className="h-3.5 w-3.5" />}>
          <div className="grid grid-cols-2 gap-3">
            <BioTile icon={<Ruler className="h-4 w-4" />} label="Height" value={`${athlete.height}`} unit="cm" />
            <BioTile icon={<Weight className="h-4 w-4" />} label="Weight" value={`${athlete.weight}`} unit="kg" />
            <BioTile icon={<Target className="h-4 w-4" />} label="Body fat" value={`${athlete.bodyFat}`} unit="%" />
            <BioTile icon={<Award className="h-4 w-4" />} label="Lean mass" value={`${athlete.leanMass}`} unit="kg" />
          </div>
        </Section>

        {/* Goal */}
        <Card className="border-primary/30">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Current goal
              </p>
              <p className="text-sm font-bold">{athlete.goalLabel}</p>
              <div className="mt-2 flex gap-1.5">
                <GoalPill label="Lean down" active={athlete.goal === "lean_down"} />
                <GoalPill label="Gain mass" active={athlete.goal === "gain_mass"} />
                <GoalPill label="Maintain" active={athlete.goal === "maintain"} />
              </div>
            </div>
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
                <p className="text-sm font-semibold">AI Body Fat scanner</p>
                <Chip tone="primary"><Sparkles className="mr-1 inline h-3 w-3" /> Elite</Chip>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                One selfie → body-fat estimate, lean mass, and composition trend.
              </p>
              <Link to="/premium" className="mt-3 inline-block text-xs font-semibold text-primary">
                Try scanner →
              </Link>
            </div>
          </div>
        </Card>

        {/* Sleep tracker */}
        <Section title="Lifestyle & recovery" icon={<Moon className="h-3.5 w-3.5" />}>
          <Card>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Last night
                </p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-4xl font-black tabular-nums">{sleepLog.hours}</span>
                  <span className="text-sm text-muted-foreground">hrs</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {sleepLog.bedtime} → {sleepLog.wake}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Quality
                </p>
                <p className="text-2xl font-bold text-primary">{sleepLog.quality}%</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                7-day sleep
              </p>
              <div className="flex items-end gap-1.5 h-16">
                {sleepLog.week.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md fx-gradient-primary"
                      style={{ height: `${(h / 9) * 100}%`, opacity: 0.4 + i * 0.08 }}
                    />
                    <span className="text-[9px] text-muted-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniStat label="HRV" value={`${sleepLog.hrv}`} unit="ms" />
              <MiniStat label="RHR" value={`${sleepLog.restingHr}`} unit="bpm" />
              <MiniStat label="Sore" value={`${sleepLog.soreness}`} unit="/10" />
            </div>
          </Card>
        </Section>

        {/* Baseline routine */}
        <Card>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Baseline daily routine
          </p>
          <div className="mt-3 space-y-2.5">
            <RoutineRow label="Wake" value="06:44" pct={30} />
            <RoutineRow label="Training window" value="16:00 – 21:00" pct={80} />
            <RoutineRow label="Wind-down" value="22:35" pct={95} />
          </div>
        </Card>

        <Link to="/coach" className="block">
          <Card className="border-primary/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Rebuild today's blueprint</p>
                <p className="text-[11px] text-muted-foreground">
                  Regenerate the engine from your latest inputs.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </Link>
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

function BioTile({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <Card className="!p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black leading-none tabular-nums">
        {value}
        <span className="ml-0.5 text-xs font-medium text-muted-foreground">{unit}</span>
      </p>
    </Card>
  );
}

function GoalPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
      }`}
    >
      {label}
    </span>
  );
}

function MiniStat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-2.5 text-center">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-base font-bold tabular-nums">
        {value}
        <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function RoutineRow({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <Bar value={pct} max={100} color="var(--color-primary)" />
    </div>
  );
}
