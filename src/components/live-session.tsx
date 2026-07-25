import { useMemo, useState } from "react";
import { Sheet, Chip } from "@/components/ui-bits";
import {
  useLiveWorkout,
  formatElapsed,
  type LiveExerciseEntry,
} from "@/lib/live-workout";
import { analyzeLiftVideo, findVariation } from "@/lib/gemini-analysis";
import {
  Timer,
  Plus,
  Search,
  AlertTriangle,
  Sparkles,
  Video,
  CheckCircle2,
  Zap,
  Radio,
  X,
} from "lucide-react";

export function LiveSessionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { session, addExercise, end } = useLiveWorkout();
  const [q, setQ] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const preview = useMemo(() => (q.length >= 3 ? findVariation(q) : null), [q]);

  const submit = () => {
    const res = addExercise(q);
    setFeedback(res);
    if (res.ok) setQ("");
  };

  return (
    <Sheet open={open} onClose={onClose} title="Live Workout">
      <div className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
        {/* Timer */}
        <div className="flex items-center justify-between rounded-2xl border border-primary/40 bg-primary/10 p-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live</span>
          </div>
          <div className="flex items-center gap-2 text-2xl font-black tabular-nums">
            <Timer className="h-5 w-5 text-primary" />
            {formatElapsed(session?.elapsedSec ?? 0)}
          </div>
        </div>

        {/* Add exercise / variation search */}
        <div className="rounded-2xl border border-border bg-surface-elevated/60 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Add exercise · specific variation
          </p>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-background px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Heel-Elevated Safety Bar Squat…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
            <button
              onClick={submit}
              className="rounded-xl fx-gradient-primary px-3 text-xs font-bold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {preview && (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-primary">
              <Sparkles className="h-3 w-3" /> Blueprint match: {preview.name} · ankle {preview.jointAngles.ankleDorsiflexion}° · hip {preview.jointAngles.hipFlexion}°
            </p>
          )}
          {feedback && (
            <p className={`mt-2 text-[11px] ${feedback.ok ? "text-primary" : "text-[color:var(--color-accent-orange)]"}`}>
              {feedback.message}
            </p>
          )}
        </div>

        {/* Exercise entries */}
        {(session?.entries.length ?? 0) === 0 ? (
          <p className="rounded-2xl bg-muted/40 p-6 text-center text-xs text-muted-foreground">
            No exercises yet — search a variation above to begin.
          </p>
        ) : (
          session!.entries.map((entry) => <ExerciseBlock key={entry.id} entry={entry} />)
        )}

        <button
          onClick={() => {
            end();
            onClose();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground"
        >
          <Radio className="h-4 w-4" /> End session
        </button>
      </div>
    </Sheet>
  );
}

function ExerciseBlock({ entry }: { entry: LiveExerciseEntry }) {
  const { logSet, attachAnalysis } = useLiveWorkout();
  const [load, setLoad] = useState(entry.plannedLoad);
  const [reps, setReps] = useState(entry.plannedReps);
  const [rpe, setRpe] = useState(7);
  const [vel, setVel] = useState(entry.baselineVelocity);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const uploadClip = async (setId: string) => {
    setAnalyzing(setId);
    const res = await analyzeLiftVideo(entry.name);
    attachAnalysis(entry.id, setId, { cues: res.cues, mobility: res.mobility });
    setAnalyzing(null);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface-elevated/60 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-black">{entry.name}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            baseline {entry.baselineVelocity.toFixed(2)} m/s · plan {entry.plannedSets}×{entry.plannedReps} @ {entry.plannedLoad}kg
          </p>
        </div>
        {entry.autoRegulated && <Chip tone="warning">auto-reg</Chip>}
      </div>

      {entry.autoRegulated && (
        <div className="mb-2 flex items-start gap-2 rounded-xl border border-[oklch(0.65_0.18_60)]/40 bg-[oklch(0.78_0.18_55/0.1)] p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.85_0.18_75)]" />
          <div className="text-[11px] leading-relaxed">
            <p className="font-bold text-[oklch(0.85_0.18_75)]">Autoregulation triggered</p>
            <p className="text-muted-foreground">{entry.autoRegulated.reason}</p>
            <p className="mt-1">
              Load → <b>{entry.autoRegulated.newLoad}kg</b> · remaining sets trimmed to <b>{entry.autoRegulated.newSets}</b>.
              Fuel loop bumped +40g carbs / +15g protein.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        <NumIn label="Load" value={load} onChange={setLoad} suffix="kg" />
        <NumIn label="Reps" value={reps} onChange={setReps} />
        <NumIn label="Vel" value={vel} onChange={setVel} step={0.01} suffix="m/s" />
        <NumIn label="RPE" value={rpe} onChange={setRpe} step={0.5} />
      </div>
      <button
        onClick={() => logSet(entry.id, { load, reps, rpe, velocity: vel })}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground"
      >
        <Plus className="h-3.5 w-3.5" /> Log set {entry.sets.length + 1}
      </button>

      {entry.sets.length > 0 && (
        <div className="mt-2 space-y-1">
          {entry.sets.map((s, i) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2 text-[11px]">
              <span className="font-semibold">Set {i + 1}</span>
              <span className="tabular-nums text-muted-foreground">
                {s.load}kg · {s.reps}r · {s.velocity.toFixed(2)} m/s · RPE {s.rpe}
              </span>
              <button
                onClick={() => uploadClip(s.id)}
                disabled={!!analyzing}
                className="ml-2 flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1 text-[10px] font-bold text-primary disabled:opacity-50"
              >
                {analyzing === s.id ? (
                  <>
                    <Zap className="h-3 w-3 animate-pulse" /> Gemini…
                  </>
                ) : s.clipUrl ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Scanned
                  </>
                ) : (
                  <>
                    <Video className="h-3 w-3" /> Analyze
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {entry.cues.length > 0 && (
        <div className="mt-2 space-y-1 rounded-xl bg-muted/40 p-3 text-[11px]">
          <p className="mb-1 flex items-center gap-1.5 font-bold text-primary">
            <Sparkles className="h-3 w-3" /> Gemini Flash corrective cues
          </p>
          {entry.cues.map((c) => (
            <p key={c.id} className="text-muted-foreground">
              <span
                className={
                  c.severity === "fix"
                    ? "font-bold text-[oklch(0.85_0.18_75)]"
                    : c.severity === "watch"
                      ? "font-bold text-[color:var(--color-accent-orange)]"
                      : "font-bold text-primary"
                }
              >
                • {c.severity.toUpperCase()}
              </span>{" "}
              {c.text}
            </p>
          ))}
          <p className="mt-1 flex items-center gap-1 text-[10px] text-primary">
            <X className="h-3 w-3" /> Mobility Rx injected into Recover tab
          </p>
        </div>
      )}
    </div>
  );
}

function NumIn({
  label,
  value,
  onChange,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
        {suffix ? ` (${suffix})` : ""}
      </span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm tabular-nums outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}