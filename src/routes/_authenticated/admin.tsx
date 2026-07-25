import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, LogOut, Trophy, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV: { to: "/admin" | "/admin/candidatos" | "/admin/ranking"; label: string; icon: typeof Users; exact?: boolean }[] = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/candidatos", label: "Candidatos", icon: Users },
  { to: "/admin/ranking", label: "Ranking", icon: Trophy },
];

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Logo />
          <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-2 sm:w-auto">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="order-2 rounded-full text-muted-foreground sm:order-3"
          >
            <LogOut className="mr-2 size-4" /> Sair
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
