import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  MessageCircle,
  Search,
  Star,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApplications } from "@/lib/use-applications";
import {
  effectiveScore,
  formatDate,
  initials,
  whatsappLink,
  type AppRow,
} from "@/lib/applications";
import { STATUS_LABEL } from "@/lib/scoring";
import { VACANCIES } from "@/lib/form-schema";
import { deleteApplication, updateApplication } from "@/lib/applications.functions";
import { exportExcel, exportListPdf } from "@/lib/export";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/candidatos")({
  head: () => ({
    meta: [
      { title: "Candidatos | Painel Mwila Mania" },
      { name: "description", content: "Lista completa de candidatos ao recrutamento Mwila Mania." },
      { property: "og:title", content: "Candidatos | Painel Mwila Mania" },
      { property: "og:description", content: "Gestão de candidaturas da Mwila Mania." },
    ],
  }),
  component: CandidatesPage,
});

type SortKey = "score" | "date" | "name";

function CandidatesPage() {
  const { data, isLoading } = useApplications();
  const queryClient = useQueryClient();
  const update = useServerFn(updateApplication);
  const remove = useServerFn(deleteApplication);

  const [search, setSearch] = useState("");
  const [vacancy, setVacancy] = useState("todas");
  const [status, setStatus] = useState("todos");
  const [sort, setSort] = useState<SortKey>("score");
  const [page, setPage] = useState(0);
  const perPage = 12;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["applications"] });
  const patch = useMutation({ mutationFn: update, onSuccess: invalidate });
  const destroy = useMutation({ mutationFn: remove, onSuccess: invalidate });

  const apps: AppRow[] = data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = apps.filter((a) => {
      const matchTerm =
        !term ||
        a.full_name.toLowerCase().includes(term) ||
        (a.email ?? "").toLowerCase().includes(term) ||
        (a.city ?? "").toLowerCase().includes(term) ||
        (a.phone ?? "").includes(term);
      const matchVacancy = vacancy === "todas" || a.vacancy === vacancy;
      const matchStatus = status === "todos" || a.status === status;
      return matchTerm && matchVacancy && matchStatus;
    });
    return list.sort((a, b) => {
      if (sort === "name") return a.full_name.localeCompare(b.full_name);
      if (sort === "date") return b.created_at.localeCompare(a.created_at);
      return effectiveScore(b) - effectiveScore(a);
    });
  }, [apps, search, vacancy, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = filtered.slice(page * perPage, page * perPage + perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Candidatos</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filtered.length} de {apps.length} candidaturas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => exportExcel(filtered)}
          >
            <FileSpreadsheet className="mr-2 size-4" /> Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => exportListPdf(filtered)}
          >
            <Download className="mr-2 size-4" /> PDF
          </Button>
        </div>
      </div>

      <div className="surface-card grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Nome, email, cidade..."
            className="h-11 rounded-xl bg-secondary/40 pl-9"
          />
        </div>
        <Select
          value={vacancy}
          onValueChange={(v) => {
            setVacancy(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="h-11 rounded-xl bg-secondary/40">
            <SelectValue placeholder="Vaga" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as vagas</SelectItem>
            {VACANCIES.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="h-11 rounded-xl bg-secondary/40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-11 rounded-xl bg-secondary/40">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Maior pontuação</SelectItem>
            <SelectItem value="date">Mais recentes</SelectItem>
            <SelectItem value="name">Nome (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : current.length === 0 ? (
        <div className="surface-card rounded-2xl p-10 text-center text-sm text-muted-foreground">
          Nenhuma candidatura encontrada com estes filtros.
        </div>
      ) : (
        <div className="space-y-3">
          {current.map((a) => (
            <div
              key={a.id}
              className="surface-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {initials(a.full_name)}
              </span>
              <Link
                to="/admin/candidatos/$id"
                params={{ id: a.id }}
                className="min-w-40 flex-1"
              >
                <p className="truncate font-semibold hover:text-primary">{a.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.vacancy} · {a.city ?? "—"} · {a.age ?? "—"} anos · {formatDate(a.created_at)}
                </p>
              </Link>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs",
                  a.status === "aprovado"
                    ? "bg-primary/15 text-primary"
                    : a.status === "rejeitado"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {STATUS_LABEL[a.status] ?? a.status}
              </span>
              <span className="font-display text-lg font-bold text-primary">
                {effectiveScore(a)}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  title="Favorito"
                  onClick={() => patch.mutate({ data: { id: a.id, favorite: !a.favorite } })}
                >
                  <Star
                    className={cn("size-4", a.favorite ? "fill-accent text-accent" : "text-muted-foreground")}
                  />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full" asChild title="WhatsApp">
                  <a href={whatsappLink(a.phone, a.full_name)} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4 text-muted-foreground" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  title="Eliminar"
                  onClick={() => {
                    if (confirm(`Eliminar a candidatura de ${a.full_name}?`)) {
                      destroy.mutate({ data: { id: a.id } });
                    }
                  }}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            disabled={page + 1 >= pages}
            onClick={() => setPage(page + 1)}
          >
            Seguinte
          </Button>
        </div>
      )}
    </div>
  );
}
