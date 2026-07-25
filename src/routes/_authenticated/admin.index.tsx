import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Loader2, Star, TrendingUp, Trophy, Users } from "lucide-react";

import { useApplications } from "@/lib/use-applications";
import { effectiveScore, formatDate, initials, type AppRow } from "@/lib/applications";
import { STATUS_LABEL } from "@/lib/scoring";
import { VACANCIES } from "@/lib/form-schema";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Visão geral | Painel Mwila Mania" },
      { name: "description", content: "Estatísticas das candidaturas ao recrutamento Mwila Mania." },
      { property: "og:title", content: "Visão geral | Painel Mwila Mania" },
      { property: "og:description", content: "Estatísticas de candidaturas da Mwila Mania." },
    ],
  }),
  component: Dashboard,
});

const COLORS = ["oklch(0.72 0.17 52)", "oklch(0.66 0.15 268)", "oklch(0.7 0.14 165)", "oklch(0.72 0.16 12)", "oklch(0.6 0.02 260)"];

function Dashboard() {
  const { data, isLoading } = useApplications();
  const apps: AppRow[] = data ?? [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const total = apps.length;
  const avg = total ? Math.round(apps.reduce((s, a) => s + effectiveScore(a), 0) / total) : 0;
  const favorites = apps.filter((a) => a.favorite).length;
  const approved = apps.filter((a) => a.status === "aprovado").length;

  const byVacancy = VACANCIES.map((v) => ({
    name: v.split(" ")[0],
    total: apps.filter((a) => a.vacancy === v).length,
  }));

  const byStatus = Object.keys(STATUS_LABEL).map((key) => ({
    name: STATUS_LABEL[key],
    value: apps.filter((a) => a.status === key).length,
  })).filter((s) => s.value > 0);

  const top = [...apps].sort((a, b) => effectiveScore(b) - effectiveScore(a)).slice(0, 5);
  const recent = apps.slice(0, 5);

  const stats = [
    { label: "Candidaturas", value: total, icon: Users },
    { label: "Média de pontuação", value: `${avg}/100`, icon: TrendingUp },
    { label: "Favoritos", value: favorites, icon: Star },
    { label: "Aprovados", value: approved, icon: Trophy },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Visão geral</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dados atualizados em tempo real a partir das candidaturas recebidas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface-card rounded-2xl p-5">
            <s.icon className="size-5 text-primary" />
            <p className="mt-4 font-display text-3xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card rounded-2xl p-5">
          <h2 className="text-lg font-semibold">Candidaturas por vaga</h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byVacancy}>
                <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" fontSize={11} />
                <YAxis allowDecimals={false} stroke="currentColor" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="oklch(0.72 0.17 52)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-5">
          <h2 className="text-lg font-semibold">Estado das candidaturas</h2>
          <div className="mt-5 h-64">
            {byStatus.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="pt-10 text-center text-sm text-muted-foreground">Sem dados ainda.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Top 5 pontuações" apps={top} showScore />
        <Panel title="Candidaturas recentes" apps={recent} />
      </div>
    </div>
  );
}

function Panel({ title, apps, showScore }: { title: string; apps: AppRow[]; showScore?: boolean }) {
  return (
    <div className="surface-card rounded-2xl p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-4 space-y-2">
        {apps.length === 0 && <li className="text-sm text-muted-foreground">Sem candidaturas.</li>}
        {apps.map((a) => (
          <li key={a.id}>
            <Link
              to="/admin/candidatos/$id"
              params={{ id: a.id }}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary/25 px-4 py-3 transition-colors hover:border-primary/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {initials(a.full_name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{a.full_name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {a.vacancy} · {formatDate(a.created_at)}
                </span>
              </span>
              <span className="font-display text-sm text-primary">
                {showScore ? `${effectiveScore(a)}` : STATUS_LABEL[a.status]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
