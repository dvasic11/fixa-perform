import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Chip } from "@/components/ui-bits";
import { Sparkles, Check, ChevronRight, Camera, Lock, Loader2, AlertTriangle } from "lucide-react";
import {
  useAppState,
  type ActivityLevel,
  type FacilityKey,
  type GoalKind,
  type GoalPlan,
} from "@/lib/app-state";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "AI Onboarding · FIXA" },
      { name: "description", content: "Enter your metrics, run the AI body scan, and negotiate a realistic deadline-bound goal with the engine." },
      { property: "og:title", content: "AI Onboarding · FIXA" },
      { property: "og:description", content: "Multi-step onboarding: biometrics, AI body scan, goal + timeline planner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

const activityLabels: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Light",
  moderate: "Moderate",
  high: "High",
  elite: "Elite / competing",
};

const goalOptions: Array<{ id: GoalKind; label: string; unit: string; hint: string }> = [
  { id: "vertical_jump",   label: "Vertical jump",   unit: "cm", hint: "CMJ height" },
  { id: "muscle_gain",     label: "Muscle gain",      unit: "kg", hint: "Lean mass" },
  { id: "fat_loss",        label: "Fat loss",         unit: "%",  hint: "Body-fat %" },
  { id: "power_output",    label: "Power output",     unit: "W",  hint: "Peak power" },
  { id: "power_to_weight", label: "Power-to-weight",  unit: "×",  hint: "Squat / BW" },
];

const facilities: Array<{ id: FacilityKey; label: string }> = [
  { id: "full_gym", label: "Full gym" },
  { id: "home_gym", label: "Home gym" },
  { id: "court", label: "Court" },
  { id: "field", label: "Field" },
  { id: "bands_only", label: "Bands only" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { state, setBody, setGoal, markOnboarded, update } = useAppState();
  const [step, setStep] = useState(0);

  // Step 0: biometrics
  const [body, setBodyLocal] = useState(state.body);
  // Step 1: AI scan
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(!!state.body.scanSource && state.body.scanSource === "ai_scan");
  // Step 2: goal & timeline
  const [goalKind, setGoalKind] = useState<GoalKind>(state.goal?.kind ?? "vertical_jump");
  const [current, setCurrent] = useState<number>(state.goal?.currentValue ?? 78);
  const [target, setTarget] = useState<number>(state.goal?.targetValue ?? 90);
  const [event, setEvent] = useState<string>(state.goal?.event ?? "Pre-season camp");
  const [deadline, setDeadline] = useState<string>(state.goal?.deadline ?? new Date(Date.now() + 12 * 7 * 86_400_000).toISOString().slice(0, 10));
  const [stress, setStress] = useState<number>(state.goal?.stressLevel ?? 6);
  const [hours, setHours] = useState<number>(state.goal?.hoursPerWeek ?? 10);
  const [facs, setFacs] = useState<FacilityKey[]>(state.goal?.facilities ?? ["full_gym", "court"]);

  const steps = ["Biometrics", "AI Body Scan", "Goal & Timeline", "AI Verdict"];

  // Realistic-target engine (placeholder logic)
  const compute = (): GoalPlan => {
    const unit = goalOptions.find((g) => g.id === goalKind)?.unit ?? "";
    const label = goalOptions.find((g) => g.id === goalKind)?.label ?? "";
    const weeks = Math.max(2, Math.round((new Date(deadline).getTime() - Date.now()) / (7 * 86_400_000)));
    const askedDelta = target - current;

    // fatigue factor: high stress or low weekly hours or bands-only limits gains
    const facilityFactor = facs.includes("full_gym") ? 1 : facs.includes("home_gym") ? 0.85 : 0.65;
    const stressFactor = 1 - (stress - 5) * 0.05; // 10=0.75, 1=1.2
    const hourFactor = Math.min(1.1, hours / 10);
    const capacity = facilityFactor * stressFactor * hourFactor;

    // physiological ceilings per week
    const perWeekCeiling: Record<GoalKind, number> = {
      vertical_jump: 0.75,     // cm/wk
      muscle_gain: 0.2,        // kg/wk
      fat_loss: -0.4,          // %BF/wk (negative)
      power_output: 12,        // W/wk
      power_to_weight: 0.02,   // ×/wk
    };
    const cap = perWeekCeiling[goalKind] * weeks * capacity;
    const realisticDelta = Math.abs(askedDelta) > Math.abs(cap) ? cap : askedDelta;
    const realistic = +(current + realisticDelta).toFixed(2);

    const ratio = Math.abs(askedDelta) / (Math.abs(cap) || 1);
    const verdict: GoalPlan["verdict"] =
      ratio <= 0.85 ? "achievable" : ratio <= 1.4 ? "aggressive" : "unsafe";

    const rationale =
      verdict === "achievable"
        ? `${weeks} weeks · ${hours}h/wk · life-stress ${stress}/10. Your ask lands inside the engine's safe envelope. Ship it.`
        : verdict === "aggressive"
        ? `${weeks} weeks · ${hours}h/wk · stress ${stress}/10 · facilities capacity ${(capacity * 100).toFixed(0)}%. Your ask is above the physiological ceiling. Trimmed target to ${realistic}${unit} — hitting that keeps the plan sustainable.`
        : `${weeks} weeks isn't enough with your current constraints. Your ask exceeds the safe rate by ${Math.round((ratio - 1) * 100)}%. Extend the deadline, drop stress, or accept the reduced target of ${realistic}${unit}.`;

    return {
      kind: goalKind,
      label: `${label} · ${current}${unit} → ${realistic}${unit}`,
      currentValue: current,
      targetValue: target,
      aiRealisticTarget: realistic,
      unit,
      deadline,
      event,
      stressLevel: stress,
      hoursPerWeek: hours,
      facilities: facs,
      verdict,
      aiRationale: rationale,
    };
  };

  const runScan = () => {
    setScanning(true);
    setTimeout(() => {
      const bf = +(10 + Math.random() * 5).toFixed(1);
      const lm = +(body.weight * (1 - bf / 100)).toFixed(1);
      const next = { ...body, bodyFat: bf, leanMass: lm, scanSource: "ai_scan" as const };
      setBodyLocal(next);
      setScanning(false);
      setScanned(true);
    }, 1800);
  };

  const finish = () => {
    setBody(body);
    setGoal(compute());
    markOnboarded();
    update({ plan: state.plan });
    navigate({ to: "/" });
  };

  const plan = compute();

  return (
    <AppShell>
      <Screen subtitle="Onboarding" title={steps[step]}>
        {/* Progress */}
        <div className="grid grid-cols-4 gap-1">
          {steps.map((s, i) => (
            <div
              key={s}
              className={
                "h-1.5 rounded-full " +
                (i <= step ? "bg-primary" : "bg-muted")
              }
            />
          ))}
        </div>

        {step === 0 && (
          <Card>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Physical parameters
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <NumField label="Height" unit="cm" value={body.height} onChange={(v) => setBodyLocal({ ...body, height: v })} />
              <NumField label="Weight" unit="kg" value={body.weight} onChange={(v) => setBodyLocal({ ...body, weight: v })} />
              <NumField label="Age"    unit="yrs" value={body.age}    onChange={(v) => setBodyLocal({ ...body, age: v })} />
              <NumField label="Body fat" unit="%" value={body.bodyFat ?? 12} onChange={(v) => setBodyLocal({ ...body, bodyFat: v, scanSource: "manual" })} />
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Activity level
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(Object.keys(activityLabels) as ActivityLevel[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setBodyLocal({ ...body, activity: a })}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                    body.activity === a ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {activityLabels[a]}
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card className="border-primary/30">
            <div className="flex items-center gap-2">
              <Chip tone="primary"><Sparkles className="mr-1 inline h-3 w-3" /> Premium</Chip>
              <p className="text-[11px] font-semibold text-muted-foreground">AI Body Scan</p>
            </div>
            <div className="mt-4 flex aspect-[4/3] items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30">
              {scanning ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-muted-foreground">Analysing anthropometrics…</p>
                </div>
              ) : scanned ? (
                <div className="text-center">
                  <Check className="mx-auto h-8 w-8 text-primary" strokeWidth={3} />
                  <p className="mt-2 text-sm font-bold">Scan complete</p>
                  <p className="text-[11px] text-muted-foreground">BF {body.bodyFat}% · Lean {body.leanMass}kg</p>
                </div>
              ) : (
                <div className="text-center px-4">
                  <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">Upload 3 photos (front, side, back)</p>
                </div>
              )}
            </div>
            <button
              onClick={runScan}
              disabled={scanning}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl fx-gradient-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {state.plan === "premium" ? <Camera className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {scanned ? "Re-run scan" : state.plan === "premium" ? "Run AI scan" : "Simulate scan (demo)"}
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Full AI Body Scan (BF% + anthropometric maps) is a Premium feature. You can still simulate the flow here.
            </p>
            <Link to="/premium" className="mt-1 inline-block text-[11px] font-semibold text-primary">
              See Premium →
            </Link>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <Card>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Goal type</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {goalOptions.map((g) => {
                  const active = goalKind === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setGoalKind(g.id)}
                      className={`fx-card p-3 text-left ${active ? "!border-primary ring-2 ring-primary/40" : ""}`}
                    >
                      <p className="text-xs font-bold">{g.label}</p>
                      <p className="text-[10px] text-muted-foreground">{g.hint}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <NumField label="Current" unit={goalOptions.find(g => g.id === goalKind)!.unit} value={current} onChange={setCurrent} />
                <NumField label="Target"  unit={goalOptions.find(g => g.id === goalKind)!.unit} value={target} onChange={setTarget} />
              </div>
            </Card>

            <Card>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Deadline & event</p>
              <label className="mt-2 block text-[11px] text-muted-foreground">Event</label>
              <input
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
                placeholder="e.g. Regional tournament"
              />
              <label className="mt-3 block text-[11px] text-muted-foreground">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm"
              />
            </Card>

            <Card>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Constraints</p>
              <Slider label={`Life stress · ${stress}/10`} value={stress} onChange={setStress} min={1} max={10} />
              <Slider label={`Hours available / week · ${hours}h`} value={hours} onChange={setHours} min={2} max={20} />
              <p className="mt-3 text-[11px] text-muted-foreground">Facilities</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {facilities.map((f) => {
                  const active = facs.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => setFacs(active ? facs.filter(x => x !== f.id) : [...facs, f.id])}
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                        active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {step === 3 && (
          <Card
            className={
              plan.verdict === "unsafe" ? "border-destructive/50" :
              plan.verdict === "aggressive" ? "border-amber-500/50" : "border-primary/40"
            }
          >
            <div className="flex items-center gap-2">
              {plan.verdict === "unsafe" ? (
                <Chip tone="warning"><AlertTriangle className="mr-1 inline h-3 w-3" /> Unsafe</Chip>
              ) : plan.verdict === "aggressive" ? (
                <Chip tone="warning">Aggressive</Chip>
              ) : (
                <Chip tone="primary"><Check className="mr-1 inline h-3 w-3" /> Achievable</Chip>
              )}
              <p className="text-[11px] font-semibold text-muted-foreground">AI verdict</p>
            </div>
            <p className="mt-3 text-lg font-black">
              {plan.aiRealisticTarget}{plan.unit}
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                (you asked {plan.targetValue}{plan.unit})
              </span>
            </p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              For <b>{plan.event}</b> · deadline {new Date(plan.deadline).toLocaleDateString()}
            </p>
            <p className="mt-3 text-[13px] leading-relaxed">{plan.aiRationale}</p>
            <button
              onClick={finish}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl fx-gradient-primary py-3 text-sm font-bold text-primary-foreground"
            >
              Lock plan &amp; open dashboard <ChevronRight className="h-4 w-4" />
            </button>
          </Card>
        )}

        {step < 3 && (
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 rounded-xl border border-border bg-muted/40 py-3 text-sm font-semibold text-muted-foreground"
              >
                Back
              </button>
            )}
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 rounded-xl fx-gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-lg active:scale-[0.99]"
            >
              Continue
            </button>
          </div>
        )}
      </Screen>
    </AppShell>
  );
}

function NumField({ label, unit, value, onChange }: { label: string; unit: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-baseline gap-1 rounded-lg border border-border bg-muted/40 px-3 py-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent text-lg font-bold tabular-nums outline-none"
        />
        <span className="text-[11px] text-muted-foreground">{unit}</span>
      </div>
    </label>
  );
}

function Slider({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div className="mt-3">
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-primary"
      />
    </div>
  );
}
