import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Chip, Bar } from "@/components/ui-bits";
import { videoLifts } from "@/lib/mock-data";
import {
  Video,
  Upload,
  Camera,
  Play,
  AlertTriangle,
  Check,
  Gauge,
  Target,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/lifts")({
  head: () => ({
    meta: [
      { title: "Lifts · FIXA Video Analytics" },
      {
        name: "description",
        content:
          "Upload gym lifts and sprints — FIXA AI analyzes form, bar path, velocity, and estimates 1RM in seconds.",
      },
      { property: "og:title", content: "Lifts · FIXA Video Analytics" },
      {
        property: "og:description",
        content: "AI coach overlay for squats, cleans, deadlifts, sprints & jumps — VBT + 1RM in one tap.",
      },
    ],
  }),
  component: LiftsPage,
});

function LiftsPage() {
  return (
    <AppShell>
      <Screen
        subtitle="Weight Room"
        title="AI Video Analytics"
        right={
          <button className="flex h-11 items-center gap-1.5 rounded-full fx-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg">
            <Camera className="h-4 w-4" strokeWidth={2.6} /> Record
          </button>
        }
      >
        {/* Uploader */}
        <Card className="relative overflow-hidden border-dashed border-primary/40">
          <div className="absolute inset-0 fx-gradient-premium opacity-[0.08]" />
          <div className="relative flex flex-col items-center py-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl fx-gradient-primary shadow-lg">
              <Upload className="h-6 w-6 text-primary-foreground" strokeWidth={2.4} />
            </div>
            <p className="mt-3 text-base font-bold">Drop a lift or sprint clip</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-[260px]">
              FIXA AI detects reps, tracks bar path, computes peak & mean velocity, scores form,
              and estimates your 1RM — instantly.
            </p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
                Upload video
              </button>
              <button className="rounded-xl border border-border px-4 py-2 text-xs font-semibold">
                Try demo clip
              </button>
            </div>
          </div>
        </Card>

        {/* Capability strip */}
        <div className="grid grid-cols-4 gap-2">
          <CapabilityBadge icon={<Gauge className="h-3.5 w-3.5" />} label="VBT" />
          <CapabilityBadge icon={<Target className="h-3.5 w-3.5" />} label="Bar path" />
          <CapabilityBadge icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Form" />
          <CapabilityBadge icon={<Check className="h-3.5 w-3.5" />} label="1RM" />
        </div>

        {/* Featured analysis — Back Squat */}
        <FeaturedAnalysis lift={videoLifts[0]} />

        {/* History */}
        <div>
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent analyses
          </p>
          <div className="space-y-2">
            {videoLifts.slice(1).map((v) => (
              <Card key={v.id} className="!p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, oklch(0.6 0.18 ${v.thumbnail}), oklch(0.32 0.1 ${v.thumbnail}))`,
                    }}
                  >
                    <Play className="h-5 w-5 text-white" fill="white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{v.lift}</p>
                      <Chip tone={v.formScore >= 90 ? "success" : v.formScore >= 80 ? "primary" : "warning"}>
                        {v.formScore}
                      </Chip>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{v.date}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      {v.load > 0 && <span>{v.load}kg × {v.reps}</span>}
                      <span>Peak {v.peakVelocity.toFixed(2)} m/s</span>
                      {v.estimated1RM > 0 && <span>1RM ~{v.estimated1RM}kg</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Link to="/coach" className="block">
          <Card className="border-primary/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">See what to strengthen</p>
                <p className="text-[11px] text-muted-foreground">
                  Master engine linked these lifts to your vertical & sprint bottlenecks.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </Screen>
    </AppShell>
  );
}

function CapabilityBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/60 py-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
        {icon}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function FeaturedAnalysis({ lift }: { lift: typeof videoLifts[number] }) {
  return (
    <Card className="!p-0 overflow-hidden">
      {/* Video preview with AI overlay */}
      <div
        className="relative aspect-video w-full"
        style={{
          background: `linear-gradient(135deg, oklch(0.55 0.18 ${lift.thumbnail}), oklch(0.22 0.06 ${lift.thumbnail}))`,
        }}
      >
        {/* Skeleton overlay simulation */}
        <svg className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 100 60">
          <line x1="50" y1="8" x2="50" y2="20" stroke="var(--color-primary)" strokeWidth="0.5" />
          <circle cx="50" cy="6" r="2" fill="var(--color-primary)" />
          <line x1="50" y1="20" x2="42" y2="34" stroke="var(--color-primary)" strokeWidth="0.5" />
          <line x1="50" y1="20" x2="58" y2="34" stroke="var(--color-primary)" strokeWidth="0.5" />
          <line x1="42" y1="34" x2="40" y2="48" stroke="var(--color-primary)" strokeWidth="0.5" />
          <line x1="58" y1="34" x2="60" y2="48" stroke="var(--color-primary)" strokeWidth="0.5" />
          <line x1="40" y1="48" x2="38" y2="56" stroke="var(--color-primary)" strokeWidth="0.5" />
          <line x1="60" y1="48" x2="62" y2="56" stroke="var(--color-primary)" strokeWidth="0.5" />
          {/* bar path */}
          <path d="M35 22 Q34 34 35 46" stroke="var(--color-accent-orange)" strokeWidth="0.6" fill="none" strokeDasharray="1 1" />
          <path d="M65 22 Q66 34 65 46" stroke="var(--color-accent-orange)" strokeWidth="0.6" fill="none" strokeDasharray="1 1" />
        </svg>

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 backdrop-blur">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white">
            AI overlay
          </span>
        </div>
        <div className="absolute right-3 top-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
          Rep 3 / 3
        </div>
        <button className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-2xl">
          <Play className="h-6 w-6 text-black" fill="black" />
        </button>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">
              {lift.date}
            </p>
            <p className="text-lg font-black">{lift.lift}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest opacity-80">Load</p>
            <p className="text-lg font-black">{lift.load}kg</p>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <VbtMetric label="Peak vel" value={lift.peakVelocity.toFixed(2)} unit="m/s" />
          <VbtMetric label="Mean vel" value={lift.meanVelocity.toFixed(2)} unit="m/s" />
          <VbtMetric label="Est. 1RM" value={`${lift.estimated1RM}`} unit="kg" />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-medium text-muted-foreground">Bar path linearity</span>
            <span className="font-semibold tabular-nums">{lift.barPath}/100</span>
          </div>
          <Bar value={lift.barPath} max={100} color="var(--color-accent-orange)" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-medium text-muted-foreground">Form score</span>
            <span className="font-semibold tabular-nums">{lift.formScore}/100</span>
          </div>
          <Bar value={lift.formScore} max={100} color="var(--color-primary)" />
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/[0.05] p-3">
          <div className="flex items-center gap-2">
            <Video className="h-3.5 w-3.5 text-primary" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
              AI form breakdown
            </p>
          </div>
          <ul className="mt-2 space-y-1.5">
            {lift.weaknesses.map((w) => (
              <li key={w} className="flex items-start gap-2 text-xs text-foreground">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-accent-orange)]" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Relative strength <span className="font-semibold text-foreground">{lift.relStrength.toFixed(2)}× BW</span>.
            Mean velocity below 0.55 m/s → sub-maximal power expression. See Coach for prescription.
          </p>
        </div>
      </div>
    </Card>
  );
}

function VbtMetric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-black leading-none tabular-nums">
        {value}
        <span className="ml-0.5 text-[10px] font-medium text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}
