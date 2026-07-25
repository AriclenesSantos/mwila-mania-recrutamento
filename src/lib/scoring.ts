import type { FormValues } from "./form-schema";

export interface ScoreBreakdown {
  afinidade: number; // 20
  geek: number; // 20
  criatividade: number; // 20
  disponibilidade: number; // 15
  compromisso: number; // 15
  experiencia: number; // 10
}

export interface Analysis {
  resumo: string;
  fortes: string[];
  fracos: string[];
  perfil: string;
  potencial: string;
  adaptacao: string;
  justificacao: string;
  recomendacao: "forte" | "recomendo" | "talvez" | "nao";
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const arr = (v: unknown) => (Array.isArray(v) ? v : []);
const words = (v: unknown) => str(v).split(/\s+/).filter(Boolean).length;

/** Pontua um texto longo pela profundidade da resposta. */
function textDepth(v: unknown, max: number) {
  const w = words(v);
  if (w === 0) return 0;
  if (w < 12) return max * 0.25;
  if (w < 30) return max * 0.5;
  if (w < 70) return max * 0.8;
  return max;
}

function pick(v: unknown, table: Record<string, number>, max: number) {
  const key = str(v);
  return key in table ? table[key] : max * 0.3;
}

export function scoreApplication(values: FormValues): {
  score: number;
  breakdown: ScoreBreakdown;
  analysis: Analysis;
} {
  // 1. Afinidade com a Mwila Mania — 20
  const tempo = pick(
    values.tempo_acompanha,
    {
      "Menos de 6 meses": 3,
      "Entre 6 meses e 1 ano": 5,
      "Entre 1 e 2 anos": 6.5,
      "Mais de 2 anos": 8,
    },
    4,
  );
  const freq = pick(
    values.frequencia,
    { "Todos os dias": 5, "Algumas vezes por semana": 3.5, Raramente: 1.5 },
    2,
  );
  const afinidade = Math.min(
    20,
    tempo + freq + textDepth(values.conteudo_favorito, 3.5) + textDepth(values.sugestoes, 3.5),
  );

  // 2. Conhecimento geek — 20
  const nivel = pick(
    values.nivel_geek,
    { Baixo: 2, "Médio": 4.5, Alto: 6.5, "Muito Alto": 8 },
    4,
  );
  const conteudos = Math.min(4, arr(values.conteudos_geek).length * 0.5);
  const listas =
    (words(values.animes_favoritos) >= 4 ? 2 : words(values.animes_favoritos) > 0 ? 1 : 0) +
    (words(values.series_favoritas) >= 2 ? 1.5 : words(values.series_favoritas) > 0 ? 0.75 : 0) +
    (str(values.jogo_favorito) ? 1 : 0);
  const geek = Math.min(
    20,
    nivel +
      conteudos +
      listas +
      textDepth(values.universo_dominado, 3) +
      textDepth(values.criador_admirado, 2.5),
  );

  // 3. Criatividade — 20
  const autoCriatividade = pick(
    values.criatividade,
    { Baixa: 1.5, "Média": 3, Alta: 4.5, "Muito Alta": 5.5 },
    3,
  );
  const desafios =
    textDepth(values.desafio_copywriter, 4) +
    textDepth(values.desafio_editor, 4) +
    textDepth(values.desafio_designer, 4);
  const criatividade = Math.min(
    20,
    autoCriatividade +
      Math.min(6, desafios) +
      textDepth(values.texto_livre, 4.5) +
      textDepth(values.crescimento_6_meses, 4),
  );

  // 4. Disponibilidade — 15
  const horas = pick(
    values.horas_dia,
    { "1 hora": 2, "2 horas": 4, "3 horas": 5.5, "4 horas": 6.5, "Mais de 4 horas": 7 },
    3,
  );
  const inicio = pick(
    values.inicio,
    {
      Imediatamente: 4,
      "Dentro de uma semana": 3,
      "Dentro de um mês": 1.5,
      "Outra data": 1,
    },
    2,
  );
  const infra =
    (values.tem_computador === "Sim" ? 1.5 : 0) +
    (values.tem_internet === "Sim" ? 1.5 : 0) +
    (values.pode_remoto === "Sim" ? 1 : 0);
  const disponibilidade = Math.min(15, horas + inicio + infra);

  // 5. Compromisso — 15
  const prazos = pick(
    values.prazos,
    { Sempre: 5, "Na maioria das vezes": 3.5, "Tenho dificuldades": 1 },
    2,
  );
  const pressao = pick(values.pressao, { Sim: 3, Depende: 2, "Não": 0.5 }, 1.5);
  const critica = pick(
    values.critica,
    { Desanimo: 0.5, "Tento melhorar": 2, "Gosto de receber feedback": 3 },
    1.5,
  );
  const atitude = pick(
    values.tarefa_dificil,
    {
      Desistia: 0,
      "Procurava aprender sozinho": 1.5,
      "Pedia ajuda à equipa": 1.5,
      "Procurava tutoriais e tentava resolver": 2,
    },
    1,
  );
  const aviso = pick(
    values.prazo_apertado,
    {
      "Avisaria imediatamente a equipa e procuraria uma solução": 2,
      "Tentaria concluir mesmo que precisasse de pedir ajuda": 1.5,
      "Entregaria atrasado sem avisar": 0,
      "Deixaria para depois": 0,
    },
    1,
  );
  const compromisso = Math.min(15, prazos + pressao + critica + atitude + aviso);

  // 6. Experiência — 10
  const ferramentas =
    arr(values.ferramentas_copy).length +
    arr(values.ferramentas_edicao).length +
    arr(values.ferramentas_design).length;
  const experiencia = Math.min(
    10,
    (values.tem_experiencia === "Sim" ? 2 : 0) +
      textDepth(values.experiencia_desc, 2) +
      (values.administrou_pagina === "Sim" ? 1.5 : 0) +
      (values.trabalho_remoto_antes === "Sim" ? 1 : 0) +
      Math.min(2, ferramentas * 0.4) +
      (str(values.portfolio) ? 1.5 : 0),
  );

  const breakdown: ScoreBreakdown = {
    afinidade: round(afinidade),
    geek: round(geek),
    criatividade: round(criatividade),
    disponibilidade: round(disponibilidade),
    compromisso: round(compromisso),
    experiencia: round(experiencia),
  };

  const score = Math.max(
    0,
    Math.min(100, Math.round(Object.values(breakdown).reduce((a, b) => a + b, 0))),
  );

  return { score, breakdown, analysis: buildAnalysis(values, breakdown, score) };
}

function round(n: number) {
  return Math.round(n * 10) / 10;
}

const LABELS: Record<keyof ScoreBreakdown, { label: string; max: number }> = {
  afinidade: { label: "Afinidade com a Mwila Mania", max: 20 },
  geek: { label: "Conhecimento Geek", max: 20 },
  criatividade: { label: "Criatividade", max: 20 },
  disponibilidade: { label: "Disponibilidade", max: 15 },
  compromisso: { label: "Compromisso", max: 15 },
  experiencia: { label: "Experiência", max: 10 },
};

export const CRITERIA = LABELS;

function buildAnalysis(
  values: FormValues,
  b: ScoreBreakdown,
  score: number,
): Analysis {
  const entries = (Object.keys(b) as (keyof ScoreBreakdown)[]).map((k) => ({
    key: k,
    label: LABELS[k].label,
    pct: b[k] / LABELS[k].max,
    value: b[k],
    max: LABELS[k].max,
  }));
  const sorted = [...entries].sort((x, y) => y.pct - x.pct);

  const fortes = sorted
    .filter((e) => e.pct >= 0.65)
    .slice(0, 3)
    .map((e) => `${e.label} (${e.value}/${e.max})`);
  const fracos = sorted
    .filter((e) => e.pct < 0.55)
    .slice(-3)
    .map((e) => `${e.label} (${e.value}/${e.max})`);

  if (values.tem_computador === "Não") fracos.push("Não tem computador");
  if (values.tem_internet === "Não") fracos.push("Internet instável");
  if (fortes.length === 0) fortes.push("Sem áreas claramente destacadas");

  const perfilBase =
    values.preferencia_trabalho === "Em equipa"
      ? "Colaborativo, cresce com feedback da equipa"
      : values.preferencia_trabalho === "Sozinho"
        ? "Autónomo, prefere trabalho independente"
        : "Flexível, adapta-se a trabalho individual e em equipa";
  const perfil = `${perfilBase}. Reação a críticas: ${str(values.critica) || "não indicado"}.`;

  const potencial =
    b.criatividade / 20 >= 0.6 && b.compromisso / 15 >= 0.6
      ? "Alto — demonstra criatividade e responsabilidade em simultâneo."
      : b.compromisso / 15 >= 0.6
        ? "Médio-alto — muito responsável, precisa desenvolver criatividade."
        : "Médio — precisa de acompanhamento inicial próximo.";

  const adaptacaoScore = Math.round(
    ((b.afinidade / 20) * 0.4 + (b.compromisso / 15) * 0.35 + (b.disponibilidade / 15) * 0.25) * 100,
  );
  const adaptacao = `${adaptacaoScore}% de probabilidade de boa adaptação à equipa.`;

  const recomendacao: Analysis["recomendacao"] =
    score >= 80 ? "forte" : score >= 65 ? "recomendo" : score >= 45 ? "talvez" : "nao";

  const justificacao = entries
    .map((e) => `${e.label}: ${e.value}/${e.max}`)
    .join(" · ");

  const resumo = `${str(values.full_name) || "Candidato"}, ${str(values.age) || "?"} anos, ${
    str(values.city) || "cidade não indicada"
  }. Candidata-se a ${str(values.vaga) || "qualquer vaga"} com ${score}/100. Disponibilidade de ${
    str(values.horas_dia) || "n/d"
  } por dia, a começar ${(str(values.inicio) || "n/d").toLowerCase()}.`;

  return { resumo, fortes, fracos, perfil, potencial, adaptacao, justificacao, recomendacao };
}

export const RECOMMENDATION_LABEL: Record<Analysis["recomendacao"], string> = {
  forte: "⭐ Recomendo fortemente",
  recomendo: "✅ Recomendo",
  talvez: "⚠️ Talvez",
  nao: "❌ Não recomendado",
};

export const STATUS_LABEL: Record<string, string> = {
  nova: "Nova",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  arquivado: "Arquivado",
};
