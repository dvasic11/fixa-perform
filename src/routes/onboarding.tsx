import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Chip } from "@/components/ui-bits";
import { aiOnboarding, athlete } from "@/lib/mock-data";
import { Sparkles, Check, ChevronRight, Brain } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "AI Goal Setting · FIXA" },
      { name: "description", content: "The AI negotiates your training goals based on sport, position, and current biometrics." },
      { property: "og:title", content: "AI Goal Setting · FIXA" },
      { property: "og:description", content: "Lean down, functional mass, power-to-weight — pick with the engine's help." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string>(aiOnboarding.aiRecommendation);

  const steps = ["Position", "AI insight", "Choose goal", "Confirm"];

  return (
    <AppShell>
      <Screen subtitle="AI Onboarding" title="Set your goal">
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
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl fx-gradient-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Detected profile
                </p>
                <p className="text-sm font-bold">
                  {aiOnboarding.positionContext.sport} · {aiOnboarding.positionContext.position}
                </p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {athlete.height}cm · {athlete.weight}kg · {athlete.bodyFat}% BF
                </p>
                <div className="mt-3 space-y-1.5">
                  {aiOnboarding.positionContext.demands.map((d) => (
                    <div key={d} className="flex items-center gap-2 text-[12px]">
                      <ChevronRight className="h-3.5 w-3.5 text-primary" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card className="border-primary/40">
            <div className="flex items-center gap-2">
              <Chip tone="primary">
                <Brain className="mr-1 inline h-3 w-3" /> AI reasoning
              </Chip>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed">{aiOnboarding.aiReasoning}</p>
            <p className="mt-3 text-[11px] italic text-muted-foreground">"{aiOnboarding.question}"</p>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-2">
            {aiOnboarding.candidateGoals.map((g) => {
              const active = selected === g.id;
              const recommended = g.id === aiOnboarding.aiRecommendation;
              return (
                <button
                  key={g.id}
                  onClick={() => setSelected(g.id)}
                  className={
                    "fx-card block w-full p-4 text-left transition " +
                    (active ? "!border-primary ring-2 ring-primary/40" : "")
                  }
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold">{g.label}</p>
                    {recommended && <Chip tone="primary">AI pick</Chip>}
                    {active && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </div>
                  <p className="mt-1 text-[12px] text-muted-foreground">{g.detail}</p>
                </button>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <Card className="border-primary/40 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl fx-gradient-primary shadow-lg">
              <Check className="h-7 w-7 text-primary-foreground" strokeWidth={3} />
            </div>
            <p className="mt-3 text-base font-black">Goal locked</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              The engine will fuse every session, meal and wellness log into this goal.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-xl fx-gradient-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Open my dashboard
            </Link>
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
