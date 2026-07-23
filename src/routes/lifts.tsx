import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Screen, Card, Chip, Segmented, LineChart } from "@/components/ui-bits";
import {
  exerciseDirectory,
  videoVault,
  type Exercise,
  type ExerciseMetric,
} from "@/lib/mock-data";
import {
  Search,
  Upload,
  Play,
  ChevronLeft,
  Video,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Crown,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/lifts")({
  head: () => ({
    meta: [
      { title: "Lifts · Deep Analytics · FIXA" },
      { name: "description", content: "Deep exercise directory with weight, ROM, velocity and RFD charts, plus an automatic video vault." },
      { property: "og:title", content: "Lifts · Deep Analytics · FIXA" },
      { property: "og:description", content: "Search every exercise, toggle multi-metric progress, and scrub through every uploaded clip." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiftsPage,
});

function LiftsPage() {
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return exerciseDirectory;
    return exerciseDirectory.filter(
      (e) =>
        e.name.toLowerCase().includes(s) ||
        e.category.includes(s) ||
        e.tags.some((t) => t.toLowerCase().includes(s)),
    );
  }, [q]);

  const active = openId ? exerciseDirectory.find((e) => e.id === openId) : null;
  if (active) return <ExerciseDetail exercise={active} onBack={() => setOpenId(null)} />;

  return (
    <AppShell>
      <Screen
        subtitle="Weight Room"
        title="Exercises"
        right={
          <button className="flex h-11 items-center gap-1.5 rounded-full fx-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg">
            <Upload className="h-4 w-4" strokeWidth={2.6} /> Clip
          </button>
        }
      >
        {/* Search */}
        <div className="fx-card flex items-center gap-2 p-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search squat, hip, RFD…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-[11px] font-semibold text-muted-foreground">
              Clear
            </button>
          )}
        </div>

        {/* Directory grouped */}
        {groupByCategory(filtered).map((g) => (
          <div key={g.cat}>
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {g.cat}
            </p>
            <div className="space-y-2">
              {g.items.map((e) => {
                const last = e.history[e.history.length - 1];
                return (
                  <button
                    key={e.id}
                    onClick={() => setOpenId(e.id)}
                    className="fx-card block w-full p-4 text-left active:scale-[0.99] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, oklch(0.6 0.18 ${e.hue}), oklch(0.32 0.1 ${e.hue}))`,
                        }}
                      >
                        <Video className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{e.name}</p>
                          <Chip>{e.primaryMetric.toUpperCase()}</Chip>
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {e.tags.join(" · ")}
                        </p>
                        <p className="mt-1 text-[11px] text-primary tabular-nums">
                          {metricPreview(e.primaryMetric, last)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Screen>
    </AppShell>
  );
}

function metricPreview(m: ExerciseMetric, last: Exercise["history"][number]) {
  if (m === "weight") return `Latest ${last.weight}kg · ${last.velocity.toFixed(2)} m/s`;
  if (m === "velocity") return `Latest ${last.velocity.toFixed(2)} m/s @ ${last.weight}kg`;
  if (m === "rfd") return `RFD ${last.rfd}`;
  return `ROM ${last.rom}°`;
}

function groupByCategory(items: Exercise[]) {
  const order: Exercise["category"][] = ["strength", "power", "mobility", "prehab", "conditioning"];
  const map = new Map<string, Exercise[]>();
  for (const e of items) {
    if (!map.has(e.category)) map.set(e.category, []);
    map.get(e.category)!.push(e);
  }
  return order
    .filter((c) => map.has(c))
    .map((cat) => ({ cat: cat.charAt(0).toUpperCase() + cat.slice(1), items: map.get(cat)! }));
}

// ------------------------------------------------------------------
// EXERCISE DETAIL — multi-metric chart + video vault
// ------------------------------------------------------------------
function ExerciseDetail({ exercise, onBack }: { exercise: Exercise; onBack: () => void }) {
  const [metric, setMetric] = useState<ExerciseMetric>(exercise.primaryMetric);
  const [scanning, setScanning] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const labels = exercise.history.map((h) => h.date);
  const data = exercise.history.map((h) =>
    metric === "weight" ? h.weight
    : metric === "rom" ? h.rom
    : metric === "velocity" ? h.velocity
    : h.rfd,
  );
  const suffix =
    metric === "weight" ? "kg"
    : metric === "rom" ? "°"
    : metric === "velocity" ? " m/s"
    : "";
  const clips = exercise.history
    .filter((h) => h.videoId)
    .map((h) => ({ ...videoVault[h.videoId!], sessionDate: h.date }))
    .reverse();

  // Progress analytics — first vs latest across all metrics
  const first = exercise.history[0];
  const last = exercise.history[exercise.history.length - 1];
  const analytics = [
    { key: "Peak velocity", from: first.velocity, to: last.velocity, unit: " m/s", digits: 2 },
    { key: "Estimated 1RM", from: Math.round(first.weight / (1.0278 - 0.0278 * 5)), to: Math.round(last.weight / (1.0278 - 0.0278 * 5)), unit: "kg", digits: 0 },
    { key: "Rate of force dev", from: first.rfd, to: last.rfd, unit: "", digits: 0 },
    { key: "Range of motion", from: first.rom, to: last.rom, unit: "°", digits: 0 },
  ];

  const triggerScan = () => {
    setScanning(true);
    setScanDone(false);
    setTimeout(() => {
      setScanning(false);
      setScanDone(true);
    }, 1600);
  };

  return (
    <AppShell>
      <Screen
        subtitle={exercise.category.toUpperCase()}
        title={exercise.name}
        right={
          <button
            onClick={onBack}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-foreground"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        }
      >
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Progress
            </p>
            <Chip tone="primary">{exercise.history.length} sessions</Chip>
          </div>
          <Segmented<ExerciseMetric>
            value={metric}
            onChange={setMetric}
            options={[
              { value: "weight",   label: "Weight" },
              { value: "rom",      label: "ROM" },
              { value: "velocity", label: "Velocity" },
              { value: "rfd",      label: "RFD" },
            ]}
          />
          <div className="mt-4">
            <LineChart data={data} labels={labels} suffix={suffix} />
          </div>
        </Card>

        {/* Overall Progress Analytics */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Overall progress analytics
            </p>
            <Chip tone="primary">since day 1</Chip>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {analytics.map((a) => {
              const delta = a.to - a.from;
              const pct = a.from === 0 ? 0 : Math.round((delta / a.from) * 100);
              const gained = pct >= 3;
              const plateau = Math.abs(pct) < 3;
              const Trend = plateau ? TrendingDown : gained ? TrendingUp : TrendingDown;
              const color = plateau
                ? "text-[color:var(--color-accent-orange)]"
                : gained
                  ? "text-primary"
                  : "text-[color:var(--color-accent-orange)]";
              return (
                <div key={a.key} className="rounded-xl bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {a.key}
                  </p>
                  <p className="mt-1 text-lg font-black tabular-nums">
                    {a.to.toFixed(a.digits)}
                    <span className="text-xs text-muted-foreground">{a.unit}</span>
                  </p>
                  <p className={`mt-0.5 flex items-center gap-1 text-[11px] font-semibold ${color}`}>
                    <Trend className="h-3 w-3" />
                    {pct >= 0 ? "+" : ""}
                    {pct}% {plateau ? "· plateau" : gained ? "· progressing" : "· regressed"}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Premium AI Form Scan */}
        <Card className="border-primary/40">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl fx-gradient-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-black">AI Form Scan</p>
                <Chip tone="primary">
                  <Crown className="mr-1 inline h-3 w-3" /> Premium
                </Chip>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Upload a clip — the engine grades bar path, depth, tempo and joint angles, then writes cues into your next session.
              </p>
              <button
                onClick={triggerScan}
                disabled={scanning}
                className="mt-3 flex items-center gap-1.5 rounded-full fx-gradient-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60"
              >
                <Upload className="h-3.5 w-3.5" />
                {scanning ? "Analyzing…" : scanDone ? "Re-run scan" : "Upload & scan"}
              </button>
              {scanDone && (
                <div className="mt-3 space-y-1.5 rounded-xl bg-muted/50 p-3 text-[11px]">
                  <p className="flex items-center gap-1.5 font-semibold text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Scan complete · form score 82/100
                  </p>
                  <p className="text-muted-foreground">• Bar path drift 4cm forward on ascent</p>
                  <p className="text-muted-foreground">• Right knee valgus mild at 68% depth</p>
                  <p className="text-muted-foreground">• Cue queued: "chest proud, spread the floor"</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Video vault */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Video log &amp; technique review
            </p>
            <span className="text-[11px] text-muted-foreground">
              {clips.length} clip{clips.length === 1 ? "" : "s"} archived
            </span>
          </div>
          {clips.length === 0 ? (
            <Card>
              <p className="text-[13px] text-muted-foreground">
                No clips yet — every uploaded video for this exercise will archive here automatically.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {clips.map((c, i) => (
                <Card key={c.id} className="!p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, oklch(0.55 0.18 ${c.hue}), oklch(0.22 0.06 ${c.hue}))`,
                      }}
                    >
                      <Play className="h-5 w-5 text-white" fill="white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {c.sessionDate}
                      </p>
                      <p className="text-sm font-semibold">{c.note}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Form {[84, 79, 88, 82, 86][i % 5]}/100 · tempo {["3-1-1", "2-0-X", "3-0-1"][i % 3]} · cue: {["brace harder", "smoother eccentric", "drive through mid-foot"][i % 3]}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Screen>
    </AppShell>
  );
}
