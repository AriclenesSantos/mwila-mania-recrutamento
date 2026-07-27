import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Loader2, Medal, Trophy } from "lucide-react";

import { useApplications } from "@/lib/use-applications";
import { analysisOf, effectiveScore, type AppRow } from "@/lib/applications";
import { CandidateAvatar } from "@/components/admin/CandidateAvatar";
import { RECOMMENDATION_LABEL } from "@/lib/scoring";
import { VACANCIES } from "@/lib/form-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/ranking")({
  head: () => ({
    meta: [
      { title: "Ranking | Painel Mwila Mania" },
      {
        name: "description",
        content: "Ranking automático dos candidatos por pontuação no recrutamento Mwila Mania.",
      },
      { property: "og:title", content: "Ranking | Painel Mwila Mania" },
      { property: "og:description", content: "Os melhores candidatos por pontuação." },
    ],
  }),
  component: RankingPage,
});

const MEDALS = ["text-[oklch(0.62_0.22_24)]", "text-[oklch(0.88_0.01_25)]", "text-[oklch(0.5_0.14_22)]"];

function RankingPage() {
  const { data, isLoading } = useApplications();
  const [vacancy, setVacancy] = useState("todas");
  const apps: AppRow[] = data ?? [];

  const ranked = useMemo(
    () =>
      apps
        .filter((a) => (vacancy === "todas" ? true : a.vacancy === vacancy))
        .filter((a) => a.status !== "arquivado")
        .sort((a, b) => effectiveScore(b) - effectiveScore(a)),
    [apps, vacancy],
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ranking automático</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ordenado pela pontuação final (manual sobrepõe-se à automática).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["todas", ...VACANCIES].map((v) => (
          <Button
            key={v}
            variant={vacancy === v ? "default" : "secondary"}
            size="sm"
            className="rounded-full"
            onClick={() => setVacancy(v)}
          >
            {v === "todas" ? "Todas as vagas" : v}
          </Button>
        ))}
      </div>

      {ranked.length === 0 ? (
        <div className="surface-card rounded-2xl p-10 text-center text-sm text-muted-foreground">
          Ainda não há candidaturas para classificar.
        </div>
      ) : (
        <ol className="space-y-3">
          {ranked.map((a, i) => {
            const analysis = analysisOf(a);
            return (
              <li key={a.id}>
                <Link
                  to="/admin/candidatos/$id"
                  params={{ id: a.id }}
                  className={cn(
                    "surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4 transition-colors hover:border-primary/50",
                    i < 3 && "border-primary/40",
                  )}
                >
                  <span className="flex w-10 shrink-0 justify-center">
                    {i < 3 ? (
                      <Medal className={cn("size-6", MEDALS[i])} />
                    ) : (
                      <span className="font-display text-lg text-muted-foreground">{i + 1}</span>
                    )}
                  </span>
                  <CandidateAvatar app={a} textClassName="text-sm" />
                  <span className="min-w-40 flex-1">
                    <span className="block truncate font-semibold">{a.full_name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {a.vacancy} · {a.city ?? "—"}
                      {analysis.recomendacao ? ` · ${RECOMMENDATION_LABEL[analysis.recomendacao]}` : ""}
                    </span>
                  </span>
                  <span className="font-display text-2xl font-bold text-gradient">
                    {effectiveScore(a)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Trophy className="size-3.5" /> Os três primeiros lugares destacam-se com medalha.
      </p>
    </div>
  );
}
