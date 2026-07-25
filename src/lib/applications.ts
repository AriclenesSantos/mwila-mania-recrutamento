import type { Tables } from "@/integrations/supabase/types";
import type { Analysis, ScoreBreakdown } from "./scoring";

export type AppRow = Tables<"applications">;
export type HistoryRow = Tables<"application_status_history">;

export function effectiveScore(app: AppRow) {
  return app.manual_score ?? app.auto_score ?? 0;
}

export function breakdownOf(app: AppRow): ScoreBreakdown {
  return (app.score_breakdown ?? {}) as unknown as ScoreBreakdown;
}

export function analysisOf(app: AppRow): Analysis {
  return (app.analysis ?? {}) as unknown as Analysis;
}

export function answersOf(app: AppRow): Record<string, unknown> {
  return (app.answers ?? {}) as Record<string, unknown>;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function whatsappLink(phone: string | null, name: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  const message = `Olá, ${name.split(" ")[0]}.\n\nA tua candidatura à Mwila Mania foi analisada.\nGostaríamos de conversar contigo sobre as próximas etapas.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(email: string | null, name: string) {
  const subject = "Candidatura Mwila Mania";
  const body = `Olá, ${name.split(" ")[0]}.\n\nA tua candidatura à Mwila Mania foi analisada.\nGostaríamos de conversar contigo sobre as próximas etapas.\n\nEquipa Mwila Mania`;
  return `mailto:${email ?? ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
