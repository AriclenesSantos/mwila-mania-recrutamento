import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock } from "lucide-react";

import { ApplicationWizard } from "@/components/apply/Wizard";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/candidatar")({
  head: () => ({
    meta: [
      { title: "Candidatura | Mwila Mania" },
      {
        name: "description",
        content:
          "Formulário de candidatura à equipa da Mwila Mania. Sete etapas, 15 a 20 minutos, respostas guardadas automaticamente.",
      },
      { property: "og:title", content: "Candidatura à equipa Mwila Mania" },
      {
        property: "og:description",
        content: "Preenche as sete etapas e mostra-nos porque deves fazer parte da comunidade.",
      },
    ],
  }),
  component: ApplyPage,
});

function ApplyPage() {
  return (
    <main className="relative min-h-screen">
      <div className="hero-aura pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Logo />
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Início
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-5 pb-10">
        <div className="surface-card rounded-3xl p-6 sm:p-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Bem-vindo ao <span className="text-gradient">Recrutamento Mwila Mania</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Somos uma comunidade angolana dedicada à cultura geek e estamos a expandir a nossa
            equipa. Responde com sinceridade — queremos conhecer-te de verdade.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-primary">
            <Clock className="size-4" /> Tempo estimado: 15 a 20 minutos
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-20">
        <ApplicationWizard />
      </section>
    </main>
  );
}
