import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Chip, Ring } from "@/components/ui-bits";
import { ChatDrawer } from "@/components/chat-drawer";
import { intelligenceEngine, readinessDynamic } from "@/lib/mock-data";
import {
  Brain,
  Activity,
  Moon,
  Utensils,
  HeartPulse,
  Dumbbell,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Coach · Dynamic Intelligence Engine" },
      {
        name: "description",
        content:
          "The engine fuses performance, wellness, sleep and fuel into one holistic diagnosis — then prescribes multi-domain interventions.",
      },
      { property: "og:title", content: "Coach · Dynamic Intelligence Engine" },
      { property: "og:description", content: "See exactly why today's plan changed — signal by signal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachPage,
});

const domainIcon = {
  program:   { i: Dumbbell,      c: "var(--color-primary)" },
  nutrition: { i: Utensils,      c: "var(--color-accent-orange)" },
  prehab:    { i: HeartPulse,    c: "var(--color-accent-blue)" },
  coaching:  { i: MessageCircle, c: "var(--color-accent-violet)" },
} as const;

const signalIcon = {
  performance: Activity,
  wellness:    Brain,
  sleep:       Moon,
  nutrition:   Utensils,
} as const;

function CoachPage() {
  const e = intelligenceEngine;
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <AppShell>
      <Screen subtitle="Adaptive Engine" title="Diagnosis">
        <button
          onClick={() => setChatOpen(true)}
          className="fx-card flex w-full items-center gap-3 border-primary/40 p-3 text-left active:scale-[0.99] transition-transform"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl fx-gradient-primary text-primary-foreground">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black">Chat with AI S&amp;C Coach</p>
            <p className="text-[11px] text-muted-foreground">
              Discuss slumps, fatigue &amp; swaps — updates the plan live.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Verdict hero */}
        <Card className="relative overflow-hidden border-primary/40">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <Ring value={e.confidence} size={104} stroke={11}>
              <div className="text-center">
                <div className="text-2xl font-black leading-none">{e.confidence}%</div>
                <div className="mt-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
                  Confidence
                </div>
              </div>
            </Ring>
            <div className="min-w-0 flex-1">
              <Chip tone="warning">
                <Brain className="mr-1 inline h-3 w-3" /> {e.verdict.replaceAll("_", " ")}
              </Chip>
              <p className="mt-2 text-sm font-black leading-snug">{e.headline}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{e.windowLabel}</p>
            </div>
          </div>
          <p className="relative mt-4 rounded-xl bg-background/60 p-3 text-[12px] leading-relaxed">
            {e.narrative}
          </p>
        </Card>

        {/* Signal fusion — what the engine actually saw */}
        <Section title="Signals fused" subtitle="Ranked by contribution to the diagnosis">
          <div className="space-y-2">
            {e.signals.map((s) => {
              const Icon = signalIcon[s.domain];
              const Trend = s.direction === "down" ? TrendingDown : s.direction === "up" ? TrendingUp : ArrowRight;
              return (
                <Card key={s.key} className="!p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "var(--color-muted)" }}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{s.label}</p>
                        <span className="flex items-center gap-1 text-[11px] font-bold tabular-nums text-primary">
                          <Trend className="h-3 w-3" /> {s.value}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {s.detail}
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${s.weight}%`,
                            background:
                              s.weight > 75 ? "var(--color-primary)"
                              : s.weight > 55 ? "var(--color-accent-blue)"
                              : "var(--color-accent-orange)",
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        weight {s.weight}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>

        {/* Multi-dimensional interventions */}
        <Section
          title="Interventions"
          subtitle="Different domains — not just more exercises"
        >
          <div className="space-y-2">
            {e.interventions.map((iv) => {
              const meta = domainIcon[iv.domain];
              const Icon = meta.i;
              return (
                <Link key={iv.id} to={iv.href} className="block">
                  <Card>
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-background"
                        style={{ backgroundColor: meta.c }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black">{iv.title}</p>
                          <Chip tone="primary">{iv.domain}</Chip>
                        </div>
                        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                          {iv.detail}
                        </p>
                        <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-[11px] leading-relaxed">
                          <span className="font-semibold text-primary">Prescribed →</span> {iv.action}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </Section>

        {/* Contrast card — noise vs signal */}
        <Card className="border-primary/25">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Why we didn't wait
          </p>
          <p className="mt-1 text-[12px] leading-relaxed">
            A single 0.02 m/s velocity drop would be statistical noise. Multiple correlated signals across
            performance, sleep, fuel and life stress crossed the threshold — so the engine acts now instead
            of waiting for an arbitrary session count.
          </p>
        </Card>

        <Link to="/" className="block">
          <Card className="border-primary/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Readiness {readinessDynamic.score} · {readinessDynamic.band}</p>
                <p className="text-[11px] text-muted-foreground">Back to today's dashboard</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </Screen>
      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} agent="coach" />
    </AppShell>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
