export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "tel"
  | "radio"
  | "checkboxes"
  | "consent"
  | "photo"
  | "info";

export type FormValues = Record<string, string | string[] | boolean | undefined>;

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];
  optional?: boolean;
  placeholder?: string;
  hint?: string;
  group?: string;
  content?: string[];
  showIf?: (values: FormValues) => boolean;
}

export interface StepDef {
  id: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}


export const VACANCIES = [
  "Copywriter",
  "Editor de Vídeo",
  "Designer Gráfico",
  "Aceito qualquer uma",
] as const;

const yesNo = ["Sim", "Não"];

export const FORM_STEPS: StepDef[] = [
  {
    id: "pessoais",
    title: "Dados Pessoais",
    description: "Vamos começar pelo básico.",
    fields: [
      { id: "full_name", label: "Nome completo", type: "text", group: "Dados básicos" },
      { id: "age", label: "Idade", type: "number", group: "Dados básicos" },
      {
        id: "gender",
        label: "Sexo",
        type: "radio",
        options: ["Masculino", "Feminino", "Prefiro não dizer"],
        optional: true,
        group: "Dados básicos",
      },
      { id: "city", label: "Cidade / Município", type: "text", group: "Dados básicos" },
      {
        id: "phone",
        label: "Telefone (WhatsApp)",
        type: "tel",
        placeholder: "+244 9xx xxx xxx",
        group: "Dados básicos",
      },
      { id: "email", label: "Email", type: "email", group: "Dados básicos" },
      { id: "facebook", label: "Facebook", type: "text", group: "Redes sociais" },
      { id: "instagram", label: "Instagram", type: "text", optional: true, group: "Redes sociais" },
      { id: "tiktok", label: "TikTok", type: "text", optional: true, group: "Redes sociais" },
      { id: "linkedin", label: "LinkedIn", type: "text", optional: true, group: "Redes sociais" },
    ],
  },
  {
    id: "mwila",
    title: "Sobre a Mwila Mania",
    description: "Queremos conhecer a tua ligação com a nossa comunidade.",
    fields: [
      {
        id: "tempo_acompanha",
        label: "Há quanto tempo acompanhas a Mwila Mania?",
        type: "radio",
        options: [
          "Menos de 6 meses",
          "Entre 6 meses e 1 ano",
          "Entre 1 e 2 anos",
          "Mais de 2 anos",
        ],
      },
      {
        id: "onde_conheceu",
        label: "Onde conheceste a Mwila Mania?",
        type: "radio",
        options: ["Facebook", "Instagram", "TikTok", "YouTube", "Amigos", "Outro"],
      },
      {
        id: "frequencia",
        label: "Com que frequência acompanhas os nossos conteúdos?",
        type: "radio",
        options: ["Todos os dias", "Algumas vezes por semana", "Raramente"],
      },
      {
        id: "conteudo_favorito",
        label: "Qual foi o conteúdo da Mwila Mania que mais gostaste?",
        type: "textarea",
      },
      {
        id: "sugestoes",
        label: "O que gostarias de ver mais na nossa página?",
        type: "textarea",
      },
    ],
  },
  {
    id: "geek",
    title: "Cultura Geek",
    description: "A parte divertida.",
    fields: [
      {
        id: "nivel_geek",
        label: "Como classificas o teu conhecimento geek?",
        type: "radio",
        options: ["Baixo", "Médio", "Alto", "Muito Alto"],
      },
      {
        id: "conteudos_geek",
        label: "Que conteúdos geek consomes?",
        type: "checkboxes",
        options: [
          "Animes",
          "Mangás",
          "HQs",
          "Marvel",
          "DC",
          "Filmes",
          "Séries",
          "Doramas",
          "Games",
          "Light Novels",
          "Cosplay",
          "Tecnologia Geek",
          "Outro",
        ],
      },
      { id: "animes_favoritos", label: "Quais são os teus 5 animes favoritos?", type: "text" },
      { id: "series_favoritas", label: "Quais são as tuas séries favoritas?", type: "text" },
      { id: "jogo_favorito", label: "Qual é o teu jogo favorito?", type: "text" },
      {
        id: "universo_dominado",
        label: "Existe algum universo geek em que tenhas bastante conhecimento?",
        type: "textarea",
      },
      {
        id: "criador_admirado",
        label: "Qual é o criador de conteúdo geek que mais admiras? E porquê?",
        type: "textarea",
      },
    ],
  },
  {
    id: "profissional",
    title: "Perfil Profissional",
    description: "Não é obrigatório ter experiência profissional.",
    fields: [
      {
        id: "vaga",
        label: "Qual vaga pretendes?",
        type: "radio",
        options: [...VACANCIES],
      },
      { id: "tem_experiencia", label: "Já tens experiência?", type: "radio", options: yesNo },
      {
        id: "experiencia_desc",
        label: "Se sim, explica.",
        type: "textarea",
        optional: true,
        showIf: (v) => v.tem_experiencia === "Sim",
      },
      {
        id: "administrou_pagina",
        label: "Já administraste alguma página, comunidade ou projeto online?",
        type: "radio",
        options: yesNo,
      },
      {
        id: "administrou_qual",
        label: "Se sim, qual?",
        type: "text",
        optional: true,
        showIf: (v) => v.administrou_pagina === "Sim",
      },
      {
        id: "trabalho_remoto_antes",
        label: "Já trabalhaste em equipa remotamente?",
        type: "radio",
        options: yesNo,
      },
      {
        id: "ferramentas_copy",
        label: "Ferramentas de Copywriting que sabes utilizar",
        type: "checkboxes",
        options: ["ChatGPT", "Google Docs", "Microsoft Word"],
        optional: true,
        group: "Que programas sabes utilizar?",
      },
      {
        id: "ferramentas_edicao",
        label: "Ferramentas de Edição de Vídeo",
        type: "checkboxes",
        options: ["CapCut", "Premiere Pro", "DaVinci Resolve", "After Effects"],
        optional: true,
        group: "Que programas sabes utilizar?",
      },
      {
        id: "ferramentas_design",
        label: "Ferramentas de Design",
        type: "checkboxes",
        options: ["Photoshop", "Illustrator", "Canva", "Figma"],
        optional: true,
        group: "Que programas sabes utilizar?",
      },
      {
        id: "ferramentas_outras",
        label: "Outros programas",
        type: "text",
        optional: true,
        group: "Que programas sabes utilizar?",
      },
      {
        id: "portfolio",
        label: "Tens algum portfólio ou trabalhos que possas mostrar?",
        type: "text",
        placeholder: "Coloca o link, caso tenhas.",
        optional: true,
      },
      { id: "tem_computador", label: "Tens computador?", type: "radio", options: yesNo },
      { id: "tem_internet", label: "Tens Internet estável?", type: "radio", options: yesNo },
      { id: "pode_remoto", label: "Podes trabalhar remotamente?", type: "radio", options: yesNo },
    ],
  },
  {
    id: "disponibilidade",
    title: "Disponibilidade",
    fields: [
      {
        id: "ocupacao",
        label: "O que fazes atualmente?",
        type: "radio",
        options: ["Estudante", "Trabalhador", "Empreendedor", "Desempregado"],
      },
      {
        id: "horas_dia",
        label: "Quantas horas por dia consegues dedicar à Mwila Mania?",
        type: "radio",
        options: ["1 hora", "2 horas", "3 horas", "4 horas", "Mais de 4 horas"],
      },
      {
        id: "periodo",
        label: "Em que período tens mais disponibilidade?",
        type: "radio",
        options: ["Manhã", "Tarde", "Noite", "Madrugada"],
      },
      {
        id: "inicio",
        label: "Se fores selecionado(a), quando poderás começar?",
        type: "radio",
        options: ["Imediatamente", "Dentro de uma semana", "Dentro de um mês", "Outra data"],
      },
      {
        id: "prazos",
        label: "Consegues cumprir prazos?",
        type: "radio",
        options: ["Sempre", "Na maioria das vezes", "Tenho dificuldades"],
      },
      {
        id: "pressao",
        label: "Consegues trabalhar sob pressão?",
        type: "radio",
        options: ["Sim", "Depende", "Não"],
      },
    ],
  },
  {
    id: "personalidade",
    title: "Criatividade e Personalidade",
    fields: [
      {
        id: "porque_mwila",
        label: "Porque queres fazer parte da Mwila Mania?",
        type: "textarea",
      },
      {
        id: "contributo",
        label: "O que achas que podes acrescentar ao projeto?",
        type: "textarea",
      },
      {
        id: "criatividade",
        label: "Como classificas a tua criatividade?",
        type: "radio",
        options: ["Baixa", "Média", "Alta", "Muito Alta"],
      },
      {
        id: "critica",
        label: "Quando recebes uma crítica...",
        type: "radio",
        options: ["Desanimo", "Tento melhorar", "Gosto de receber feedback"],
      },
      {
        id: "preferencia_trabalho",
        label: "Preferes trabalhar...",
        type: "radio",
        options: ["Sozinho", "Em equipa", "Ambos"],
      },
      {
        id: "problema",
        label: "O que fazes quando não sabes resolver um problema?",
        type: "textarea",
      },
      {
        id: "aprendizagem",
        label:
          "Conta-nos algo importante que aprendeste sozinho(a) nos últimos 12 meses. Como conseguiste aprender?",
        type: "textarea",
      },
      {
        id: "tarefa_dificil",
        label: "Se recebesses uma tarefa difícil e não soubesses por onde começar, o que farias?",
        type: "radio",
        options: [
          "Desistia",
          "Procurava aprender sozinho",
          "Pedia ajuda à equipa",
          "Procurava tutoriais e tentava resolver",
        ],
      },
      {
        id: "prazo_apertado",
        label:
          "Se recebesses uma tarefa com prazo para amanhã, mas percebesses que não conseguirias terminá-la a tempo, o que farias?",
        type: "radio",
        options: [
          "Avisaria imediatamente a equipa e procuraria uma solução",
          "Entregaria atrasado sem avisar",
          "Deixaria para depois",
          "Tentaria concluir mesmo que precisasse de pedir ajuda",
        ],
      },
      { id: "qualidade", label: "Qual é a tua maior qualidade?", type: "text" },
      { id: "defeito", label: "Qual é o teu maior defeito?", type: "text" },
    ],
  },
  {
    id: "desafio",
    title: "Desafio Final",
    description: "Última etapa. Mostra-nos como pensas.",
    fields: [
      {
        id: "crescimento_6_meses",
        label:
          "Se fosses contratado(a) hoje, o que farias para ajudar a Mwila Mania a crescer nos próximos seis meses?",
        type: "textarea",
      },
      {
        id: "texto_livre",
        label:
          "Escreve um pequeno texto (entre 5 e 10 linhas) sobre o teu anime, filme, série ou jogo favorito.",
        type: "textarea",
        hint: "Queremos conhecer a tua capacidade de comunicar ideias.",
      },
      {
        id: "desafio_copywriter",
        label:
          "DESAFIO COPYWRITER — Escolhe um anime que gostes e escreve uma publicação para Facebook que incentive as pessoas a comentar e partilhar.",
        type: "textarea",
        showIf: (v) => v.vaga === "Copywriter" || v.vaga === "Aceito qualquer uma",
      },
      {
        id: "desafio_editor",
        label:
          "DESAFIO EDITOR DE VÍDEO — Vais editar um vídeo de 30 segundos sobre um anime. Explica: como prenderias a atenção nos primeiros 3 segundos; que cortes utilizarias; que músicas ou efeitos sonoros colocarias; como terminarias o vídeo para incentivar a interação.",
        type: "textarea",
        showIf: (v) => v.vaga === "Editor de Vídeo" || v.vaga === "Aceito qualquer uma",
      },
      {
        id: "desafio_designer",
        label:
          "DESAFIO DESIGNER GRÁFICO — Vais criar um cartaz para anunciar uma nova temporada de um anime. Explica: as cores que utilizarias; o estilo visual; a tipografia; os elementos gráficos; como farias o cartaz destacar-se nas redes sociais.",
        type: "textarea",
        showIf: (v) => v.vaga === "Designer Gráfico" || v.vaga === "Aceito qualquer uma",
      },
      {
        id: "porque_tu",
        label: "Porque deveríamos escolher-te a ti e não outro candidato?",
        type: "textarea",
      },
      {
        id: "declara_verdade",
        label: "Declaro que todas as informações fornecidas são verdadeiras.",
        type: "consent",
      },
      {
        id: "declara_contacto",
        label:
          "Autorizo a Mwila Mania a contactar-me através do WhatsApp ou Email para dar continuidade ao processo de recrutamento.",
        type: "consent",
      },
    ],
  },
];

export function visibleFields(step: StepDef, values: FormValues): FieldDef[] {
  return step.fields.filter((f) => !f.showIf || f.showIf(values));
}

export function fieldById(id: string): FieldDef | undefined {
  for (const step of FORM_STEPS) {
    const found = step.fields.find((f) => f.id === id);
    if (found) return found;
  }
  return undefined;
}
