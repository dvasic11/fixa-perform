import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Screen, Card } from "@/components/ui-bits";
import { premiumFeatures } from "@/lib/mock-data";
import { Sparkles, Check, Zap } from "lucide-react";

export const Route = createFileRoute("/premium")({
  head: () => ({
    meta: [
      { title: "FIXA Elite · Upgrade" },
      {
        name: "description",
        content:
          "Unlock adaptive fueling, AI biometrics, and elite performance analytics for €5/month.",
      },
      { property: "og:title", content: "FIXA Elite" },
      {
        property: "og:description",
        content: "The premium tier for serious youth basketball athletes.",
      },
    ],
  }),
  component: PremiumPage,
});

function PremiumPage() {
  return (
    <AppShell>
      <Screen subtitle="Upgrade" title="FIXA Elite">
        {/* Hero */}
        <Card className="relative overflow-hidden border-primary/30">
          <div className="absolute inset-0 fx-gradient-premium opacity-20" />
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl fx-gradient-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Elite tier
              </span>
            </div>

            <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight">
              Train like a<br />pro. Fuel like <span className="text-primary">science.</span>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Unlock every FIXA system built for ambitious basketball athletes.
            </p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tight">€5</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Cancel anytime · 7-day free trial for new athletes
            </p>

            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl fx-gradient-primary py-4 text-sm font-bold text-primary-foreground shadow-lg fx-glow">
              <Zap className="h-4 w-4" strokeWidth={3} />
              Start free trial
            </button>
          </div>
        </Card>

        {/* Features */}
        <div>
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Everything in Elite
          </p>
          <Card className="!p-2">
            <ul className="divide-y divide-border">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 px-3 py-3.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                  </div>
                  <span className="text-sm font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Compare */}
        <div>
          <p className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Free vs Elite
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Free
              </p>
              <p className="mt-1 text-2xl font-bold">€0</p>
              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                <li>Basic calorie & macro log</li>
                <li>Manual jump tracking</li>
                <li>3 prehab routines</li>
                <li>Weekly summary</li>
              </ul>
            </Card>
            <Card className="border-primary/40 bg-primary/[0.03]">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Elite</p>
              <p className="mt-1 text-2xl font-bold">€5<span className="text-xs text-muted-foreground font-medium">/mo</span></p>
              <ul className="mt-4 space-y-2 text-xs">
                <li>AI meal scan & chat</li>
                <li>Adaptive carb timing</li>
                <li>Full prehab library</li>
                <li>AI biometrics scanner</li>
              </ul>
            </Card>
          </div>
        </div>

        <p className="pb-2 text-center text-[11px] text-muted-foreground">
          Trusted by ambitious athletes across Europe.
        </p>
      </Screen>
    </AppShell>
  );
}
