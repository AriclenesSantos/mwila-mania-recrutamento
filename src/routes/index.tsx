import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Clock,
  Sparkles,
  PenTool,
  Film,
  Palette,
  ShieldCheck,
  Rocket,
  HeartHandshake,
  Lightbulb,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import imgCopywriter from "@/assets/vaga-copywriter.jpg";
import imgEditor from "@/assets/vaga-editor.jpg";
import imgDesigner from "@/assets/vaga-designer.jpg";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mwila Mania | Recrutamento da equipa geek de Angola" },
      {
        name: "description",
        content:
          "Candidata-te à equipa da Mwila Mania: vagas para Copywriter, Editor de Vídeo e Designer Gráfico na maior comunidade geek de Angola.",
      },
      { property: "og:title", content: "Mwila Mania | Recrutamento da equipa geek de Angola" },
      {
        property: "og:description",
        content:
          "Candidata-te à equipa da Mwila Mania: vagas para Copywriter, Editor de Vídeo e Designer Gráfico na maior comunidade geek de Angola.",
      },
    ],
  }),
  component: Landing,
});

const VAGAS = [
  {
    icon: PenTool,
    image: imgCopywriter,
    title: "Copywriter",
    count: "2 vagas",
    text: "Escreve publicações que fazem a comunidade comentar, partilhar e voltar.",
  },
  {
    icon: Film,
    image: imgEditor,
    title: "Editor de Vídeo",
    count: "1 vaga",
    text: "Transforma cenas de animes e cultura pop em vídeos curtos e viciantes.",
  },
  {
    icon: Palette,
    image: imgDesigner,
    title: "Designer Gráfico",
    count: "2 vagas",
    text: "Cria cartazes e artes que se destacam no feed e definem a nossa identidade.",
  },
];


const REQUISITOS = [
  { icon: Lightbulb, label: "Vontade de aprender" },
  { icon: ShieldCheck, label: "Compromisso" },
  { icon: Sparkles, label: "Criatividade" },
  { icon: Rocket, label: "Responsabilidade" },
  { icon: HeartHandshake, label: "Gostar do universo geek" },
];

function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="hero-aura pointer-events-none absolute inset-0 -z-10" />
      <div className="grid-noise pointer-events-none absolute inset-0 -z-10 opacity-40" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Logo />
        <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground">
          <Link to="/auth">Entrar</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-5 pt-10 pb-20 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="mt-6 text-4xl leading-[1.05] font-bold sm:text-6xl">
            Junta-te à próxima geração da{" "}
            <span className="text-gradient">Mwila Mania</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A Mwila Mania procura pessoas apaixonadas pela cultura geek que queiram crescer connosco
            e ajudar a construir a maior comunidade geek de Angola.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="h-13 rounded-full px-8 text-base font-semibold glow">
              <Link to="/candidatar">
                Candidatar-me <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" /> 15 a 20 minutos
            </span>
          </div>
        </motion.div>

        <div className="mt-20 grid gap-5 sm:grid-cols-3">
          {VAGAS.map((vaga, i) => (
            <motion.article
              key={vaga.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="surface-card group overflow-hidden rounded-3xl transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-background/40">
                <img
                  src={vaga.image}
                  alt={`Ilustração da vaga de ${vaga.title}`}
                  className="size-full object-cover grayscale contrast-125 transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-primary/55 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <vaga.icon className="size-8 text-primary" />
                <div className="mt-5 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">{vaga.title}</h2>
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs text-accent">
                    {vaga.count}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{vaga.text}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="surface-card mt-16 rounded-3xl p-7 sm:p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">Não é preciso experiência profissional</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Somos uma comunidade dedicada à cultura geek em Angola: informamos, entretemos e unimos
            fãs de animes, filmes, séries, jogos, tecnologia e cultura pop. O mais importante é:
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REQUISITOS.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-sm"
              >
                <item.icon className="size-4 shrink-0 text-primary" />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 flex flex-col items-center gap-5 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Estamos a montar a próxima geração. Vens?
          </h2>
          <Button asChild size="lg" className="h-13 rounded-full px-8 text-base font-semibold glow">
            <Link to="/candidatar">
              Candidatar-me <ArrowRight className="ml-2 size-5" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between sm:text-left">
          <span>© {new Date().getFullYear()} Mwila Mania · Comunidade geek de Angola</span>
          <a href="https://wa.me/244942475542" className="hover:text-primary">
            +244 942 475 542
          </a>
        </div>
      </footer>
    </main>
  );
}
