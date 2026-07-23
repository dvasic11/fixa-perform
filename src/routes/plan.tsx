import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Chip, Bar, Sheet } from "@/components/ui-bits";
import {
  useAppState,
  computeOnTrackScore,
  scanVolumeGuard,
  type ScheduledSession,
  type SessionType,
} from "@/lib/app-state";
import { Plus, Dumbbell, Activity, HeartPulse, Zap, Trash2, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Training Plan · FIXA" },
      { name: "description", content: "Interactive training calendar with AI on-track indicator and volume-guard analysis." },
      { property: "og:title", content: "Training Plan · FIXA" },
      { property: "og:description", content: "Court, lifts, and recovery slots scheduled with real-time AI oversight." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlanPage,
});

const typeMeta: Record<SessionType, { label: string; icon: typeof Dumbbell; color: string }> = {
  lift:         { label: "Lift",       icon: Dumbbell,   color: "var(--color-primary)" },
  court:        { label: "Court",      icon: Activity,   color: "oklch(0.78 0.18 55)" },
  recovery:     { label: "Recovery",   icon: HeartPulse, color: "oklch(0.75 0.16 155)" },
  conditioning: { label: "Conditioning", icon: Zap,      color: "oklch(0.72 0.18 235)" },
};

function PlanPage() {
  const { state, addSession, deleteSession } = useAppState();
  const track = computeOnTrackScore(state);
  const flags = scanVolumeGuard(state);

  const [openAdd, setOpenAdd] = useState(false);

  const days = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, []);

  const bySchedule = (dateISO: string) =>
    state.schedule
      .filter((s) => s.date === dateISO)
      .sort((a, b) => a.time.localeCompare(b.time));

  const [selectedDay, setSelectedDay] = useState<string>(days[0].toISOString().slice(0, 10));

  return (
    <AppShell>
      <Screen subtitle="Weekly plan" title="Training calendar">
        {/* On-track */}
        <Card
          className={
            track.band === "Ahead" || track.band === "On Track"
              ? "border-primary/40"
              : track.band === "Behind"
              ? "border-amber-500/40"
              : "border-destructive/50"
          }
        >
          <div className="flex items-center gap-2">
            <Chip tone={track.band === "At Risk" ? "warning" : "primary"}>
              {track.band === "Ahead" || track.band === "On Track" ? (
                <ShieldCheck className="mr-1 inline h-3 w-3" />
              ) : (
                <AlertTriangle className="mr-1 inline h-3 w-3" />
              )}
              {track.band}
            </Chip>
            <p className="text-[11px] font-semibold text-muted-foreground">
              {track.daysRemaining} days to {state.goal?.event ?? "goal"}
            </p>
          </div>
          <p className="mt-3 text-3xl font-black tabular-nums">
            {track.score}
            <span className="ml-1 text-xs font-medium text-muted-foreground">/100 on-track</span>
          </p>
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Weekly volume {track.weeklyVolume}</span>
              <span>Target ~{track.targetVolume}</span>
            </div>
            <Bar value={track.weeklyVolume} max={Math.max(track.targetVolume * 1.4, 60)} />
          </div>
          {state.goal && (
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
              Chasing <b className="text-foreground">{state.goal.aiRealisticTarget}{state.goal.unit}</b> · from {state.goal.currentValue}{state.goal.unit}. Verdict: {state.goal.verdict}.
            </p>
          )}
        </Card>

        {/* AI Volume Guard */}
        {flags.length > 0 && (
          <Card className="border-amber-500/30">
            <div className="flex items-center gap-2">
              <Chip tone="warning"><Sparkles className="mr-1 inline h-3 w-3" /> Volume Guard</Chip>
              <p className="text-[11px] font-semibold text-muted-foreground">{flags.length} flag{flags.length > 1 ? "s" : ""}</p>
            </div>
            <ul className="mt-3 space-y-2">
              {flags.map((f, i) => (
                <li key={i} className="rounded-xl bg-muted/50 p-3">
                  <p className="text-[12px] font-semibold">{f.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">💡 {f.suggestion}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Week strip */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {days.map((d) => {
            const iso = d.toISOString().slice(0, 10);
            const active = iso === selectedDay;
            const count = bySchedule(iso).length;
            return (
              <button
                key={iso}
                onClick={() => setSelectedDay(iso)}
                className={`flex min-w-[52px] shrink-0 flex-col items-center rounded-2xl border py-2 text-[10px] font-semibold uppercase tracking-widest ${
                  active ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                <span>{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                <span className="text-lg font-black text-foreground">{d.getDate()}</span>
                <span className="text-[9px]">{count} sess.</span>
              </button>
            );
          })}
        </div>

        {/* Day sessions */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {new Date(selectedDay).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </p>
            <button
              onClick={() => setOpenAdd(true)}
              className="flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary"
            >
              <Plus className="h-3 w-3" /> Add session
            </button>
          </div>
          <div className="space-y-2">
            {bySchedule(selectedDay).map((s) => (
              <SessionRow key={s.id} session={s} onDelete={() => deleteSession(s.id)} flagged={flags.some((f) => f.sessionId === s.id)} />
            ))}
            {bySchedule(selectedDay).length === 0 && (
              <Card className="text-center text-xs text-muted-foreground">
                No sessions scheduled — a rest day, if that's on purpose.
              </Card>
            )}
          </div>
        </div>
      </Screen>

      <AddSessionSheet
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSubmit={(s) => {
          addSession({ ...s, date: selectedDay });
          setOpenAdd(false);
        }}
      />
    </AppShell>
  );
}

function SessionRow({ session, onDelete, flagged }: { session: ScheduledSession; onDelete: () => void; flagged: boolean }) {
  const meta = typeMeta[session.type];
  const Icon = meta.icon;
  return (
    <Card className={flagged ? "border-amber-500/40" : ""}>
      <div className="flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklch, ${meta.color} 18%, transparent)`, color: meta.color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold">{session.title}</p>
            {flagged && <Chip tone="warning">AI flag</Chip>}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {session.time} · {session.duration}min · vol {session.volume}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1">
            {session.exercises.slice(0, 4).map((e, i) => (
              <li key={i} className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                {e}
              </li>
            ))}
          </ul>
        </div>
        <button onClick={onDelete} className="rounded-lg p-2 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function AddSessionSheet({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (s: Omit<ScheduledSession, "id" | "date">) => void;
}) {
  const [type, setType] = useState<SessionType>("lift");
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("07:00");
  const [duration, setDuration] = useState(60);
  const [volume, setVolume] = useState(25);
  const [exercises, setExercises] = useState("");

  return (
    <Sheet open={open} onClose={onClose} title="New session">
      <div className="space-y-3">
        <div className="flex gap-1.5">
          {(Object.keys(typeMeta) as SessionType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 rounded-xl border py-2 text-[11px] font-semibold ${
                type === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              {typeMeta[t].label}
            </button>
          ))}
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Session title"
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-3 gap-2">
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm" />
          <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm" placeholder="min" />
          <input type="number" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm" placeholder="vol" />
        </div>
        <textarea
          value={exercises}
          onChange={(e) => setExercises(e.target.value)}
          placeholder="Exercises, one per line"
          rows={3}
          className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
        />
        <button
          disabled={!title.trim()}
          onClick={() =>
            onSubmit({
              type,
              title: title.trim(),
              time,
              duration,
              volume,
              exercises: exercises.split("\n").map((s) => s.trim()).filter(Boolean),
            })
          }
          className="w-full rounded-xl fx-gradient-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          Add to calendar
        </button>
      </div>
    </Sheet>
  );
}