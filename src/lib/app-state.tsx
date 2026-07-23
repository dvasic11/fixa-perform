import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ActivityLevel = "sedentary" | "light" | "moderate" | "high" | "elite";
export type GoalKind =
  | "vertical_jump"
  | "muscle_gain"
  | "fat_loss"
  | "power_output"
  | "power_to_weight";

export type FacilityKey = "full_gym" | "home_gym" | "court" | "field" | "bands_only";

export type BodyMetrics = {
  height: number; // cm
  weight: number; // kg
  age: number;
  activity: ActivityLevel;
  bodyFat?: number; // % (from AI scan or manual)
  leanMass?: number; // kg
  scanSource?: "manual" | "ai_scan";
};

export type GoalPlan = {
  kind: GoalKind;
  label: string;
  currentValue: number; // starting metric
  targetValue: number; // user-requested target
  aiRealisticTarget: number; // AI-adjusted realistic target
  unit: string;
  deadline: string; // ISO date
  event: string; // e.g. "Regional Camp"
  stressLevel: number; // 1-10
  hoursPerWeek: number;
  facilities: FacilityKey[];
  verdict: "achievable" | "aggressive" | "unsafe";
  aiRationale: string;
};

export type SessionType = "court" | "lift" | "recovery" | "conditioning";

export type ScheduledSession = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: SessionType;
  title: string;
  duration: number; // minutes
  volume: number; // arbitrary load units — used by volume guard
  exercises: string[];
  notes?: string;
  aiFlag?: string | null;
};

export type ChatAgent = "coach" | "nutritionist";

export type ChatMessage = {
  id: string;
  agent: ChatAgent | "user";
  text: string;
  timestamp: number;
  actions?: Array<{
    id: string;
    label: string;
    kind: "swap_exercise" | "update_goal" | "add_session" | "shift_macros" | "delete_session";
    payload: Record<string, unknown>;
  }>;
};

export type MacroTargets = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
export type AppState = {
  onboarded: boolean;
  body: BodyMetrics;
  goal: GoalPlan | null;
  schedule: ScheduledSession[];
  chatCoach: ChatMessage[];
  chatNutrition: ChatMessage[];
  macros: MacroTargets;
  plan: "free" | "premium";
};

const START_OF_WEEK = () => {
  const d = new Date();
  const day = d.getDay(); // 0 sun
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d;
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

const defaultSchedule = (): ScheduledSession[] => {
  const monday = START_OF_WEEK();
  const at = (offset: number) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offset);
    return iso(d);
  };
  return [
    { id: "s1", date: at(0), time: "07:00", type: "lift",       title: "Lower · Squat + RDL",           duration: 75, volume: 42, exercises: ["Back Squat 5×5", "RDL 4×6", "Pogo hops 5×20"] },
    { id: "s2", date: at(1), time: "17:30", type: "court",      title: "Team practice",                 duration: 120, volume: 30, exercises: ["3v3", "Shooting", "Defense drills"] },
    { id: "s3", date: at(2), time: "07:00", type: "lift",       title: "Upper · Press + Pull",          duration: 60, volume: 28, exercises: ["Bench 4×5", "Chin-ups 4×6", "Row 3×10"] },
    { id: "s4", date: at(3), time: "17:30", type: "court",      title: "Skill session",                 duration: 90, volume: 22, exercises: ["Finishing", "Pick & roll"] },
    { id: "s5", date: at(4), time: "07:00", type: "lift",       title: "Power · Cleans + Jumps",        duration: 70, volume: 40, exercises: ["Power Clean 6×2", "Depth Jump 4×5", "Split Squat 3×6"] },
    { id: "s6", date: at(5), time: "10:00", type: "recovery",   title: "Mobility + soft tissue",        duration: 40, volume: 4,  exercises: ["Foam roll", "90/90 hip flow", "Nordic 3×5"] },
    { id: "s7", date: at(6), time: "10:00", type: "conditioning", title: "Aerobic base run",            duration: 30, volume: 12, exercises: ["Zone 2 run 25min"] },
  ];
};

const defaults: AppState = {
  onboarded: false,
  body: { height: 192, weight: 85, age: 17, activity: "elite", bodyFat: 12.4, leanMass: 74.5, scanSource: "manual" },
  goal: {
    kind: "vertical_jump",
    label: "Vertical jump +8 cm",
    currentValue: 78,
    targetValue: 90,
    aiRealisticTarget: 86,
    unit: "cm",
    deadline: iso(new Date(Date.now() + 1000 * 60 * 60 * 24 * 84)),
    event: "Regional camp · pre-season",
    stressLevel: 6,
    hoursPerWeek: 10,
    facilities: ["full_gym", "court"],
    verdict: "aggressive",
    aiRationale:
      "12 weeks · 10 h/wk · life-stress 6/10 · full gym + court access. Empirical CMJ gains for guards on structured RFD blocks average +6-9 cm over 12 weeks. Your requested +12 cm sits above the physiological 95th percentile — target trimmed to +8 cm to keep the program achievable without CNS overreach.",
  },
  schedule: defaultSchedule(),
  chatCoach: [
    {
      id: "seed1",
      agent: "coach",
      timestamp: Date.now(),
      text: "I'm your S&C agent. I see your calendar, lifts, and stress logs. Ask me to swap exercises, adjust volume, or explain the plan.",
    },
  ],
  chatNutrition: [
    {
      id: "seed2",
      agent: "nutritionist",
      timestamp: Date.now(),
      text: "Nutritionist here. I have your macros, training load and body-comp goal. Tell me if hunger, energy, or timing feels off — I can retune the plan live.",
    },
  ],
  macros: { kcal: 2850, protein: 190, carbs: 320, fat: 85 },
  plan: "free",
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
type Ctx = {
  state: AppState;
  update: (partial: Partial<AppState>) => void;
  setBody: (b: Partial<BodyMetrics>) => void;
  setGoal: (g: GoalPlan) => void;
  addSession: (s: Omit<ScheduledSession, "id">) => void;
  updateSession: (id: string, patch: Partial<ScheduledSession>) => void;
  deleteSession: (id: string) => void;
  pushMessage: (thread: ChatAgent, msg: ChatMessage) => void;
  executeAction: (thread: ChatAgent, msgId: string, actionId: string) => string;
  shiftMacros: (delta: Partial<MacroTargets>) => void;
  markOnboarded: () => void;
};

const AppStateContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "fixa.appstate.v1";

function loadInitial(): AppState {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<AppState>) };
  } catch {
    return defaults;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaults);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadInitial());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota */
    }
  }, [state, hydrated]);

  const value = useMemo<Ctx>(() => {
    const update = (partial: Partial<AppState>) =>
      setState((s) => ({ ...s, ...partial }));

    return {
      state,
      update,
      setBody: (b) => setState((s) => ({ ...s, body: { ...s.body, ...b } })),
      setGoal: (g) => setState((s) => ({ ...s, goal: g })),
      addSession: (s0) =>
        setState((s) => ({
          ...s,
          schedule: [...s.schedule, { ...s0, id: `s_${Date.now()}` }],
        })),
      updateSession: (id, patch) =>
        setState((s) => ({
          ...s,
          schedule: s.schedule.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      deleteSession: (id) =>
        setState((s) => ({ ...s, schedule: s.schedule.filter((x) => x.id !== id) })),
      pushMessage: (thread, msg) =>
        setState((s) => ({
          ...s,
          [thread === "coach" ? "chatCoach" : "chatNutrition"]: [
            ...(thread === "coach" ? s.chatCoach : s.chatNutrition),
            msg,
          ],
        })),
      shiftMacros: (delta) =>
        setState((s) => ({
          ...s,
          macros: {
            kcal: s.macros.kcal + (delta.kcal ?? 0),
            protein: s.macros.protein + (delta.protein ?? 0),
            carbs: s.macros.carbs + (delta.carbs ?? 0),
            fat: s.macros.fat + (delta.fat ?? 0),
          },
        })),
      markOnboarded: () => setState((s) => ({ ...s, onboarded: true })),
      executeAction: (thread, msgId, actionId) => {
        let report = "Action executed.";
        setState((s) => {
          const key = thread === "coach" ? "chatCoach" : "chatNutrition";
          const msgs = s[key];
          const msg = msgs.find((m) => m.id === msgId);
          const action = msg?.actions?.find((a) => a.id === actionId);
          if (!action) return s;
          let next = s;
          switch (action.kind) {
            case "swap_exercise": {
              const from = String(action.payload.from);
              const to = String(action.payload.to);
              const schedule = s.schedule.map((sess) => ({
                ...sess,
                exercises: sess.exercises.map((e) =>
                  e.toLowerCase().includes(from.toLowerCase())
                    ? e.replace(new RegExp(from, "i"), to)
                    : e,
                ),
              }));
              next = { ...s, schedule };
              report = `Swapped ${from} → ${to} across this week's schedule.`;
              break;
            }
            case "update_goal": {
              if (!s.goal) break;
              const newTarget = Number(action.payload.newTarget ?? s.goal.aiRealisticTarget);
              next = {
                ...s,
                goal: { ...s.goal, aiRealisticTarget: newTarget, targetValue: newTarget, verdict: "achievable" },
              };
              report = `Goal updated to ${newTarget}${s.goal.unit}.`;
              break;
            }
            case "add_session": {
              const sess: ScheduledSession = {
                id: `s_${Date.now()}`,
                date: String(action.payload.date),
                time: String(action.payload.time ?? "07:00"),
                type: (action.payload.type as SessionType) ?? "lift",
                title: String(action.payload.title ?? "New session"),
                duration: Number(action.payload.duration ?? 60),
                volume: Number(action.payload.volume ?? 20),
                exercises: (action.payload.exercises as string[]) ?? [],
              };
              next = { ...s, schedule: [...s.schedule, sess] };
              report = `Added "${sess.title}" to ${sess.date}.`;
              break;
            }
            case "delete_session": {
              const id = String(action.payload.id);
              next = { ...s, schedule: s.schedule.filter((x) => x.id !== id) };
              report = `Removed session.`;
              break;
            }
            case "shift_macros": {
              const delta = action.payload as Partial<MacroTargets>;
              next = {
                ...s,
                macros: {
                  kcal: s.macros.kcal + (delta.kcal ?? 0),
                  protein: s.macros.protein + (delta.protein ?? 0),
                  carbs: s.macros.carbs + (delta.carbs ?? 0),
                  fat: s.macros.fat + (delta.fat ?? 0),
                },
              };
              report = `Macros shifted: ${Object.entries(delta)
                .map(([k, v]) => `${k} ${v! > 0 ? "+" : ""}${v}`)
                .join(", ")}.`;
              break;
            }
          }
          // Mark action executed by removing it from the message
          const updatedMsgs = msgs.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  actions: (m.actions ?? []).map((a) =>
                    a.id === actionId ? { ...a, label: `✓ ${a.label}` } : a,
                  ),
                }
              : m,
          );
          const receipt: ChatMessage = {
            id: `r_${Date.now()}`,
            agent: thread,
            timestamp: Date.now(),
            text: `Done — ${report}`,
          };
          return {
            ...next,
            [key]: [...updatedMsgs, receipt],
          };
        });
        return report;
      },
    };
  }, [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Derived intelligence (placeholder AI logic)
// ---------------------------------------------------------------------------
export function computeOnTrackScore(state: AppState): {
  score: number; // 0-100
  band: "Ahead" | "On Track" | "Behind" | "At Risk";
  weeklyVolume: number;
  targetVolume: number;
  daysRemaining: number;
  progressPct: number;
} {
  const weeklyVolume = state.schedule.reduce((sum, s) => sum + s.volume, 0);
  const targetVolume = Math.round((state.goal?.hoursPerWeek ?? 8) * 18);
  const daysRemaining = state.goal
    ? Math.max(1, Math.round((new Date(state.goal.deadline).getTime() - Date.now()) / 86_400_000))
    : 84;

  const volumeFit = Math.max(0, 100 - Math.abs(weeklyVolume - targetVolume) * 2);
  const timeFit = Math.min(100, (daysRemaining / 84) * 100 + 40);
  const score = Math.round(volumeFit * 0.55 + timeFit * 0.45);
  const band: "Ahead" | "On Track" | "Behind" | "At Risk" =
    score >= 85 ? "Ahead" : score >= 70 ? "On Track" : score >= 55 ? "Behind" : "At Risk";

  const progressPct = state.goal
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((state.goal.currentValue - 0) / (state.goal.aiRealisticTarget || 1)) * 100,
          ),
        ),
      )
    : 0;

  return { score, band, weeklyVolume, targetVolume, daysRemaining, progressPct };
}

export function scanVolumeGuard(state: AppState): Array<{
  sessionId: string;
  severity: "info" | "warn" | "high";
  message: string;
  suggestion: string;
}> {
  const flags: ReturnType<typeof scanVolumeGuard> = [];
  const heavyLiftDays = state.schedule.filter((s) => s.type === "lift" && s.volume >= 35);
  if (heavyLiftDays.length >= 3) {
    heavyLiftDays.slice(2).forEach((s) => {
      flags.push({
        sessionId: s.id,
        severity: "high",
        message: "3rd+ heavy compound day this week — CNS overreach risk.",
        suggestion: "Convert to a speed / velocity day (30-40% 1RM, max intent).",
      });
    });
  }

  // Consecutive high-load days
  const sorted = [...state.schedule].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (a.volume >= 30 && b.volume >= 30 && a.date !== b.date) {
      const diff =
        (new Date(b.date).getTime() - new Date(a.date).getTime()) / 86_400_000;
      if (diff <= 1) {
        flags.push({
          sessionId: b.id,
          severity: "warn",
          message: `Back-to-back high-load days (${a.title} → ${b.title}).`,
          suggestion: "Insert a mobility or Z2 slot between them.",
        });
      }
    }
  }

  // Missing recovery
  if (!state.schedule.some((s) => s.type === "recovery")) {
    flags.push({
      sessionId: "none",
      severity: "warn",
      message: "No recovery block scheduled this week.",
      suggestion: "Add a 40-min mobility + soft-tissue slot on your lightest day.",
    });
  }

  return flags;
}