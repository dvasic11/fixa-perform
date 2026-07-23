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

// ============================================================================
// AI ONBOARDING — goal negotiation output
// ============================================================================
export const aiOnboarding = {
  question: "Given your position (Guard) and current 85kg / 12.4% BF, what should we chase first?",
  aiRecommendation: "power_to_weight" as const,
  aiReasoning:
    "You already squat 2.0× BW — raw strength isn't the bottleneck. Cutting 2.5 kg of fat while keeping your CMJ trend up will raise your vertical ceiling by ~3-4 cm and improve first-step acceleration.",
  candidateGoals: [
    { id: "lean_down", label: "Lean Down", detail: "Drop 2-3 kg fat while holding lean mass" },
    { id: "functional_mass", label: "Functional Mass", detail: "+3-5 kg lean mass, keep vertical" },
    { id: "power_to_weight", label: "Power-to-Weight", detail: "Maximize CMJ and RFD per kg — best fit for Guard" },
    { id: "return_to_play", label: "Return to Play", detail: "Rehab focus, then rebuild" },
  ],
  positionContext: {
    sport: "Basketball",
    position: "Guard",
    demands: ["First-step acceleration", "Reactive vertical", "Deceleration control", "4th-quarter engine"],
  },
};

// ============================================================================
// DAILY SUBJECTIVE WELLNESS — out-of-gym signals
// ============================================================================
export type WellnessKey = "mental" | "fatigue" | "soreness" | "life";
export const wellnessToday: Record<WellnessKey, number> = {
  mental: 6,   // 1 (calm) — 10 (overwhelmed)
  fatigue: 7,  // 1 (fresh) — 10 (fried)
  soreness: 4,
  life: 8,     // school + game week
};
export const wellnessLabels: Record<WellnessKey, { title: string; low: string; high: string }> = {
  mental:   { title: "Mental Stress",  low: "Calm",  high: "Overwhelmed" },
  fatigue:  { title: "Fatigue",        low: "Fresh", high: "Fried" },
  soreness: { title: "Soreness",       low: "None",  high: "Deep" },
  life:     { title: "Life / School",  low: "Quiet", high: "Chaotic" },
};

// ============================================================================
// NUTRITION SCORE — dynamic composite
// ============================================================================
export const nutritionScore: {
  overall: number;
  caloricAccuracy: number;
  macroDistribution: number;
  performanceTiming: number;
  hydration: number;
  trend7d: number;
  weakest: "caloricAccuracy" | "macroDistribution" | "performanceTiming" | "hydration";
} = {
  overall: 74,               // 0-100
  caloricAccuracy: 82,       // vs dynamic target
  macroDistribution: 78,
  performanceTiming: 62,     // carb placement around workouts
  hydration: 60,
  trend7d: -4,               // vs last week
  weakest: "performanceTiming" as const,
};

// ============================================================================
// EXERCISE DIRECTORY — deep, searchable
// ============================================================================
export type ExerciseCategory = "strength" | "power" | "mobility" | "prehab" | "conditioning";
export type ExerciseMetric = "weight" | "rom" | "velocity" | "rfd";

export type ExerciseLog = {
  date: string;
  weight: number;   // kg
  rom: number;      // deg
  velocity: number; // m/s (mean)
  rfd: number;      // N/s (arbitrary units)
  videoId?: string;
};

export type Exercise = {
  id: string;
  name: string;
  category: ExerciseCategory;
  tags: string[];
  primaryMetric: ExerciseMetric;
  hue: string;
  history: ExerciseLog[];
};

export const exerciseDirectory: Exercise[] = [
  {
    id: "ex_squat",
    name: "Back Squat",
    category: "strength",
    tags: ["Quad", "Hip", "VBT"],
    primaryMetric: "weight",
    hue: "125",
    history: [
      { date: "W-6", weight: 125, rom: 118, velocity: 0.58, rfd: 71, videoId: "vv1" },
      { date: "W-5", weight: 130, rom: 120, velocity: 0.56, rfd: 73 },
      { date: "W-4", weight: 132, rom: 121, velocity: 0.54, rfd: 74, videoId: "vv2" },
      { date: "W-3", weight: 135, rom: 122, velocity: 0.52, rfd: 72 },
      { date: "W-2", weight: 138, rom: 120, velocity: 0.50, rfd: 70, videoId: "vv3" },
      { date: "W-1", weight: 140, rom: 119, velocity: 0.49, rfd: 68 },
      { date: "Today", weight: 140, rom: 116, velocity: 0.48, rfd: 66, videoId: "vv4" },
    ],
  },
  {
    id: "ex_clean",
    name: "Power Clean",
    category: "power",
    tags: ["Triple ext.", "Explosive"],
    primaryMetric: "velocity",
    hue: "55",
    history: [
      { date: "W-6", weight: 78, rom: 165, velocity: 1.55, rfd: 88 },
      { date: "W-5", weight: 80, rom: 164, velocity: 1.52, rfd: 87, videoId: "vv5" },
      { date: "W-4", weight: 82, rom: 164, velocity: 1.48, rfd: 84 },
      { date: "W-3", weight: 82, rom: 162, velocity: 1.46, rfd: 82 },
      { date: "W-2", weight: 85, rom: 161, velocity: 1.44, rfd: 80, videoId: "vv6" },
      { date: "W-1", weight: 85, rom: 160, velocity: 1.42, rfd: 78 },
      { date: "Today", weight: 85, rom: 158, velocity: 1.42, rfd: 76 },
    ],
  },
  {
    id: "ex_depth",
    name: "Depth Jump (40cm)",
    category: "power",
    tags: ["Reactive", "RFD"],
    primaryMetric: "rfd",
    hue: "300",
    history: [
      { date: "W-6", weight: 0, rom: 0, velocity: 2.9, rfd: 92 },
      { date: "W-5", weight: 0, rom: 0, velocity: 2.88, rfd: 90 },
      { date: "W-4", weight: 0, rom: 0, velocity: 2.84, rfd: 88, videoId: "vv7" },
      { date: "W-3", weight: 0, rom: 0, velocity: 2.81, rfd: 85 },
      { date: "W-2", weight: 0, rom: 0, velocity: 2.78, rfd: 82 },
      { date: "W-1", weight: 0, rom: 0, velocity: 2.75, rfd: 80 },
      { date: "Today", weight: 0, rom: 0, velocity: 2.72, rfd: 76 },
    ],
  },
  {
    id: "ex_hipmob",
    name: "90/90 Hip Flow",
    category: "mobility",
    tags: ["Hip", "Capsule"],
    primaryMetric: "rom",
    hue: "235",
    history: [
      { date: "W-6", weight: 0, rom: 82, velocity: 0, rfd: 0 },
      { date: "W-5", weight: 0, rom: 85, velocity: 0, rfd: 0 },
      { date: "W-4", weight: 0, rom: 86, velocity: 0, rfd: 0 },
      { date: "W-3", weight: 0, rom: 88, velocity: 0, rfd: 0 },
      { date: "W-2", weight: 0, rom: 0, velocity: 0, rfd: 0 },
      { date: "W-1", weight: 0, rom: 0, velocity: 0, rfd: 0 },
      { date: "Today", weight: 0, rom: 0, velocity: 0, rfd: 0 },
    ],
  },
  {
    id: "ex_nordic",
    name: "Nordic Hamstring",
    category: "prehab",
    tags: ["Eccentric", "Hamstring"],
    primaryMetric: "rom",
    hue: "155",
    history: [
      { date: "W-3", weight: 0, rom: 42, velocity: 0, rfd: 0 },
      { date: "W-2", weight: 0, rom: 46, velocity: 0, rfd: 0 },
      { date: "W-1", weight: 0, rom: 50, velocity: 0, rfd: 0 },
      { date: "Today", weight: 0, rom: 54, velocity: 0, rfd: 0 },
    ],
  },
  {
    id: "ex_tbdl",
    name: "Trap-Bar Deadlift",
    category: "strength",
    tags: ["Post-chain", "Hip hinge"],
    primaryMetric: "weight",
    hue: "235",
    history: [
      { date: "W-4", weight: 170, rom: 88, velocity: 0.66, rfd: 78 },
      { date: "W-3", weight: 175, rom: 88, velocity: 0.64, rfd: 79 },
      { date: "W-2", weight: 180, rom: 88, velocity: 0.62, rfd: 80, videoId: "vv8" },
      { date: "W-1", weight: 180, rom: 88, velocity: 0.61, rfd: 80 },
      { date: "Today", weight: 180, rom: 88, velocity: 0.61, rfd: 80, videoId: "vv9" },
    ],
  },
];

// ============================================================================
// VIDEO VAULT — automatic archive linked to exercises
// ============================================================================
export const videoVault: Record<string, { id: string; date: string; note: string; hue: string }> = {
  vv1: { id: "vv1", date: "6 wk ago", note: "Baseline 125kg × 5",     hue: "125" },
  vv2: { id: "vv2", date: "4 wk ago", note: "132kg × 3 — clean",     hue: "125" },
  vv3: { id: "vv3", date: "2 wk ago", note: "138kg × 3 — knee drift", hue: "125" },
  vv4: { id: "vv4", date: "Today",    note: "140kg × 3 — velocity ↓", hue: "125" },
  vv5: { id: "vv5", date: "5 wk ago", note: "80kg × 2 — crisp pull", hue: "55" },
  vv6: { id: "vv6", date: "2 wk ago", note: "85kg × 2 — early arm",  hue: "55" },
  vv7: { id: "vv7", date: "4 wk ago", note: "Depth jump baseline",   hue: "300" },
  vv8: { id: "vv8", date: "2 wk ago", note: "180 TBDL — clean",      hue: "235" },
  vv9: { id: "vv9", date: "Today",    note: "180 TBDL — holding",    hue: "235" },
};

// ============================================================================
// DYNAMIC INTELLIGENCE ENGINE — holistic slump diagnosis
// ============================================================================
export type Signal = {
  key: string;
  label: string;
  value: string;
  domain: "performance" | "wellness" | "sleep" | "nutrition";
  weight: number;      // 0-100 how much it contributed
  direction: Direction;
  detail: string;
};

export type Intervention = {
  id: string;
  domain: Domain;
  title: string;
  detail: string;
  action: string;
  href: "/lifts" | "/nutrition" | "/recovery" | "/coach" | "/";
};

export const intelligenceEngine = {
  updatedAt: "Today · 06:52",
  // Not a rigid rule ("5 sessions") — the engine confidence is context-aware
  confidence: 82,
  windowLabel: "Fused last 10 lifts · 7 nights · 7 wellness logs",
  verdict: "power_slump" as "clean" | "noise" | "power_slump" | "overreach" | "underfuelled",
  headline: "Power output is genuinely trending down — not just noise.",
  narrative:
    "Squat mean velocity has drifted from 0.56 → 0.48 m/s over 6 weeks while load held. That alone could be a bad day. But your CMJ is off 3 cm, RFD is off 20%, life stress is 8/10 (game week + finals), sleep has dropped 45 min, and carbs on training days are 30% under target. The pattern reads as a genuine neurological + fuel down-regulation — not a form issue.",
  signals: [
    { key: "s_vel",   label: "Squat mean velocity",  value: "0.48 m/s ↓",  domain: "performance", weight: 88, direction: "down", detail: "6-week drift from 0.56 → 0.48 at same load." },
    { key: "s_rfd",   label: "Depth-jump RFD",       value: "-20%",         domain: "performance", weight: 82, direction: "down", detail: "Reactive strength dropping · neurological signal." },
    { key: "s_cmj",   label: "CMJ height",           value: "-3 cm",        domain: "performance", weight: 74, direction: "down", detail: "Off recent baseline of 81 cm." },
    { key: "s_life",  label: "Life stress",          value: "8/10",         domain: "wellness",    weight: 71, direction: "up",   detail: "Finals + game week — CNS load is real." },
    { key: "s_sleep", label: "Sleep debt",           value: "-45 min",      domain: "sleep",       weight: 66, direction: "down", detail: "3 of last 7 nights under 7 h." },
    { key: "s_carb",  label: "Training-day carbs",   value: "-30%",         domain: "nutrition",   weight: 62, direction: "down", detail: "Under-fuelling around court sessions." },
    { key: "s_rom",   label: "Squat ROM",            value: "-3°",          domain: "performance", weight: 41, direction: "down", detail: "Small — likely fatigue-driven, not mechanical." },
  ] as Signal[],
  interventions: [
    {
      id: "iv_program",
      domain: "program",
      title: "Swap heavy squats for loaded jumps",
      detail: "Neurological down-regulation, not a strength deficit. Fast intent > absolute load this week.",
      action: "3 days · 5×3 trap-bar jump squats @ 30% 1RM · max intent",
      href: "/lifts",
    },
    {
      id: "iv_nutrition",
      domain: "nutrition",
      title: "+80g carbs on court days",
      detail: "Slump correlates with training-day fuel gap. Bump peri-workout carbs before pulling volume.",
      action: "40g pre-court + 40g post — 2 weeks · re-assess",
      href: "/nutrition",
    },
    {
      id: "iv_prehab",
      domain: "prehab",
      title: "Achilles + patellar stiffness circuit",
      detail: "ROM & landing mechanics are slipping. Protect the tendons before it becomes tendinopathy.",
      action: "Pogo hops 5×20 · iso wall-sit 3×45s · 4 days/wk",
      href: "/recovery",
    },
    {
      id: "iv_coach",
      domain: "coaching",
      title: "Down-regulate the CNS at night",
      detail: "Your life stress is doing the work of a second workout. Actively vagal-tone before bed.",
      action: "Box-breathing 4-7-8 · 5 min · lights out 22:30 for 3 nights",
      href: "/coach",
    },
  ] as Intervention[],
};

// ============================================================================
// READINESS — recomputed from all signals (replaces static score)
// ============================================================================
export const readinessDynamic = {
  score: 68,                    // was static — now reflects slump
  band: "Caution" as "Primed" | "Steady" | "Caution" | "Recover",
  drivers: [
    { label: "Sleep",     value: 74 },
    { label: "Fuel",      value: 62 },
    { label: "Wellness",  value: 55 },
    { label: "Force out", value: 71 },
  ],
};
