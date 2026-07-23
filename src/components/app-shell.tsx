import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Video, Utensils, CalendarDays, MessageSquare } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tabs: Array<{
  to: "/" | "/plan" | "/lifts" | "/nutrition" | "/chat";
  label: string;
  icon: typeof Home;
  exact?: boolean;
}> = [
  { to: "/", label: "Hub", icon: Home, exact: true },
  { to: "/plan", label: "Plan", icon: CalendarDays },
  { to: "/lifts", label: "Lifts", icon: Video },
  { to: "/nutrition", label: "Fuel", icon: Utensils },
  { to: "/chat", label: "Chat", icon: MessageSquare },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <main className="flex-1 pb-28">{children}</main>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between rounded-3xl border border-border bg-surface-elevated/90 px-2 py-2 backdrop-blur-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                    active && "bg-primary/15 fx-glow",
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                </div>
                <span className="tracking-wide uppercase">{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
