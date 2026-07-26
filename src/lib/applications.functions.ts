import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((data: { values: Record<string, unknown> }) => data)
  .handler(async ({ data }) => {
    const {
      sanitizeValues,
      validateSubmission,
      buildRow,
      hashIp,
      extractIp,
    } = await import("./applications.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const values = sanitizeValues(data.values ?? {});
    const errors = validateSubmission(values);
    if (errors.length) return { ok: false as const, errors };

    const request = getRequest();
    const ipHash = hashIp(extractIp(request.headers));
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("submission_log")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);

    if ((count ?? 0) >= 3) {
      return {
        ok: false as const,
        errors: ["Demasiadas submissões seguidas. Tenta novamente dentro de alguns minutos."],
      };
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("applications")
      .insert(buildRow(values))
      .select("id")
      .single();

    if (error) return { ok: false as const, errors: ["Não foi possível guardar a candidatura."] };

    await supabaseAdmin.from("submission_log").insert({ ip_hash: ipHash });
    return { ok: true as const, id: inserted.id };
  });

export const getPhotoUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { path: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed } = await supabaseAdmin.storage
      .from("candidate-photos")
      .createSignedUrl(data.path, 60 * 60);
    return { url: signed?.signedUrl ?? null };
  });

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: app, error } = await context.supabase
      .from("applications")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    const { data: history } = await context.supabase
      .from("application_status_history")
      .select("*")
      .eq("application_id", data.id)
      .order("created_at", { ascending: false });
    return { app, history: history ?? [] };
  });

export const updateApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      status?: string;
      favorite?: boolean;
      admin_notes?: string;
      manual_score?: number | null;
      tags?: string[];
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    if (patch.status) {
      const { data: prev } = await context.supabase
        .from("applications")
        .select("status")
        .eq("id", id)
        .maybeSingle();
      if (prev && prev.status !== patch.status) {
        await context.supabase.from("application_status_history").insert({
          application_id: id,
          from_status: prev.status,
          to_status: patch.status,
          changed_by: context.userId,
        });
      }
    }
    const { error } = await context.supabase
      .from("applications")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(patch as any)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("applications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
