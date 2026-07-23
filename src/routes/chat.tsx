import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Screen, Segmented, Chip } from "@/components/ui-bits";
import {
  useAppState,
  type ChatAgent,
  type ChatMessage,
} from "@/lib/app-state";
import { Brain, Utensils, Send, Sparkles, Zap } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Coach & Nutritionist · FIXA" },
      { name: "description", content: "Dual AI agents with full context and live execution — swap exercises, retune macros, adjust goals in-chat." },
      { property: "og:title", content: "AI Coach & Nutritionist · FIXA" },
      { property: "og:description", content: "Talk to your S&C coach or nutritionist. They can update the schedule and macros for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { state, pushMessage, executeAction } = useAppState();
  const [agent, setAgent] = useState<ChatAgent>("coach");
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const thread = agent === "coach" ? state.chatCoach : state.chatNutrition;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.length]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [agent]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      agent: "user",
      text,
      timestamp: Date.now(),
    };
    pushMessage(agent, userMsg);
    setInput("");

    // Placeholder AI response with executable actions
    setTimeout(() => {
      const reply = draftReply(agent, text, state);
      pushMessage(agent, reply);
    }, 600);
  };

  return (
    <AppShell>
      <Screen
        subtitle="AI staff"
        title={agent === "coach" ? "S&C Coach" : "Nutritionist"}
        right={
          <Chip tone="primary">
            <Sparkles className="mr-1 inline h-3 w-3" /> Live
          </Chip>
        }
      >
        <Segmented<ChatAgent>
          value={agent}
          onChange={setAgent}
          options={[
            { value: "coach", label: "Coach" },
            { value: "nutritionist", label: "Nutritionist" },
          ]}
        />

        <div className="rounded-2xl border border-border bg-surface-elevated/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Context loaded
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
            <Ctx>{state.body.weight}kg · {state.body.bodyFat ?? "?"}% BF</Ctx>
            <Ctx>{state.schedule.length} sessions / wk</Ctx>
            {state.goal && <Ctx>{state.goal.aiRealisticTarget}{state.goal.unit} by {new Date(state.goal.deadline).toLocaleDateString()}</Ctx>}
            <Ctx>{state.macros.kcal} kcal · P{state.macros.protein}/C{state.macros.carbs}/F{state.macros.fat}</Ctx>
          </div>
        </div>

        <div
          ref={listRef}
          className="max-h-[52vh] space-y-3 overflow-y-auto pb-4"
        >
          {thread.map((m) => (
            <Bubble
              key={m.id}
              msg={m}
              agent={agent}
              onAction={(actionId) => executeAction(agent, m.id, actionId)}
            />
          ))}
        </div>

        <div className="sticky bottom-24 flex items-end gap-2 rounded-2xl border border-border bg-surface-elevated p-2 shadow-lg">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={
              agent === "coach"
                ? "e.g. Swap my back squat for split squats this week"
                : "e.g. Bump my training-day carbs by 60g"
            }
            className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl fx-gradient-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </Screen>
    </AppShell>
  );
}

function Ctx({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-muted/60 px-2 py-0.5 text-muted-foreground">{children}</span>;
}

function Bubble({
  msg,
  agent,
  onAction,
}: {
  msg: ChatMessage;
  agent: ChatAgent;
  onAction: (actionId: string) => void;
}) {
  const isUser = msg.agent === "user";
  const Icon = agent === "coach" ? Brain : Utensils;
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className={`max-w-[85%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted/70 text-foreground rounded-tl-sm"
          }`}
        >
          {msg.text}
        </div>
        {msg.actions && msg.actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.actions.map((a) => (
              <button
                key={a.id}
                onClick={() => onAction(a.id)}
                disabled={a.label.startsWith("✓")}
                className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary disabled:opacity-60"
              >
                <Zap className="h-3 w-3" /> {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Placeholder AI — pattern-matches keywords and offers executable actions
// ---------------------------------------------------------------------------
function draftReply(agent: ChatAgent, text: string, state: ReturnType<typeof useAppState>["state"]): ChatMessage {
  const t = text.toLowerCase();
  const id = `a_${Date.now()}`;

  if (agent === "coach") {
    if (t.includes("swap") && t.includes("squat")) {
      const target = t.includes("split") ? "Split Squat" : t.includes("front") ? "Front Squat" : "Bulgarian Split Squat";
      return {
        id, agent, timestamp: Date.now(),
        text: `Understood. Squat mean velocity has been drifting, so a unilateral variant fits — it hits the same qualities with lower CNS cost. I can swap "Back Squat" → "${target}" across every session this week.`,
        actions: [
          { id: "act1", label: `Swap Back Squat → ${target}`, kind: "swap_exercise", payload: { from: "Back Squat", to: target } },
        ],
      };
    }
    if (t.includes("volume") || t.includes("too much") || t.includes("tired")) {
      return {
        id, agent, timestamp: Date.now(),
        text: `Volume Guard already flags 3 heavy lift days this week — with stress ${state.goal?.stressLevel ?? 6}/10 that's on the edge. I'd convert Friday's power day into a mobility slot.`,
        actions: [
          { id: "act2", label: "Insert Friday mobility block", kind: "add_session", payload: { date: state.schedule[5]?.date ?? new Date().toISOString().slice(0, 10), time: "17:30", type: "recovery", title: "AI-inserted mobility", duration: 40, volume: 4, exercises: ["Foam roll", "Hip flow", "Nordic 3×5"] } },
        ],
      };
    }
    if (t.includes("goal") || t.includes("target")) {
      const current = state.goal?.aiRealisticTarget ?? 86;
      return {
        id, agent, timestamp: Date.now(),
        text: `Your current AI target is ${current}${state.goal?.unit ?? ""}. If you want to soften it to keep the plan achievable, I can drop it by 2.`,
        actions: [
          { id: "act3", label: `Lower target to ${current - 2}`, kind: "update_goal", payload: { newTarget: current - 2 } },
        ],
      };
    }
    return {
      id, agent, timestamp: Date.now(),
      text: `I have your full context (${state.schedule.length} sessions, weight ${state.body.weight}kg, goal ${state.goal?.label ?? "unset"}). Ask me to swap exercises, add a session, adjust volume, or explain the plan — I can execute directly.`,
    };
  }

  // Nutritionist
  if (t.includes("carb")) {
    return {
      id, agent, timestamp: Date.now(),
      text: `On lift days you're 30% under target carbs — that lines up with the velocity drop. I can bump carbs by 60g and drop fat by 10g to hold calories.`,
      actions: [
        { id: "n1", label: "+60g carbs / -10g fat", kind: "shift_macros", payload: { carbs: 60, fat: -10 } },
      ],
    };
  }
  if (t.includes("body fat") || t.includes("lose") || t.includes("cut")) {
    return {
      id, agent, timestamp: Date.now(),
      text: `A safe cut with your lean-mass anchor is -300 kcal, mostly out of fat. I can shift the daily target down.`,
      actions: [
        { id: "n2", label: "-300 kcal (fat -25g)", kind: "shift_macros", payload: { kcal: -300, fat: -25 } },
      ],
    };
  }
  if (t.includes("protein")) {
    return {
      id, agent, timestamp: Date.now(),
      text: `You're at ${(state.macros.protein / state.body.weight).toFixed(2)} g/kg. Elite envelope is 2.0–2.4. I can push protein by 20g.`,
      actions: [
        { id: "n3", label: "+20g protein", kind: "shift_macros", payload: { protein: 20 } },
      ],
    };
  }
  return {
    id, agent, timestamp: Date.now(),
    text: `Macros today: ${state.macros.kcal} kcal · P${state.macros.protein} · C${state.macros.carbs} · F${state.macros.fat}. Tell me if hunger, energy, or timing feels off — I'll retune it live.`,
  };
}