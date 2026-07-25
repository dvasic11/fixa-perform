// ---------------------------------------------------------------------------
// Gemini 1.5 Flash video analysis — scaffold
// ---------------------------------------------------------------------------
// This module is prepared for the Lovable AI Gateway (google/gemini-3.6-flash
// route) with a multimodal request payload containing the exercise variation
// blueprint + uploaded clip. Until wiring is enabled, `analyzeLiftVideo`
// returns a deterministic mocked payload that mirrors the real response shape.
//
// Real call shape (server-side, do NOT expose LOVABLE_API_KEY client-side):
//   POST https://ai.gateway.lovable.dev/v1/chat/completions
//   Header: Lovable-API-Key: process.env.LOVABLE_API_KEY
//   Body:
//     {
//       model: "google/gemini-3.6-flash",
//       messages: [
//         { role: "system", content: SYSTEM_PROMPT },
//         { role: "user", content: [
//             { type: "text", text: `Analyze this ${variation} set. Blueprint: ${JSON.stringify(blueprint)}` },
//             { type: "image_url", image_url: { url: "<signed video frame or clip>" } },
//         ]},
//       ],
//     }

import type { BiomechanicalCue, MobilityRx } from "./live-workout";

export type VariationBlueprint = {
  id: string;
  name: string;
  jointAngles: {
    ankleDorsiflexion: number;
    kneeFlexion: number;
    hipFlexion: number;
    torsoLean: number;
  };
  focusChecks: string[];
};

export const variationLibrary: VariationBlueprint[] = [
  {
    id: "heel_elev_sb_squat",
    name: "Heel-Elevated Safety Bar Squat",
    jointAngles: { ankleDorsiflexion: 35, kneeFlexion: 130, hipFlexion: 120, torsoLean: 18 },
    focusChecks: ["torso stays vertical", "no heel lift", "knees track over toes"],
  },
  {
    id: "deficit_tb_dl",
    name: "Deficit Trap-Bar Deadlift",
    jointAngles: { ankleDorsiflexion: 30, kneeFlexion: 115, hipFlexion: 105, torsoLean: 42 },
    focusChecks: ["neutral spine", "hips travel back before bar leaves floor", "no early spinal flexion"],
  },
  {
    id: "front_squat_pause",
    name: "Front Squat · 2s Pause",
    jointAngles: { ankleDorsiflexion: 32, kneeFlexion: 132, hipFlexion: 110, torsoLean: 8 },
    focusChecks: ["upright torso", "elbows high", "no butt-wink at depth"],
  },
  {
    id: "b_stance_rdl",
    name: "B-Stance Romanian Deadlift",
    jointAngles: { ankleDorsiflexion: 18, kneeFlexion: 25, hipFlexion: 95, torsoLean: 55 },
    focusChecks: ["hips hinge, not squat", "loaded side glute engages", "shin vertical"],
  },
];

export function findVariation(query: string): VariationBlueprint | null {
  const q = query.toLowerCase();
  return (
    variationLibrary.find((v) => v.name.toLowerCase() === q) ??
    variationLibrary.find((v) => q.includes(v.name.toLowerCase())) ??
    variationLibrary.find((v) => v.name.toLowerCase().includes(q)) ??
    null
  );
}

export type AnalysisResult = {
  cues: BiomechanicalCue[];
  mobility: Omit<MobilityRx, "id" | "createdAt" | "source">[];
  formScore: number;
};

// Deterministic mock — real implementation swaps in the gateway fetch above.
export async function analyzeLiftVideo(
  variationName: string,
  _clip?: Blob,
): Promise<AnalysisResult> {
  await new Promise((r) => setTimeout(r, 1400));
  const bp = findVariation(variationName);
  const s = variationName.toLowerCase();

  // Heuristic mock — mirrors the mobility → cue chain a coach would call.
  if (s.includes("squat")) {
    return {
      formScore: 82,
      cues: [
        { id: "c1", severity: "fix",   text: "Heel lift detected at 68% depth — ankle dorsiflexion capped at ~24° (blueprint expects 32°+)." },
        { id: "c2", severity: "watch", text: "Slight right-knee valgus on ascent — reinforce 'spread the floor' cue." },
        { id: "c3", severity: "info",  text: `Bar-path drift 3cm forward · ${bp ? `checked against ${bp.name} blueprint` : "generic squat blueprint"}.` },
      ],
      mobility: [
        { joint: "Ankle · dorsiflexion",  exercise: "Weighted heel-to-wall 3×10 + banded talus mob", duration: 8 },
        { joint: "Hip · adductors",       exercise: "90/90 breathing + Cossack squat 3×5/side",       duration: 6 },
      ],
    };
  }
  if (s.includes("deadlift") || s.includes("hinge")) {
    return {
      formScore: 78,
      cues: [
        { id: "c1", severity: "fix",   text: "Lumbar flexion off floor — hips shot up first. Blueprint: hips travel back before bar breaks." },
        { id: "c2", severity: "watch", text: "Bar drifts 4cm from shin at knee-pass." },
      ],
      mobility: [
        { joint: "Hip · hamstring length", exercise: "Jefferson curl 3×5 (light) + supine 90/90 stretch", duration: 7 },
        { joint: "T-spine · extension",    exercise: "Foam-roller peanut extensions 3×8",                duration: 5 },
      ],
    };
  }
  if (s.includes("clean") || s.includes("jump") || s.includes("power")) {
    return {
      formScore: 84,
      cues: [
        { id: "c1", severity: "watch", text: "Early arm bend in 2nd pull — bar loops away from body." },
        { id: "c2", severity: "info",  text: "Triple extension is clean · hip velocity 2.1 m/s." },
      ],
      mobility: [
        { joint: "Thoracic · rotation", exercise: "Open-book 3×8/side", duration: 5 },
      ],
    };
  }
  return {
    formScore: 80,
    cues: [
      { id: "c1", severity: "info", text: `Analyzed against ${bp?.name ?? "generic"} blueprint · no critical flags.` },
    ],
    mobility: [],
  };
}

// ---------------------------------------------------------------------------
// Per-meal AI Nutrition Score (0-100)
// ---------------------------------------------------------------------------
export type Meal = {
  id: string;
  name: string;
  time: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  tag: string;
};

export type MealScore = {
  score: number;
  timing: number;
  macros: number;
  note: string;
};

export function scoreMeal(
  meal: Meal,
  ctx: {
    goal: "lean_down" | "gain_mass" | "maintain";
    workoutTime?: string; // "HH:MM"
  },
): MealScore {
  // Macro alignment vs goal
  const total = meal.p * 4 + meal.c * 4 + meal.f * 9 || 1;
  const pPct = (meal.p * 4) / total;
  const cPct = (meal.c * 4) / total;
  const fPct = (meal.f * 9) / total;

  const target =
    ctx.goal === "lean_down"    ? { p: 0.35, c: 0.4,  f: 0.25 }
  : ctx.goal === "gain_mass"    ? { p: 0.25, c: 0.5,  f: 0.25 }
                                : { p: 0.3,  c: 0.45, f: 0.25 };
  const macroDelta =
    Math.abs(pPct - target.p) + Math.abs(cPct - target.c) + Math.abs(fPct - target.f);
  const macros = Math.max(0, Math.round(100 - macroDelta * 130));

  // Timing
  const mealMin = toMin(meal.time);
  const wkMin = ctx.workoutTime ? toMin(ctx.workoutTime) : null;
  let timing = 70;
  let timingNote = "";
  if (wkMin !== null) {
    const diff = wkMin - mealMin; // positive = before workout
    if (diff >= 90 && diff <= 180) {
      // pre-workout window — reward carbs
      timing = cPct > 0.5 ? 96 : cPct > 0.35 ? 82 : 55;
      timingNote = `pre-workout window (${ctx.workoutTime})`;
    } else if (diff <= 0 && diff >= -90) {
      // post-workout window — reward protein + carbs
      timing = pPct > 0.3 && cPct > 0.35 ? 94 : pPct > 0.25 ? 80 : 60;
      timingNote = "post-workout recovery window";
    } else if (diff > 180 && diff <= 360) {
      timing = 78;
      timingNote = "steady daytime meal";
    } else if (diff < -90 && diff > -240) {
      timing = fPct > 0.35 ? 88 : 72;
      timingNote = "evening refuel";
    } else {
      timing = 68;
      timingNote = "outside performance window";
    }
  }

  const score = Math.round(macros * 0.55 + timing * 0.45);
  const note = `${score}/100 · ${describe(score)} ${timingNote ? `· ${timingNote}` : ""}`;
  return { score, timing, macros, note };
}

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function describe(s: number): string {
  if (s >= 90) return "Elite timing + macros";
  if (s >= 75) return "Solid alignment";
  if (s >= 60) return "Workable — small tweak available";
  return "Off-window — retune next meal";
}

export function scoreColor(s: number): string {
  if (s >= 85) return "var(--color-primary)";
  if (s >= 70) return "var(--color-accent-blue)";
  if (s >= 55) return "var(--color-accent-orange)";
  return "oklch(0.7 0.2 25)";
}