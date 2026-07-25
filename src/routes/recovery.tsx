import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Ring, Chip, Stat } from "@/components/ui-bits";
import { recovery } from "@/lib/mock-data";
import { useLiveWorkout } from "@/lib/live-workout";
import { Moon, Activity, Shield, Check, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/recovery")({
  head: () => ({
    meta: [
      { title: "Recover · FIXA" },
      {
        name: "description",
        content:
          "Daily prehab routines, tendon stiffness training, and mobility tracking for basketball athletes.",
      },
      { property: "og:title", content: "Recover · FIXA" },
      {
        property: "og:description",
        content: "Smart recovery & injury prevention (prehab).",
      },
    ],
  }),
  component: RecoveryPage,
});

function RecoveryPage() {
  const [routines, setRoutines] = useState(recovery.routines);
  const { mobilityRx, clearMobility } = useLiveWorkout();
  const toggle = (id: string) =>
    setRoutines((rs) => rs.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  const done = routines.filter((r) => r.done).length;

  return (
    <AppShell>
      <Screen subtitle="Recover" title="Prehab & Recovery">
        {mobilityRx.length > 0 && (
          <Card className="border-primary/40">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-black">AI-injected mobility Rx</p>
                <p className="text-[11px] text-muted-foreground">
                  Gemini flagged mobility restrictions during live lifts. Do these before your next session.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {mobilityRx.map((m) => (
                <div key={m.id} className="flex items-start gap-2 rounded-xl bg-muted/40 p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Chip tone="primary">{m.joint}</Chip>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        via {m.source}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] font-semibold">{m.exercise}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{m.duration} min</p>
                  </div>
                  <button
                    onClick={() => clearMobility(m.id)}
                    aria-label="Mark complete"
                    className="rounded-full bg-primary/15 p-1.5 text-primary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
        {/* Recovery score */}
        <Card className="relative overflow-hidden">
          <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[color:var(--color-accent-blue)]/10 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <Ring value={recovery.score} color="var(--color-accent-blue)">
              <div className="text-center">
                <div className="text-3xl font-black leading-none">{recovery.score}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Recovery
                </div>
              </div>
            </Ring>
            <div className="min-w-0 flex-1">
              <Chip tone="success">
                <Shield className="mr-1 inline h-3 w-3" /> Risk · {recovery.injuryRisk}
              </Chip>
              <p className="mt-2 text-sm text-muted-foreground">
                Body is <span className="font-semibold text-foreground">primed</span> for a
                high-intensity court session tonight.
              </p>
            </div>
          </div>
        </Card>

        {/* Vitals */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="!p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-accent-violet)]/20 text-[color:var(--color-accent-violet)]">
              <Moon className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <Stat label="Sleep" value={recovery.sleepHrs} unit="hrs" />
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-accent-blue)]/20 text-[color:var(--color-accent-blue)]">
              <Activity className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <Stat label="HRV" value={recovery.hrv} unit="ms" />
            </div>
          </Card>
          <Card className="!p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--color-accent-orange)]/20 text-[color:var(--color-accent-orange)]">
              <Shield className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <Stat label="Soreness" value={recovery.soreness.split("-")[0]} />
            </div>
          </Card>
        </div>

        {/* Daily prehab */}
        <Card>
          <div className="mb-1 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Daily prehab routine
              </p>
              <p className="text-base font-semibold">
                {done}/{routines.length} completed
              </p>
            </div>
            <div className="text-xs font-semibold text-primary">
              {Math.round((done / routines.length) * 100)}%
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full fx-gradient-primary"
              style={{ width: `${(done / routines.length) * 100}%` }}
            />
          </div>

          <div className="mt-4 space-y-2">
            {routines.map((r) => (
              <button
                key={r.id}
                onClick={() => toggle(r.id)}
                className="flex w-full items-center justify-between rounded-xl bg-muted/60 px-3 py-3 text-left active:scale-[0.99] transition"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Chip>{r.focus}</Chip>
                    <span className="text-[11px] text-muted-foreground">{r.duration} min</span>
                  </div>
                </div>
                <div
                  className={
                    r.done
                      ? "flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      : "flex h-7 w-7 items-center justify-center rounded-full border border-border"
                  }
                >
                  {r.done && <Check className="h-4 w-4" strokeWidth={3} />}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-semibold">Mobility trend</p>
          <p className="text-[11px] text-muted-foreground">
            Hips & ankles improving · 4-week rolling average
          </p>
          <div className="mt-4 flex items-end gap-1.5 h-24">
            {[52, 58, 55, 61, 64, 66, 72, 74, 71, 78, 80, 82].map((v, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-md fx-gradient-primary"
                style={{ height: `${v}%`, opacity: 0.5 + (i / 22) }}
              />
            ))}
          </div>
        </Card>
      </Screen>
    </AppShell>
  );
}
