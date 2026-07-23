import { useEffect, useRef, useState } from "react";
import { Sheet } from "@/components/ui-bits";
import { useAppState, type ChatAgent, type ChatMessage } from "@/lib/app-state";
import { Brain, Utensils, Send, Zap } from "lucide-react";

export function ChatDrawer({
  open,
  onClose,
  agent,
}: {
  open: boolean;
  onClose: () => void;
  agent: ChatAgent;
}) {
  const { state, pushMessage, executeAction } = useAppState();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const thread = agent === "coach" ? state.chatCoach : state.chatNutrition;

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [thread.length]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    pushMessage(agent, {
      id: `u_${Date.now()}`,
      agent: "user",
      text,
      timestamp: Date.now(),
    });
    setInput("");
    setTimeout(() => pushMessage(agent, draftReply(agent, text, state)), 600);
  };

  const title = agent === "coach" ? "AI S&C Coach" : "AI Nutritionist";

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div
        ref={listRef}
        className="max-h-[52vh] space-y-3 overflow-y-auto pr-1"
      >
        {thread.length === 0 && (
          <p className="rounded-xl bg-muted/40 p-3 text-[12px] text-muted-foreground">
            {agent === "coach"
              ? "Ask about slumps, fatigue, swaps or volume — I can update your plan directly."
              : "Ask about macros, carb timing or a cut — I can retune your targets live."}
          </p>
        )}
        {thread.map((m) => (
          <Bubble
            key={m.id}
            msg={m}
            agent={agent}
            onAction={(id) => executeAction(agent, m.id, id)}
          />
        ))}
      </div>
      <div className="mt-3 flex items-end gap-2 rounded-2xl border border-border bg-surface-elevated p-2">
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
              ? "Swap back squat for split squats…"
              : "Bump training carbs by 60g…"
          }
          className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl fx-gradient-primary text-primary-foreground disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </Sheet>
  );
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

function draftReply(
  agent: ChatAgent,
  text: string,
  state: ReturnType<typeof useAppState>["state"],
): ChatMessage {
  const t = text.toLowerCase();
  const id = `a_${Date.now()}`;
  if (agent === "coach") {
    if (t.includes("swap") && t.includes("squat")) {
      const target = t.includes("split")
        ? "Split Squat"
        : t.includes("front")
          ? "Front Squat"
          : "Bulgarian Split Squat";
      return {
        id, agent, timestamp: Date.now(),
        text: `Understood. Squat mean velocity has been drifting, so a unilateral variant fits — same qualities, lower CNS cost. I can swap "Back Squat" → "${target}" across this week.`,
        actions: [{ id: "act1", label: `Swap Back Squat → ${target}`, kind: "swap_exercise", payload: { from: "Back Squat", to: target } }],
      };
    }
    if (t.includes("volume") || t.includes("tired") || t.includes("fatigue")) {
      return {
        id, agent, timestamp: Date.now(),
        text: `Volume Guard flags 3 heavy lift days this week — with stress ${state.goal?.stressLevel ?? 6}/10 that's on the edge. Convert Friday to a mobility slot.`,
        actions: [{ id: "act2", label: "Insert Friday mobility block", kind: "add_session", payload: { date: state.schedule[5]?.date ?? new Date().toISOString().slice(0, 10), time: "17:30", type: "recovery", title: "AI-inserted mobility", duration: 40, volume: 4, exercises: ["Foam roll", "Hip flow", "Nordic 3×5"] } }],
      };
    }
    if (t.includes("goal") || t.includes("target")) {
      const current = state.goal?.aiRealisticTarget ?? 86;
      return {
        id, agent, timestamp: Date.now(),
        text: `Current AI target is ${current}${state.goal?.unit ?? ""}. I can soften it by 2 to keep the plan achievable.`,
        actions: [{ id: "act3", label: `Lower target to ${current - 2}`, kind: "update_goal", payload: { newTarget: current - 2 } }],
      };
    }
    return {
      id, agent, timestamp: Date.now(),
      text: `Full context loaded (${state.schedule.length} sessions, ${state.body.weight}kg, goal ${state.goal?.label ?? "unset"}). Ask me to swap, add, deload or explain — I can execute directly.`,
    };
  }
  if (t.includes("carb")) {
    return {
      id, agent, timestamp: Date.now(),
      text: `On lift days you're 30% under target carbs — matches the velocity drop. Bump carbs +60g, drop fat -10g to hold calories.`,
      actions: [{ id: "n1", label: "+60g carbs / -10g fat", kind: "shift_macros", payload: { carbs: 60, fat: -10 } }],
    };
  }
  if (t.includes("body fat") || t.includes("lose") || t.includes("cut") || t.includes("deficit")) {
    return {
      id, agent, timestamp: Date.now(),
      text: `A safe cut with your lean-mass anchor is -300 kcal, mostly out of fat.`,
      actions: [{ id: "n2", label: "-300 kcal (fat -25g)", kind: "shift_macros", payload: { kcal: -300, fat: -25 } }],
    };
  }
  if (t.includes("protein")) {
    return {
      id, agent, timestamp: Date.now(),
      text: `You're at ${(state.macros.protein / state.body.weight).toFixed(2)} g/kg. Elite envelope is 2.0–2.4. I can push protein +20g.`,
      actions: [{ id: "n3", label: "+20g protein", kind: "shift_macros", payload: { protein: 20 } }],
    };
  }
  return {
    id, agent, timestamp: Date.now(),
    text: `Today: ${state.macros.kcal} kcal · P${state.macros.protein} · C${state.macros.carbs} · F${state.macros.fat}. Tell me if hunger, energy or timing feels off — I'll retune live.`,
  };
}