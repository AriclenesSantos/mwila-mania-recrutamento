import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Download,
  Loader2,
  Mail,
  MessageCircle,
  Star,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteApplication,
  getApplication,
  updateApplication,
} from "@/lib/applications.functions";
import { CandidateAvatar } from "@/components/admin/CandidateAvatar";
import {
  analysisOf,
  answersOf,
  breakdownOf,
  effectiveScore,
  formatDate,
  mailtoLink,
  whatsappLink,
  type AppRow,
  type HistoryRow,
} from "@/lib/applications";
import { CRITERIA, RECOMMENDATION_LABEL, STATUS_LABEL, type ScoreBreakdown } from "@/lib/scoring";
import { FORM_STEPS } from "@/lib/form-schema";
import { exportApplicationPdf } from "@/lib/export";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/candidatos/$id")({
  head: () => ({
    meta: [
      { title: "Ficha do candidato | Painel Mwila Mania" },
      { name: "description", content: "Respostas, pontuação e análise automática do candidato." },
      { property: "og:title", content: "Ficha do candidato | Painel Mwila Mania" },
      { property: "og:description", content: "Análise detalhada de uma candidatura Mwila Mania." },
    ],
  }),
  component: CandidateDetail,
});

function CandidateDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchOne = useServerFn(getApplication);
  const update = useServerFn(updateApplication);
  const remove = useServerFn(deleteApplication);

  const { data, isLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () => fetchOne({ data: { id } }),
  });

  const app = (data?.app ?? null) as AppRow | null;
  const history = (data?.history ?? []) as HistoryRow[];

  const [notes, setNotes] = useState("");
  const [manual, setManual] = useState("");

  useEffect(() => {
    if (app) {
      setNotes(app.admin_notes ?? "");
      setManual(app.manual_score === null ? "" : String(app.manual_score));
    }
  }, [app]);

  const patch = useMutation({
    mutationFn: update,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["application", id] });
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
  const destroy = useMutation({
    mutationFn: remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["applications"] });
      void navigate({ to: "/admin/candidatos" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="surface-card rounded-2xl p-10 text-center">
        <p className="text-sm text-muted-foreground">Candidatura não encontrada.</p>
        <Button asChild variant="secondary" className="mt-5 rounded-full">
          <Link to="/admin/candidatos">Voltar à lista</Link>
        </Button>
      </div>
    );
  }

  const breakdown = breakdownOf(app);
  const analysis = analysisOf(app);
  const answers = answersOf(app);

  return (
    <div className="space-y-6">
      <Link
        to="/admin/candidatos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Candidatos
      </Link>

      <div className="surface-card flex flex-wrap items-center gap-5 rounded-3xl p-6">
        <CandidateAvatar app={app} className="size-16" textClassName="size-16 text-xl font-display" />
        <div className="min-w-48 flex-1">
          <h1 className="text-2xl font-bold">{app.full_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {app.vacancy} · {app.city ?? "—"} · {app.age ?? "—"} anos · candidatura de{" "}
            {formatDate(app.created_at)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {app.phone ?? "—"} · {app.email ?? "—"}
          </p>
        </div>
        <div className="text-center">
          <p className="font-display text-4xl font-bold text-gradient">{effectiveScore(app)}</p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">de 100</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={app.status} onValueChange={(v) => patch.mutate({ data: { id, status: v } })}>
          <SelectTrigger className="h-11 w-44 rounded-full bg-secondary/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          className="rounded-full"
          onClick={() => patch.mutate({ data: { id, favorite: !app.favorite } })}
        >
          <Star className={cn("mr-2 size-4", app.favorite && "fill-accent text-accent")} />
          {app.favorite ? "Favorito" : "Marcar favorito"}
        </Button>
        <Button variant="secondary" className="rounded-full" asChild>
          <a href={whatsappLink(app.phone, app.full_name)} target="_blank" rel="noreferrer">
            <MessageCircle className="mr-2 size-4" /> WhatsApp
          </a>
        </Button>
        <Button variant="secondary" className="rounded-full" asChild>
          <a href={mailtoLink(app.email, app.full_name)}>
            <Mail className="mr-2 size-4" /> Email
          </a>
        </Button>
        <Button variant="secondary" className="rounded-full" onClick={() => exportApplicationPdf(app)}>
          <Download className="mr-2 size-4" /> PDF
        </Button>
        <Button
          variant="ghost"
          className="rounded-full text-destructive"
          onClick={() => {
            if (confirm(`Eliminar a candidatura de ${app.full_name}?`)) destroy.mutate({ data: { id } });
          }}
        >
          <Trash2 className="mr-2 size-4" /> Eliminar
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Pontuação por critério</h2>
          <div className="mt-5 space-y-4">
            {(Object.keys(CRITERIA) as (keyof ScoreBreakdown)[]).map((key) => {
              const value = breakdown[key] ?? 0;
              const max = CRITERIA[key].max;
              return (
                <div key={key}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-muted-foreground">{CRITERIA[key].label}</span>
                    <span className="font-medium">
                      {value}/{max}
                    </span>
                  </div>
                  <Progress value={(value / max) * 100} className="h-2" />
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex items-end gap-3 border-t border-border pt-5">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Pontuação manual (opcional)</label>
              <Input
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                placeholder={String(app.auto_score ?? 0)}
                className="mt-1 h-11 rounded-xl bg-secondary/40"
              />
            </div>
            <Button
              className="rounded-full"
              onClick={() =>
                patch.mutate({
                  data: {
                    id,
                    manual_score: manual.trim() === "" ? null : Math.max(0, Math.min(100, Number(manual))),
                  },
                })
              }
            >
              Guardar
            </Button>
          </div>
        </div>

        <div className="surface-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Análise automática</h2>
          {analysis.recomendacao && (
            <p className="mt-4 inline-flex rounded-full bg-primary/15 px-4 py-1.5 text-sm text-primary">
              {RECOMMENDATION_LABEL[analysis.recomendacao]}
            </p>
          )}
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{analysis.resumo}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pontos fortes</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {(analysis.fortes ?? []).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">A melhorar</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {(analysis.fracos ?? []).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          </div>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            {[
              ["Perfil", analysis.perfil],
              ["Potencial", analysis.potencial],
              ["Adaptação", analysis.adaptacao],
            ].map(([label, value]) =>
              value ? (
                <div key={label as string}>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
                  <dd className="text-foreground/90">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>
        </div>
      </div>

      <div className="surface-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold">Notas internas</h2>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="Observações da equipa sobre este candidato..."
          className="mt-4 resize-none rounded-xl bg-secondary/40"
        />
        <Button
          className="mt-3 rounded-full"
          onClick={() => patch.mutate({ data: { id, admin_notes: notes } })}
        >
          Guardar notas
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Respostas completas</h2>
        {FORM_STEPS.map((step) => {
          const rows = step.fields
            .map((field) => {
              if (field.type === "photo" || field.type === "info") return null;
              const raw = answers[field.id];
              const text = Array.isArray(raw)
                ? raw.join(", ")
                : typeof raw === "boolean"
                  ? raw
                    ? "Sim"
                    : "Não"
                  : String(raw ?? "");
              return text ? { label: field.label, text } : null;
            })
            .filter(Boolean) as { label: string; text: string }[];
          if (!rows.length) return null;
          return (
            <div key={step.id} className="surface-card rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-primary">{step.title}</h3>
              <dl className="mt-4 space-y-4">
                {rows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs text-muted-foreground">{row.label}</dt>
                    <dd className="mt-1 text-sm whitespace-pre-wrap text-foreground/90">{row.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>

      {history.length > 0 && (
        <div className="surface-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Histórico de estados</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {history.map((h) => (
              <li key={h.id}>
                {formatDate(h.created_at)} — {STATUS_LABEL[h.from_status ?? ""] ?? h.from_status ?? "—"}{" "}
                → {STATUS_LABEL[h.to_status] ?? h.to_status}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
