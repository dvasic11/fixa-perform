import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Ring, Bar, Chip } from "@/components/ui-bits";
import { nutritionToday } from "@/lib/mock-data";
import { Plus, Sparkles, Camera, Zap, Droplet } from "lucide-react";

export const Route = createFileRoute("/nutrition")({
  head: () => ({
    meta: [
      { title: "Fuel · FIXA" },
      {
        name: "description",
        content:
          "Log meals, track macros, and get AI-powered performance carb timing built for basketball athletes.",
      },
      { property: "og:title", content: "Fuel · FIXA" },
      {
        property: "og:description",
        content: "Athletic calorie & macro tracker with performance carb timing.",
      },
    ],
  }),
  component: NutritionPage,
});

function NutritionPage() {
  const n = nutritionToday;
  const kcalPct = Math.round((n.caloriesConsumed / n.caloriesGoal) * 100);
  return (
    <AppShell>
      <Screen
        subtitle="Fuel"
        title="Nutrition"
        right={
          <button className="flex h-11 items-center gap-1.5 rounded-full fx-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg">
            <Plus className="h-4 w-4" strokeWidth={2.6} /> Log
          </button>
        }
      >
        <Card>
          <div className="flex items-center gap-5">
            <Ring value={kcalPct} size={116}>
              <div className="text-center">
                <div className="text-xl font-bold leading-none">{n.caloriesConsumed}</div>
                <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  of {n.caloriesGoal}
                </div>
              </div>
            </Ring>
            <div className="flex-1 space-y-3">
              <Macro label="Protein" v={n.macros.protein.consumed} g={n.macros.protein.goal} color="var(--color-accent-lime)" />
              <Macro label="Carbs" v={n.macros.carbs.consumed} g={n.macros.carbs.goal} color="var(--color-accent-orange)" />
              <Macro label="Fat" v={n.macros.fat.consumed} g={n.macros.fat.goal} color="var(--color-accent-blue)" />
            </div>
          </div>
        </Card>

        {/* Carb timing */}
        <Card className="border-primary/40">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl fx-gradient-primary">
              <Zap className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Performance Carb Timing</p>
                <Chip tone="primary">+{n.carbTiming.grams}g</Chip>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{n.carbTiming.reason}</p>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-primary">
                {n.carbTiming.windowLabel} · {n.carbTiming.session}
              </p>
            </div>
          </div>
        </Card>

        {/* AI actions */}
        <div className="grid grid-cols-2 gap-3">
          <ActionTile icon={<Camera className="h-4 w-4" />} title="Scan meal" subtitle="AI calorie estimate" />
          <ActionTile icon={<Sparkles className="h-4 w-4" />} title="Ask Coach AI" subtitle="Nutrition chat" />
        </div>

        {/* Water */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-[color:var(--color-accent-blue)]" />
              <p className="text-sm font-semibold">Hydration</p>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {n.water.consumed}L / {n.water.goal}L
            </span>
          </div>
          <Bar value={n.water.consumed} max={n.water.goal} color="var(--color-accent-blue)" />
        </Card>

        {/* Meal log */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Today's meals
            </p>
            <span className="text-[11px] text-muted-foreground">{n.meals.length} logged</span>
          </div>
          <div className="space-y-2">
            {n.meals.map((m) => (
              <Card key={m.id} className="!p-4">
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Screen>
    </AppShell>
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

function ActionTile({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button className="fx-card p-4 text-left active:scale-[0.99] transition-transform">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
        {icon}
      </div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
    </button>
  );
}
