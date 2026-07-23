// FIXA — Dynamic Athletic Intelligence Engine mock data
// Fluid, context-aware model — mirrors a real head coach's reasoning.
// Fuses lifts (VBT + ROM + RFD) · jumps · nutrition · sleep · subjective wellness
// Athlete: Alex Rivera, 17, 192cm / 85kg, PG/SG, Riverside Elite U18

// ============================================================================
// SCHEMA (mirrors intended Supabase tables)
// ============================================================================
// profiles           (id, name, dob, height_cm, weight_kg, body_fat_pct,
//                     sport, position, goal, plan)
// video_lifts        (id, user_id, lift, video_url, date, load_kg, reps,
//                     peak_velocity_mps, mean_velocity_mps, bar_path_score,
//                     form_score, estimated_1rm, weaknesses[])
// jump_logs          (id, user_id, date, type, height_cm, contact_ms,
//                     rsi, force_index, l_stability, r_stability)
// nutrition_logs     (id, user_id, date, kcal, protein_g, carbs_g, fat_g,
//                     water_l, meals[])
// sleep_logs         (id, user_id, date, hours, quality_pct, hrv_ms,
//                     resting_hr, soreness_1_10)
// recommendations    (id, user_id, generated_at, readiness_pct,
//                     bottlenecks[], priorities[], nutrition_directive,
//                     recovery_directive, exercise_rx[])
// ============================================================================

export type Goal = "lean_down" | "gain_mass" | "maintain";
export type Direction = "up" | "down" | "hold";
export type Domain = "program" | "nutrition" | "prehab" | "coaching";
export type Severity = "info" | "watch" | "high";

export const athlete = {
  id: "u_alex",
  name: "Alex Rivera",
  age: 17,
  dob: "2008-04-12",
  height: 192,
  weight: 85,
  bodyFat: 12.4,
  leanMass: 74.5,
  sport: "Basketball",
  position: "Point Guard / Shooting Guard",
  team: "Riverside Elite U18",
  goal: "lean_down" as Goal,
  goalLabel: "Lean down · +power-to-weight",
  streakDays: 42,
  plan: "free" as "free" | "premium",
  avatarInitials: "AR",
};

// ---------------------------------------------------------------------------
// Nutrition
// ---------------------------------------------------------------------------
export const nutritionToday = {
  caloriesGoal: 2850,
  caloriesConsumed: 1980,
  macros: {
    protein: { consumed: 148, goal: 190 },
    carbs: { consumed: 220, goal: 320 },
    fat: { consumed: 62, goal: 85 },
  },
  water: { consumed: 2.1, goal: 3.5 },
  meals: [
    { id: "m1", name: "Pre-training oats & berries", time: "07:15", kcal: 520, p: 28, c: 78, f: 12, tag: "Pre-workout" },
    { id: "m2", name: "Grilled chicken bowl", time: "12:40", kcal: 710, p: 58, c: 72, f: 18, tag: "Lunch" },
    { id: "m3", name: "Whey + banana", time: "15:20", kcal: 320, p: 34, c: 38, f: 4, tag: "Post-lift" },
    { id: "m4", name: "Greek yogurt & almonds", time: "17:00", kcal: 430, p: 28, c: 32, f: 28, tag: "Snack" },
  ],
  carbTiming: {
    session: "Court practice · 19:00–21:00",
    recommendation: "up" as Direction,
    grams: 60,
    windowLabel: "Next 90 min",
    reason:
      "High-intensity court session detected. Add ~60g fast carbs pre-practice to sustain explosive output.",
  },
};

// ---------------------------------------------------------------------------
// Vertical jump / force
// ---------------------------------------------------------------------------
export const jumpMetrics = {
  current: 78,
  best: 81,
  goal: 90,
  delta7d: +2.1,
  contactMs: 218,
  rsi: 1.72, // reactive strength index
  history: [
    { date: "Wk1", cm: 71 },
    { date: "Wk2", cm: 72 },
    { date: "Wk3", cm: 74 },
    { date: "Wk4", cm: 73 },
    { date: "Wk5", cm: 76 },
    { date: "Wk6", cm: 77 },
    { date: "Wk7", cm: 78 },
  ],
  singleLeg: { leftStability: 82, rightStability: 88, asymmetry: 6 },
  forceIndex: 74,
};

// ---------------------------------------------------------------------------
// Weight room — video-analyzed lifts (VBT)
// ---------------------------------------------------------------------------
export type VideoLift = {
  id: string;
  lift: string;
  date: string;
  load: number;          // kg
  reps: number;
  peakVelocity: number;  // m/s
  meanVelocity: number;  // m/s
  barPath: number;       // 0-100 (100 = perfectly vertical)
  formScore: number;     // 0-100
  estimated1RM: number;  // kg
  relStrength: number;   // 1RM / bodyweight
  weaknesses: string[];
  thumbnail: string;     // gradient hue
};

export const videoLifts: VideoLift[] = [
  {
    id: "v1",
    lift: "Back Squat",
    date: "Today · 16:40",
    load: 140,
    reps: 3,
    peakVelocity: 0.71,
    meanVelocity: 0.48,
    barPath: 91,
    formScore: 88,
    estimated1RM: 172,
    relStrength: 2.02,
    weaknesses: ["Slight forward knee drift · rep 3", "Sticking point at 30° knee flexion"],
    thumbnail: "125",
  },
  {
    id: "v2",
    lift: "Power Clean",
    date: "Yesterday · 17:05",
    load: 85,
    reps: 2,
    peakVelocity: 1.94,
    meanVelocity: 1.42,
    barPath: 84,
    formScore: 79,
    estimated1RM: 102,
    relStrength: 1.2,
    weaknesses: ["Early arm bend", "Bar loops away from body in 2nd pull"],
    thumbnail: "55",
  },
  {
    id: "v3",
    lift: "Trap-Bar Deadlift",
    date: "2 days ago",
    load: 180,
    reps: 3,
    peakVelocity: 0.82,
    meanVelocity: 0.61,
    barPath: 96,
    formScore: 93,
    estimated1RM: 215,
    relStrength: 2.53,
    weaknesses: [],
    thumbnail: "235",
  },
  {
    id: "v4",
    lift: "Countermovement Jump",
    date: "3 days ago",
    load: 0,
    reps: 3,
    peakVelocity: 2.81,
    meanVelocity: 2.44,
    barPath: 100,
    formScore: 90,
    estimated1RM: 0,
    relStrength: 0,
    weaknesses: ["Left knee valgus on landing"],
    thumbnail: "300",
  },
];

// ---------------------------------------------------------------------------
// Sleep & lifestyle
// ---------------------------------------------------------------------------
export const sleepLog = {
  hours: 7.4,
  quality: 82,       // %
  hrv: 68,
  restingHr: 52,
  soreness: 3,       // 1-10
  bedtime: "23:20",
  wake: "06:44",
  week: [7.2, 6.9, 7.6, 8.1, 6.5, 7.4, 7.4],
};

// ---------------------------------------------------------------------------
// Recovery
// ---------------------------------------------------------------------------
export const recovery = {
  score: 78,
  sleepHrs: sleepLog.hours,
  soreness: "Low-Moderate",
  hrv: sleepLog.hrv,
  injuryRisk: "Low",
  routines: [
    { id: "r1", title: "Achilles & patellar tendon stiffness", duration: 12, done: true, focus: "Tendon" },
    { id: "r2", title: "Ankle mobility flow", duration: 8, done: true, focus: "Mobility" },
    { id: "r3", title: "Hip capsule + adductor prehab", duration: 10, done: false, focus: "Prehab" },
    { id: "r4", title: "Nordic hamstring eccentrics", duration: 6, done: false, focus: "Prehab" },
  ],
};

// ---------------------------------------------------------------------------
// Master Recommendation Engine (synthesised output)
// ---------------------------------------------------------------------------
export const readinessScore = 84; // synthesis of sleep 82 + recovery 78 + fuel 70 + soreness

export const recommendations = {
  generatedAt: "Today · 06:52",
  readiness: readinessScore,
  headline: "Force–Velocity Imbalance detected",
  summary:
    "Squat relative strength is elite (2.0× BW), but CMJ peak velocity and vertical are trailing. Prioritize rate of force development, tendon stiffness, and reactive strength — not raw load.",
  bottlenecks: [
    {
      id: "b1",
      title: "Force–Velocity Imbalance",
      severity: "high" as const,
      detail:
        "High absolute strength (Squat 172kg est. 1RM) but mean bar velocity 0.48 m/s and CMJ 78cm indicate under-expressed power.",
      linked: ["Back Squat", "CMJ"],
    },
    {
      id: "b2",
      title: "L/R Asymmetry · 6%",
      severity: "medium" as const,
      detail:
        "Left leg stability 82% vs right 88%. Combined with valgus on landing → jumper's-knee risk vector.",
      linked: ["CMJ", "Single-leg"],
    },
    {
      id: "b3",
      title: "Power-to-weight headroom",
      severity: "medium" as const,
      detail:
        "Current 85 kg at 12.4% BF. Cutting ~2.5 kg fat while holding lean mass raises jump ceiling ~+3-4cm.",
      linked: ["Body comp", "Vertical"],
    },
  ],
  priorities: [
    { id: "p1", label: "Rate of Force Development", weight: 92 },
    { id: "p2", label: "Reactive Strength (RSI)", weight: 84 },
    { id: "p3", label: "Left-side stability", weight: 71 },
    { id: "p4", label: "Tendon stiffness", weight: 66 },
  ],
  exerciseRx: [
    { id: "e1", name: "Trap-bar jump squats", scheme: "5×3 @ 30% 1RM · max intent", tag: "RFD" },
    { id: "e2", name: "Depth jumps (40cm box)", scheme: "4×5 · <220ms contact", tag: "Reactive" },
    { id: "e3", name: "Single-leg RDL", scheme: "3×8/side · slow eccentric", tag: "Stability" },
    { id: "e4", name: "Iso-hold split squat", scheme: "3×30s · left focus", tag: "L-side" },
    { id: "e5", name: "Pogo hops", scheme: "5×20 · stiff ankle", tag: "Tendon" },
  ],
  nutritionDirective: {
    direction: "down" as Direction,
    label: "Sustained 300 kcal deficit",
    detail:
      "Hold protein ≥ 2.2 g/kg (190g). Cycle carbs high (320g) on court/lift days, moderate (220g) on off days. Target 82.5 kg / 10.5% BF in 6 weeks.",
  },
  recoveryDirective: {
    direction: "up" as Direction,
    label: "+45 min sleep target",
    detail:
      "HRV 68 ms below 8-week baseline (72). Push bedtime to 22:35 for 3 nights; deload jump volume 20%.",
  },
  sportSpecific: {
    sport: "Basketball · Guard",
    focus: [
      "First-step acceleration (0–5m)",
      "Reactive vertical off one foot",
      "Deceleration control (change-of-direction)",
    ],
  },
};

export const premiumFeatures = [
  "AI Video Analytics · unlimited uploads",
  "Adaptive carb-timing engine (real-time)",
  "Full Master Recommendation Engine",
  "AI Body Fat & Biometrics scanner",
  "Advanced VBT & force-velocity profiling",
  "Coach-shareable weekly performance reports",
];
