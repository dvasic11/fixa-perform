import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Ring, Bar, Chip, Sheet } from "@/components/ui-bits";
import { ChatDrawer } from "@/components/chat-drawer";
import { nutritionToday, nutritionScore } from "@/lib/mock-data";
import { useGameday } from "@/lib/calendar-store";
import {
  Plus,
  Search,
  Sparkles,
  Camera,
  ScanLine,
  BookOpen,
  Zap,
  Droplet,
  Pencil,
  Check,
  X,
  MessageCircle,
  Flame,
} from "lucide-react";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Fuel · FIXA" },
      { name: "description", content: "5-way meal logging, editable macros, and a dynamic nutrition score built for athletes." },
      { property: "og:title", content: "Fuel · FIXA" },
      { property: "og:description", content: "Search, AI text, photo, barcode, custom recipes — plus manual override on everything." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NutritionPage,
});

type Meal = (typeof nutritionToday.meals)[number];

function NutritionPage() {
  const [meals, setMeals] = useState<Meal[]>(nutritionToday.meals);
  const [logOpen, setLogOpen] = useState(false);
  const [editing, setEditing] = useState<Meal | null>(null);
  const [aiText, setAiText] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const gameday = useGameday();

  const kcal = meals.reduce((s, m) => s + m.kcal, 0);
  const P = meals.reduce((s, m) => s + m.p, 0);
  const C = meals.reduce((s, m) => s + m.c, 0);
  const F = meals.reduce((s, m) => s + m.f, 0);
  const kcalPct = Math.round((kcal / nutritionToday.caloriesGoal) * 100);

  function addAiMeal() {
    if (!aiText.trim()) return;
    const est = Math.round(400 + aiText.length * 3);
    setMeals((m) => [
      ...m,
      {
        id: `m_${Date.now()}`,
        name: aiText.slice(0, 60),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        kcal: est,
        p: Math.round(est * 0.28 / 4),
        c: Math.round(est * 0.45 / 4),
        f: Math.round(est * 0.27 / 9),
        tag: "AI text",
      },
    ]);
    setAiText("");
    setLogOpen(false);
  }

  return (
    <AppShell>
      <Screen
        subtitle="Fuel"
        title="Nutrition"
        right={
          <button
            onClick={() => setLogOpen(true)}
            className="flex h-11 items-center gap-1.5 rounded-full fx-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg"
          >
            <Plus className="h-4 w-4" strokeWidth={2.6} /> Log
          </button>
        }
      >
        {gameday && <GamedayFuel hours={gameday.hours} title={gameday.event.title} />}
        {/* NUTRITION SCORE */}
        <Card className="relative overflow-hidden border-primary/25">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <Ring value={nutritionScore.overall} size={112}>
              <div className="text-center">
                <div className="text-3xl font-black leading-none">{nutritionScore.overall}</div>
                <div className="mt-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">Nutri-Score</div>
              </div>
            </Ring>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Composite · vs 7d {nutritionScore.trend7d >= 0 ? "+" : ""}{nutritionScore.trend7d}
              </p>
              <ScoreRow label="Caloric accuracy" v={nutritionScore.caloricAccuracy} />
              <ScoreRow label="Macro distribution" v={nutritionScore.macroDistribution} weak={nutritionScore.weakest === "macroDistribution"} />
              <ScoreRow label="Performance timing" v={nutritionScore.performanceTiming} weak={nutritionScore.weakest === "performanceTiming"} />
              <ScoreRow label="Hydration" v={nutritionScore.hydration} weak={nutritionScore.weakest === "hydration"} />
            </div>
          </div>
        </Card>

        {/* CALORIE + MACROS */}
        <Card>
          <div className="flex items-center gap-5">
            <Ring value={kcalPct} size={104}>
              <div className="text-center">
                <div className="text-lg font-bold leading-none tabular-nums">{kcal}</div>
                <div className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                  of {nutritionToday.caloriesGoal}
                </div>
              </div>
            </Ring>
            <div className="flex-1 space-y-3">
              <Macro label="Protein" v={P} g={nutritionToday.macros.protein.goal} color="var(--color-accent-lime)" />
              <Macro label="Carbs" v={C} g={nutritionToday.macros.carbs.goal} color="var(--color-accent-orange)" />
              <Macro label="Fat" v={F} g={nutritionToday.macros.fat.goal} color="var(--color-accent-blue)" />
            </div>
          </div>
        </Card>

        {/* CARB TIMING */}
        <Card className="border-primary/40">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl fx-gradient-primary">
              <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Performance Carb Timing</p>
                <Chip tone="primary">+{nutritionToday.carbTiming.grams}g</Chip>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{nutritionToday.carbTiming.reason}</p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-primary">
                {nutritionToday.carbTiming.windowLabel} · {nutritionToday.carbTiming.session}
              </p>
            </div>
          </div>
        </Card>

        {/* HYDRATION */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-[color:var(--color-accent-blue)]" />
              <p className="text-sm font-semibold">Hydration</p>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {nutritionToday.water.consumed}L / {nutritionToday.water.goal}L
            </span>
          </div>
          <Bar value={nutritionToday.water.consumed} max={nutritionToday.water.goal} color="var(--color-accent-blue)" />
        </Card>

        {/* MEALS — editable */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Today's meals
            </p>
            <span className="text-[11px] text-muted-foreground">{meals.length} logged · tap to edit</span>
          </div>
          <div className="space-y-2">
            {meals.map((m) => (
              <button
                key={m.id}
                onClick={() => setEditing(m)}
                className="fx-card block w-full p-4 text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Chip>{m.tag}</Chip>
                      <span className="text-[11px] text-muted-foreground">{m.time}</span>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold">{m.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      P {m.p}g · C {m.c}g · F {m.f}g
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-lg font-bold tabular-nums">{m.kcal}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">kcal</div>
                    <Pencil className="ml-auto mt-1 h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Screen>

      {/* 5-WAY LOG ACTION SHEET */}
      <Sheet open={logOpen} onClose={() => setLogOpen(false)} title="Log a meal">
        <div className="space-y-2">
          <LogRow icon={<Search className="h-4 w-4" />} title="Database search" sub="Verified food lookup" />
          <div className="fx-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">AI text input</p>
                <p className="text-[11px] text-muted-foreground">Casual — "chicken, rice, avocado"</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="Describe your meal…"
                className="flex-1 rounded-lg bg-muted/60 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={addAiMeal}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
              >
                Estimate
              </button>
            </div>
          </div>
          <LogRow icon={<Camera className="h-4 w-4" />} title="AI photo estimate" sub="Snap the plate, we do the macros" />
          <LogRow icon={<ScanLine className="h-4 w-4" />} title="Barcode & label scan" sub="Barcode + OCR from packaging" />
          <LogRow icon={<BookOpen className="h-4 w-4" />} title="Custom recipes" sub="Save & one-tap re-log" />
        </div>
      </Sheet>

      {/* EDIT SHEET */}
      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Edit meal">
        {editing && (
          <EditMeal
            meal={editing}
            onSave={(m) => {
              setMeals((ms) => ms.map((x) => (x.id === m.id ? m : x)));
              setEditing(null);
            }}
            onDelete={(id) => {
              setMeals((ms) => ms.filter((x) => x.id !== id));
              setEditing(null);
            }}
          />
        )}
      </Sheet>

      {/* AI NUTRITIONIST FAB */}
      <button
        onClick={() => setChatOpen(true)}
        aria-label="Chat with AI Nutritionist"
        className="fixed bottom-28 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full fx-gradient-primary text-primary-foreground shadow-[0_10px_30px_-5px_rgba(0,0,0,0.6)] active:scale-95 transition-transform"
      >
        <MessageCircle className="h-6 w-6" strokeWidth={2.4} />
      </button>
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} agent="nutritionist" />
    </AppShell>
  );
}

function ScoreRow({ label, v, weak }: { label: string; v: number; weak?: boolean }) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between text-[10px]">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className={"tabular-nums " + (weak ? "text-[color:var(--color-accent-orange)]" : "text-foreground")}>
          {v}
        </span>
      </div>
      <Bar value={v} max={100} color={weak ? "var(--color-accent-orange)" : "var(--color-primary)"} />
    </div>
  );
}

function Macro({ label, v, g, color }: { label: string; v: number; g: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="tabular-nums">
          {v}
          <span className="text-muted-foreground">/{g}g</span>
        </span>
      </div>
      <Bar value={v} max={g} color={color} />
    </div>
  );
}

function LogRow({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <button className="fx-card flex w-full items-center gap-3 p-4 text-left active:scale-[0.99] transition-transform">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </button>
  );
}

function EditMeal({
  meal,
  onSave,
  onDelete,
}: {
  meal: Meal;
  onSave: (m: Meal) => void;
  onDelete: (id: string) => void;
}) {
  const [m, setM] = useState(meal);
  const num = (k: keyof Meal, v: string) =>
    setM((prev) => ({ ...prev, [k]: Number(v) || 0 } as Meal));
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Name</span>
        <input
          value={m.name}
          onChange={(e) => setM({ ...m, name: e.target.value })}
          className="mt-1 w-full rounded-lg bg-muted/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
        />
      </label>
      <div className="grid grid-cols-4 gap-2">
        <NumField label="kcal" value={m.kcal} onChange={(v) => num("kcal", v)} />
        <NumField label="P (g)" value={m.p} onChange={(v) => num("p", v)} />
        <NumField label="C (g)" value={m.c} onChange={(v) => num("c", v)} />
        <NumField label="F (g)" value={m.f} onChange={(v) => num("f", v)} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(m)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl fx-gradient-primary py-3 text-sm font-bold text-primary-foreground"
        >
          <Check className="h-4 w-4" /> Save override
        </button>
        <button
          onClick={() => onDelete(m.id)}
          className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-semibold text-muted-foreground"
          aria-label="Delete meal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg bg-muted/60 px-2 py-2 text-sm tabular-nums outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}

function GamedayFuel({ hours, title }: { hours: number; title: string }) {
  const h = Math.max(0, Math.round(hours));
  const timeline = [
    { t: "T-24h", label: "Carb load", detail: "+150g carbs · rice, oats, fruit · low-fibre by evening." },
    { t: "T-3h",  label: "Pre-game meal", detail: "~120g carbs + 30g protein · low fat · white rice + chicken." },
    { t: "T-45m", label: "Top-up",   detail: "30g fast carbs (banana + sports drink) · sip 300ml water." },
    { t: "Half",  label: "Intra",    detail: "20-30g fast carbs · gel or drink · electrolytes." },
    { t: "Post",  label: "Refuel",   detail: "1.2 g/kg carbs + 30g protein within 60 min." },
  ];
  return (
    <Card className="relative overflow-hidden border-[oklch(0.65_0.18_60)]/40">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[oklch(0.78_0.18_55)]/15 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.78_0.18_55/0.18)] text-[oklch(0.85_0.18_75)]">
            <Flame className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <Chip tone="warning">Gameday fuel · T-{h}h</Chip>
            <p className="mt-1 truncate text-sm font-black">{title}</p>
            <p className="text-[11px] text-muted-foreground">
              Targets auto-shifted: +40% carbs, −25% fat, protein held.
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          {timeline.map((row) => (
            <div key={row.t} className="flex items-start gap-3 rounded-lg bg-background/60 p-2.5">
              <span className="w-12 shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary">
                {row.t}
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold">{row.label}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{row.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
