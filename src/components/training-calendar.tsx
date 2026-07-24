import { useState } from "react";
import { CalendarPlus, Dumbbell, Trophy, Ban, Trash2 } from "lucide-react";
import { Sheet, Chip, Segmented } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import {
  useCalendar,
  useWeeklyAdaptations,
  usePeakingTarget,
  buildPeriodization,
  daysUntil,
  type CalEventType,
} from "@/lib/calendar-store";

const TYPE_META: Record<CalEventType, { label: string; icon: typeof Dumbbell; tone: string; ring: string }> = {
  workout:    { label: "Workout",    icon: Dumbbell, tone: "bg-primary/15 text-primary",                     ring: "border-primary/40" },
  match:      { label: "Match",      icon: Trophy,   tone: "bg-[oklch(0.78_0.18_55/0.18)] text-[oklch(0.85_0.18_75)]", ring: "border-[oklch(0.65_0.18_60)]/40" },
  obligation: { label: "Obligation", icon: Ban,      tone: "bg-muted text-muted-foreground",                 ring: "border-border" },
};

function todayISO() { return new Date().toISOString().slice(0, 10); }

export function TrainingCalendarSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { events, add, remove } = useCalendar();
  const adaptations = useWeeklyAdaptations();
  const peak = usePeakingTarget();
  const [type, setType] = useState<CalEventType>("workout");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("07:00");

  const sorted = [...events].sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
  const periodization = peak ? buildPeriodization(peak.days) : null;

  const submit = () => {
    if (!title.trim()) return;
    add({ type, title: title.trim(), date, time });
    setTitle("");
  };

  return (
    <Sheet open={open} onClose={onClose} title="Training Calendar">
      <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
        {peak && periodization && (
          <div className="rounded-2xl border border-primary/30 bg-primary/8 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">Peaking Strategy</p>
              <Chip tone="primary">{peak.days}d out</Chip>
            </div>
            <p className="mt-1 text-sm font-semibold">{peak.event.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Auto-structured {periodization.length}-week block · overload → deload for peak power on event day.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {periodization.map((b) => (
                <div key={b.weekOffset} className="flex items-center gap-3 rounded-xl bg-surface-elevated/60 p-2.5">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Wk {b.weekOffset + 1}</p>
                    <p className={cn("text-[11px] font-bold", b.phase.startsWith("Deload") ? "text-[oklch(0.85_0.18_75)]" : "text-primary")}>{b.phase}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex gap-1">
                      <span className="text-[10px] text-muted-foreground">Vol</span>
                      <span className="text-[10px] font-bold text-foreground">{b.volumePct}%</span>
                      <span className="ml-2 text-[10px] text-muted-foreground">Int</span>
                      <span className="text-[10px] font-bold text-foreground">{b.intensityPct}%</span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{b.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {adaptations.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">This week · auto-adaptations</p>
            {adaptations.map((a) => (
              <div key={a.id} className="rounded-xl border border-border bg-surface-elevated/60 p-3 text-[11px] text-muted-foreground">
                {a.text}
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Add event</p>
          <Segmented
            value={type}
            onChange={setType}
            options={[
              { value: "workout", label: "Workout" },
              { value: "match", label: "Match" },
              { value: "obligation", label: "Other" },
            ]}
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === "match" ? "Opponent / event" : type === "obligation" ? "Exam, travel, work…" : "Session title"}
            className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          </div>
          <button
            onClick={submit}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground active:scale-[0.99]"
          >
            <CalendarPlus className="h-4 w-4" /> Schedule
          </button>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Upcoming</p>
          <div className="space-y-2">
            {sorted.map((e) => {
              const meta = TYPE_META[e.type];
              const Icon = meta.icon;
              const d = daysUntil(e.date);
              return (
                <div key={e.id} className={cn("flex items-start gap-3 rounded-xl border bg-surface-elevated/50 p-3", meta.ring)}>
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{e.title}</p>
                      <Chip>{d === 0 ? "Today" : d < 0 ? `${-d}d ago` : `in ${d}d`}</Chip>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {e.date}{e.time ? ` · ${e.time}` : ""}{e.notes ? ` · ${e.notes}` : ""}
                    </p>
                  </div>
                  <button onClick={() => remove(e.id)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Sheet>
  );
}