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

        {/* Video vault */}
        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Video vault
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
              {clips.map((c) => (
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
