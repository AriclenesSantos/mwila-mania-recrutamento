import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, PartyPopper } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FieldRenderer } from "./FieldRenderer";
import { FORM_STEPS, visibleFields, type FormValues } from "@/lib/form-schema";
import { submitApplication } from "@/lib/applications.functions";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mwila-candidatura-v1";

export function ApplicationWizard() {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const submit = useServerFn(submitApplication);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { values?: FormValues; step?: number };
        if (parsed.values) setValues(parsed.values);
        if (typeof parsed.step === "number") setStep(Math.min(parsed.step, FORM_STEPS.length - 1));
      }
    } catch {
      /* ignora dados corrompidos */
    }
  }, []);

  useEffect(() => {
    if (done) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ values, step }));
    } catch {
      /* armazenamento indisponível */
    }
  }, [values, step, done]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const target = document.getElementById("wizard-top");
      const top = target ? target.getBoundingClientRect().top + window.scrollY - 96 : 0;
      window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
      document.documentElement.scrollTop = Math.max(top, 0);
      document.body.scrollTop = Math.max(top, 0);
    });
    return () => cancelAnimationFrame(id);
  }, [step, done]);

  const current = FORM_STEPS[step];
  const fields = useMemo(() => visibleFields(current, values), [current, values]);
  const progress = Math.round(((step + (done ? 1 : 0)) / FORM_STEPS.length) * 100);

  function update(id: string, value: string | string[] | boolean) {
    setValues((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => prev.filter((e) => e !== id));
  }

  function validate() {
    const missing = fields
      .filter((f) => {
        if (f.optional || f.type === "info") return false;
        const v = values[f.id];

        if (f.type === "consent") return v !== true;
        if (f.type === "checkboxes") return !Array.isArray(v) || v.length === 0;
        return !String(v ?? "").trim();
      })
      .map((f) => f.id);
    setErrors(missing);
    return missing.length === 0;
  }

  function next() {
    if (!validate()) return;
    if (step < FORM_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      void send();
    }
  }

  async function send() {
    setSubmitting(true);
    setServerErrors([]);
    try {
      const result = await submit({ data: { values: values as Record<string, unknown> } });
      if (result.ok) {
        setDone(true);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        setServerErrors(result.errors);
      }
    } catch {
      setServerErrors(["Ocorreu um erro ao enviar. Verifica a tua ligação e tenta novamente."]);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card mx-auto max-w-2xl rounded-3xl p-8 text-center sm:p-12"
      >
        <PartyPopper className="mx-auto size-12 text-primary" />
        <h2 className="mt-6 text-3xl font-bold">Obrigado!</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Agradecemos o teu interesse em fazer parte da Mwila Mania. A nossa equipa irá analisar
          cuidadosamente todas as candidaturas. Caso sejas selecionado(a) para a próxima fase,
          entraremos em contacto através do WhatsApp ou Email.
        </p>
        <p className="mt-4 font-display text-lg text-gradient">
          Boa sorte! Esperamos ver-te a crescer connosco.
        </p>
        <Button asChild variant="secondary" className="mt-8 rounded-full">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div id="wizard-top" className="mx-auto max-w-3xl scroll-mt-24">
      <div className="mb-8">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">
              Etapa {step + 1} de {FORM_STEPS.length}
            </p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{current.title}</h2>
            {current.description && (
              <p className="mt-1 text-sm text-muted-foreground">{current.description}</p>
            )}
          </div>
          <span className="font-display text-2xl text-muted-foreground">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundImage: "var(--gradient-primary)" }}
            animate={{ width: `${Math.max(progress, 4)}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {FORM_STEPS.map((s, i) => (
            <span
              key={s.id}
              className={cn(
                "h-1.5 flex-1 min-w-6 rounded-full transition-colors",
                i <= step ? "bg-primary" : "bg-secondary",
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="surface-card space-y-8 rounded-3xl p-5 sm:p-8"
        >
          {fields.map((field, index) => {
            const previous = fields[index - 1];
            const showGroup = field.group && field.group !== previous?.group;
            return (
              <div key={field.id} className="space-y-3">
                {showGroup && (
                  <p className="pt-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {field.group}
                  </p>
                )}
                <FieldRenderer
                  field={field}
                  values={values}
                  error={errors.includes(field.id)}
                  onChange={update}
                />
              </div>
            );
          })}

          {errors.length > 0 && (
            <p className="rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive">
              Preenche os {errors.length} campo(s) em falta para continuar.
            </p>
          )}
          {serverErrors.length > 0 && (
            <ul className="space-y-1 rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive">
              {serverErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          className="rounded-full"
          disabled={step === 0 || submitting}
          onClick={() => {
            setStep(Math.max(0, step - 1));
          }}
        >
          <ArrowLeft className="mr-2 size-4" /> Anterior
        </Button>
        <Button
          type="button"
          size="lg"
          className="rounded-full px-7 font-semibold glow"
          disabled={submitting}
          onClick={next}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> A enviar...
            </>
          ) : step === FORM_STEPS.length - 1 ? (
            <>
              <CheckCircle2 className="mr-2 size-4" /> Submeter candidatura
            </>
          ) : (
            <>
              Continuar <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        As tuas respostas são guardadas automaticamente neste dispositivo.
      </p>
    </div>
  );
}
