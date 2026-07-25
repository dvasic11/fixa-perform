import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { exerciseDirectory, type Exercise } from "./mock-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type LiveSet = {
  id: string;
  load: number;      // kg
  reps: number;
  rpe: number;       // 1-10
  velocity: number;  // m/s (mean)
  adjusted?: boolean;
  clipUrl?: string;
};

export type BiomechanicalCue = {
  id: string;
  severity: "info" | "watch" | "fix";
  text: string;
};

export type MobilityRx = {
  id: string;
  joint: string;
  exercise: string;
  duration: number; // min
  source: string;   // which lift diagnosed it
  createdAt: number;
};

export type LiveExerciseEntry = {
  id: string;
  name: string;
  variationOf?: string;         // canonical lift id (from directory)
  plannedSets: number;
  plannedLoad: number;
  plannedReps: number;
  baselineVelocity: number;     // historical mean
  sets: LiveSet[];
  cues: BiomechanicalCue[];
  autoRegulated?: {
    drop: number;
    newLoad: number;
    newSets: number;
    reason: string;
  } | null;
};

export type FuelBoost = {
  carbs: number;   // g added to today's target
  protein: number; // g added to today's target
  reason: string;
  createdAt: number;
};

export type DeficitFlag = {
  kind: "elastic" | "strength";
  lift: string;
  detail: string;
  weeksTracked: number;
  driftPct: number;
  programShift: string;
};

export type LiveSession = {
  id: string;
  startedAt: number;
  elapsedSec: number;
  entries: LiveExerciseEntry[];
  ended: boolean;
};

type Ctx = {
  session: LiveSession | null;
  mobilityRx: MobilityRx[];
  fuelBoost: FuelBoost | null;
  deficit: DeficitFlag | null;
  start: () => void;
  end: () => void;
  addExercise: (name: string) => { ok: boolean; message: string; entryId?: string };
  logSet: (entryId: string, set: Omit<LiveSet, "id" | "adjusted">) => void;
  attachAnalysis: (
    entryId: string,
    setId: string,
    result: { cues: BiomechanicalCue[]; mobility: Omit<MobilityRx, "id" | "createdAt" | "source">[] },
  ) => void;
  clearMobility: (id: string) => void;
  resetFuel: () => void;
};

const LiveCtx = createContext<Ctx | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function LiveWorkoutProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [mobilityRx, setMobilityRx] = useState<MobilityRx[]>([]);
  const [fuelBoost, setFuelBoost] = useState<FuelBoost | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Live timer
  useEffect(() => {
    if (!session || session.ended) {
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }
    tickRef.current = setInterval(() => {
      setSession((s) =>
        s && !s.ended
          ? { ...s, elapsedSec: Math.round((Date.now() - s.startedAt) / 1000) }
          : s,
      );
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [session?.id, session?.ended]);

  const start = useCallback(() => {
    setSession({
      id: `ls_${Date.now()}`,
      startedAt: Date.now(),
      elapsedSec: 0,
      entries: [],
      ended: false,
    });
  }, []);

  const end = useCallback(() => {
    setSession((s) => (s ? { ...s, ended: true } : s));
  }, []);

  const addExercise: Ctx["addExercise"] = useCallback((name) => {
    const q = name.trim();
    if (!q) return { ok: false, message: "Type an exercise name." };
    const match = resolveVariation(q);
    if (!match.ok) return { ok: false, message: match.message };
    const canon = match.canonical;
    const baseline = canon
      ? canon.history
          .map((h) => h.velocity)
          .filter((v) => v > 0)
          .slice(-5)
          .reduce((a, b, _, arr) => a + b / arr.length, 0)
      : 0.5;
    const last = canon?.history[canon.history.length - 1];
    const entryId = `le_${Date.now()}`;
    const entry: LiveExerciseEntry = {
      id: entryId,
      name: q,
      variationOf: canon?.id,
      plannedSets: 5,
      plannedLoad: last?.weight ?? 60,
      plannedReps: 5,
      baselineVelocity: baseline || 0.5,
      sets: [],
      cues: [],
      autoRegulated: null,
    };
    setSession((s) => (s ? { ...s, entries: [...s.entries, entry] } : s));
    return { ok: true, message: match.message, entryId };
  }, []);

  const logSet: Ctx["logSet"] = useCallback((entryId, set) => {
    setSession((s) => {
      if (!s) return s;
      const entries = s.entries.map((e) => {
        if (e.id !== entryId) return e;
        const first = e.sets.length === 0;
        const drop = e.baselineVelocity > 0
          ? ((e.baselineVelocity - set.velocity) / e.baselineVelocity) * 100
          : 0;
        const rpeSpike = set.rpe >= 9;
        let entry = { ...e, sets: [...e.sets, { ...set, id: `s_${Date.now()}` }] };
        if (first && (drop >= 10 || rpeSpike) && !e.autoRegulated) {
          const newLoad = Math.round(set.load * 0.88);
          const newSets = Math.max(2, e.plannedSets - 2);
          entry = {
            ...entry,
            plannedLoad: newLoad,
            plannedSets: newSets,
            autoRegulated: {
              drop: Math.round(drop),
              newLoad,
              newSets,
              reason: rpeSpike
                ? `RPE ${set.rpe} on set 1 — CNS load too high.`
                : `Set 1 velocity ${drop.toFixed(0)}% below baseline.`,
            },
            sets: entry.sets.map((x, i) => (i === entry.sets.length - 1 ? { ...x, adjusted: true } : x)),
          };
          // Recovery-fuel loop: bump post-workout carbs + protein
          setFuelBoost({
            carbs: 40,
            protein: 15,
            reason: `Autoregulation on ${e.name} — added 40g carbs + 15g protein to accelerate neuro-muscular recovery.`,
            createdAt: Date.now(),
          });
        }
        return entry;
      });
      return { ...s, entries };
    });
  }, []);

  const attachAnalysis: Ctx["attachAnalysis"] = useCallback((entryId, setId, result) => {
    let liftName = "";
    setSession((s) => {
      if (!s) return s;
      const entries = s.entries.map((e) => {
        if (e.id !== entryId) return e;
        liftName = e.name;
        return {
          ...e,
          cues: [...e.cues, ...result.cues],
          sets: e.sets.map((x) => (x.id === setId ? { ...x, clipUrl: "local://analyzed" } : x)),
        };
      });
      return { ...s, entries };
    });
    if (result.mobility.length) {
      const stamp = Date.now();
      setMobilityRx((rx) => [
        ...rx,
        ...result.mobility.map((m, i) => ({
          ...m,
          id: `mrx_${stamp}_${i}`,
          createdAt: stamp,
          source: liftName,
        })),
      ]);
    }
  }, []);

  const clearMobility = useCallback((id: string) => {
    setMobilityRx((rx) => rx.filter((m) => m.id !== id));
  }, []);

  const resetFuel = useCallback(() => setFuelBoost(null), []);

  // Multi-week deficit detector — pure derived read of directory history.
  const deficit = useMemo<DeficitFlag | null>(() => detectDeficit(), []);

  const value = useMemo<Ctx>(
    () => ({
      session,
      mobilityRx,
      fuelBoost,
      deficit,
      start,
      end,
      addExercise,
      logSet,
      attachAnalysis,
      clearMobility,
      resetFuel,
    }),
    [session, mobilityRx, fuelBoost, deficit, start, end, addExercise, logSet, attachAnalysis, clearMobility, resetFuel],
  );

  return <LiveCtx.Provider value={value}>{children}</LiveCtx.Provider>;
}

export function useLiveWorkout() {
  const c = useContext(LiveCtx);
  if (!c) throw new Error("useLiveWorkout must be used inside LiveWorkoutProvider");
  return c;
}

// ---------------------------------------------------------------------------
// Variation validation — bridge to exercise directory
// ---------------------------------------------------------------------------
function resolveVariation(q: string): { ok: boolean; message: string; canonical?: Exercise } {
  const s = q.toLowerCase();
  const canon = exerciseDirectory.find(
    (e) => s.includes(e.name.toLowerCase()) || e.name.toLowerCase().includes(s),
  );
  if (canon) {
    // e.g. "Heel-Elevated Safety Bar Squat" contains "squat"
    return {
      ok: true,
      message: `Locked variation → ${q}. Blueprint anchored to ${canon.name} biomechanics.`,
      canonical: canon,
    };
  }
  // Accept common athletic keywords even without a canonical anchor.
  const anchors = ["squat", "deadlift", "press", "clean", "row", "jump", "lunge", "pull", "hinge"];
  if (anchors.some((a) => s.includes(a))) {
    return {
      ok: true,
      message: `Variation registered → ${q}. Generic blueprint used until first video.`,
    };
  }
  return { ok: false, message: `Unknown exercise "${q}". Add an anchor (squat, deadlift, jump…).` };
}

// ---------------------------------------------------------------------------
// Neuromuscular deficit detector
// ---------------------------------------------------------------------------
function detectDeficit(): DeficitFlag | null {
  // Squat: absolute load holding but mean velocity trending down for 4+ weeks
  const squat = exerciseDirectory.find((e) => e.id === "ex_squat");
  if (!squat) return null;
  const h = squat.history;
  if (h.length < 4) return null;
  const first = h[h.length - 4].velocity;
  const last = h[h.length - 1].velocity;
  const drift = ((last - first) / first) * 100;
  if (drift <= -5) {
    // Cross-check depth-jump RFD for elastic component
    const dj = exerciseDirectory.find((e) => e.id === "ex_depth");
    const rfdDrift = dj
      ? ((dj.history[dj.history.length - 1].rfd - dj.history[dj.history.length - 4].rfd) /
          dj.history[dj.history.length - 4].rfd) *
        100
      : 0;
    if (rfdDrift <= -5) {
      return {
        kind: "elastic",
        lift: "Back Squat / Depth Jump",
        detail: `Bar velocity ${drift.toFixed(0)}% + RFD ${rfdDrift.toFixed(0)}% over 4 weeks — tendon stiffness / reactive strength is under-expressed.`,
        weeksTracked: 4,
        driftPct: Math.round(drift),
        programShift:
          "Cut heavy absolute-strength volume 35%. Insert 3× plyometric blocks/week: depth jumps 4×5, pogo hops 5×20, trap-bar jump squats 5×3 @ 30% 1RM · max intent.",
      };
    }
    return {
      kind: "strength",
      lift: "Back Squat",
      detail: `Bar velocity ${drift.toFixed(0)}% at held load — absolute force production is capping. RFD stable.`,
      weeksTracked: 4,
      driftPct: Math.round(drift),
      programShift:
        "Shift to mechanical-tension block: 4×6 @ 78-82% 1RM tempo 3-1-1 for 3 weeks. Auxiliary: pause squats, front-squat cluster sets.",
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}