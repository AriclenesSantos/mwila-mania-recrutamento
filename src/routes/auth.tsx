import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LockKeyhole, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso da equipa | Mwila Mania" },
      {
        name: "description",
        content: "Área reservada à equipa de recrutamento da Mwila Mania.",
      },
      { property: "og:title", content: "Acesso da equipa | Mwila Mania" },
      { property: "og:description", content: "Área reservada à equipa da Mwila Mania." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError("Email ou palavra-passe incorretos.");
      return;
    }
    void navigate({ to: "/admin", replace: true });
  }

  return (
    <main className="relative flex min-h-screen flex-col">
      <div className="hero-aura pointer-events-none absolute inset-0 -z-10 opacity-70" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <Logo />
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Início
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 pb-20">
        <form onSubmit={onSubmit} className="surface-card w-full max-w-md rounded-3xl p-7 sm:p-9">
          <LockKeyhole className="size-8 text-primary" />
          <h1 className="mt-5 text-2xl font-bold">Área da equipa</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesso restrito à gestão de candidaturas.
          </p>

          <div className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-secondary/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Palavra-passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl bg-secondary/40"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-destructive/15 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="mt-6 w-full rounded-full font-semibold"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
