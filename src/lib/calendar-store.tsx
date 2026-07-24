import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CalEventType = "workout" | "match" | "obligation";

export type CalEvent = {
  id: string;
  type: CalEventType;
  title: string;
  date: string; // ISO YYYY-MM-DD
  time?: string; // HH:MM
  notes?: string;
};

const STORAGE_KEY = "fixa.calendar.v1";

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

const seed = (): CalEvent[] => [
  { id: "e1", type: "workout",    title: "Lower · Squat + RDL",   date: addDays(0),  time: "07:00", notes: "Auto-scheduled" },
  { id: "e2", type: "match",      title: "League vs Northside",   date: addDays(2),  time: "19:30", notes: "Home · varsity" },
  { id: "e3", type: "workout",    title: "Upper · Press + Pull",  date: addDays(3),  time: "07:00" },
  { id: "e4", type: "obligation", title: "Math finals",           date: addDays(5),  time: "09:00", notes: "3 hrs · high mental load" },
  { id: "e5", type: "workout",    title: "Power · Cleans",        date: addDays(7),  time: "07:00" },
  { id: "e6", type: "match",      title: "Regional opener",       date: addDays(26), time: "18:00", notes: "Season kickoff — peak here" },
];

type Ctx = {
  events: CalEvent[];
  add: (e: Omit<CalEvent, "id">) => void;
  remove: (id: string) => void;
  update: (id: string, patch: Partial<CalEvent>) => void;
};

const CalCtx = createContext<Ctx | null>(null);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalEvent[]>(seed());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setEvents(JSON.parse(raw) as CalEvent[]);
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch { /* ignore */ }
  }, [events, hydrated]);

  const add = useCallback((e: Omit<CalEvent, "id">) => {
    setEvents((es) => [...es, { ...e, id: `e_${Date.now()}` }]);
  }, []);
  const remove = useCallback((id: string) => setEvents((es) => es.filter((e) => e.id !== id)), []);
  const update = useCallback(
    (id: string, patch: Partial<CalEvent>) =>
      setEvents((es) => es.map((e) => (e.id === id ? { ...e, ...patch } : e))),
    [],
  );

  const value = useMemo(() => ({ events, add, remove, update }), [events, add, remove, update]);
  return <CalCtx.Provider value={value}>{children}</CalCtx.Provider>;
}

export function useCalendar() {
  const c = useContext(CalCtx);
  if (!c) throw new Error("useCalendar must be used inside CalendarProvider");
  return c;
}

// --------------------------------------------------------------------------
// Derived helpers — real-coach reasoning
// --------------------------------------------------------------------------
export function hoursUntil(dateISO: string, time = "18:00"): number {
  const t = new Date(`${dateISO}T${time}:00`).getTime();
  return (t - Date.now()) / 3_600_000;
}

export function daysUntil(dateISO: string): number {
  return Math.round(hoursUntil(dateISO, "12:00") / 24);
}

/** Returns the nearest upcoming match within 48h, if any (gameday mode). */
export function useGameday(): { event: CalEvent; hours: number } | null {
  const { events } = useCalendar();
  return useMemo(() => {
    const upcoming = events
      .filter((e) => e.type === "match")
      .map((e) => ({ event: e, hours: hoursUntil(e.date, e.time ?? "18:00") }))
      .filter((x) => x.hours > -6 && x.hours <= 48)
      .sort((a, b) => a.hours - b.hours);
    return upcoming[0] ?? null;
  }, [events]);
}

/** Nearest match ≥14 days out — anchors the periodization block. */
export function usePeakingTarget(): { event: CalEvent; days: number } | null {
  const { events } = useCalendar();
  return useMemo(() => {
    const future = events
      .filter((e) => e.type === "match")
      .map((e) => ({ event: e, days: daysUntil(e.date) }))
      .filter((x) => x.days >= 14)
      .sort((a, b) => a.days - b.days);
    return future[0] ?? null;
  }, [events]);
}

export type PeriodizationBlock = {
  weekOffset: number; // 0 = current week, 3 = week of match
  phase: "Overload" | "Overload+" | "Peak Overload" | "Deload" | "Taper";
  volumePct: number; // % of baseline weekly volume
  intensityPct: number;
  note: string;
};

export function buildPeriodization(daysToMatch: number): PeriodizationBlock[] {
  // 4-week peaking model: 3 wks intensive overload → 1 wk deload/taper.
  const weeks = Math.max(2, Math.min(6, Math.ceil(daysToMatch / 7)));
  const blocks: PeriodizationBlock[] = [];
  for (let i = 0; i < weeks; i++) {
    const isTaper = i === weeks - 1;
    const isPeakOverload = i === weeks - 2;
    if (isTaper) {
      blocks.push({ weekOffset: i, phase: "Deload", volumePct: 55, intensityPct: 70, note: "Cut volume 45%, keep intensity high — sharpen the CNS." });
    } else if (isPeakOverload) {
      blocks.push({ weekOffset: i, phase: "Peak Overload", volumePct: 115, intensityPct: 92, note: "Highest weekly load — supercompensation window." });
    } else if (i === weeks - 3) {
      blocks.push({ weekOffset: i, phase: "Overload+", volumePct: 108, intensityPct: 88, note: "Push RFD & power output — near-max intent." });
    } else {
      blocks.push({ weekOffset: i, phase: "Overload", volumePct: 100, intensityPct: 82, note: "Baseline overload · progressive tension." });
    }
  }
  return blocks;
}

/** Adaptation notes for match / obligation events landing this week. */
export function useWeeklyAdaptations() {
  const { events } = useCalendar();
  return useMemo(() => {
    const notes: Array<{ id: string; event: CalEvent; text: string }> = [];
    for (const e of events) {
      const d = daysUntil(e.date);
      if (d < 0 || d > 7) continue;
      if (e.type === "match") {
        notes.push({ id: e.id, event: e, text: `Match ${d === 0 ? "today" : `in ${d}d`} — training volume auto-shifted −25% on ${e.date} and +15% two days after.` });
      } else if (e.type === "obligation") {
        notes.push({ id: e.id, event: e, text: `Obligation ${d === 0 ? "today" : `in ${d}d`} — heavy lift redistributed off this day; mobility inserted instead.` });
      }
    }
    return notes;
  }, [events]);
}