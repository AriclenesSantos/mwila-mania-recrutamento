import { createHash } from "node:crypto";
import { z } from "zod";
import { scoreApplication } from "./scoring";
import type { FormValues } from "./form-schema";

const clean = (v: unknown, max = 5000) =>
  typeof v === "string" ? v.replace(/\u0000/g, "").trim().slice(0, max) : "";

export const submissionSchema = z.object({
  values: z.record(z.string(), z.unknown()),
});

export function sanitizeValues(raw: Record<string, unknown>): FormValues {
  const out: FormValues = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!/^[a-z0-9_]{1,60}$/.test(key)) continue;
    if (Array.isArray(value)) {
      out[key] = value.slice(0, 40).map((v) => clean(v, 120));
    } else if (typeof value === "boolean") {
      out[key] = value;
    } else {
      out[key] = clean(value);
    }
  }
  return out;
}

const requiredCore = ["full_name", "age", "city", "phone", "email", "vaga"];

export function validateSubmission(values: FormValues) {
  const errors: string[] = [];
  for (const key of requiredCore) {
    if (!String(values[key] ?? "").trim()) errors.push(`Campo obrigatório em falta: ${key}`);
  }
  const email = String(values.email ?? "");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Email inválido");
  const age = Number(values.age);
  if (!Number.isFinite(age) || age < 12 || age > 90) errors.push("Idade inválida");
  if (values.declara_verdade !== true) errors.push("Declaração de veracidade obrigatória");
  if (values.declara_contacto !== true) errors.push("Autorização de contacto obrigatória");
  return errors;
}

export function hashIp(ip: string) {
  return createHash("sha256").update(`mwila:${ip}`).digest("hex");
}

export function extractIp(headers: Headers) {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

export function buildRow(values: FormValues) {
  const { score, breakdown, analysis } = scoreApplication(values);
  return {
    full_name: String(values.full_name ?? ""),
    age: Number(values.age) || null,
    gender: (values.gender as string) || null,
    city: (values.city as string) || null,
    phone: (values.phone as string) || null,
    email: (values.email as string) || null,
    socials: JSON.parse(
      JSON.stringify({
        facebook: values.facebook ?? "",
        instagram: values.instagram ?? "",
        tiktok: values.tiktok ?? "",
        linkedin: values.linkedin ?? "",
      }),
    ),
    vacancy: String(values.vaga ?? "Aceito qualquer uma"),
    answers: JSON.parse(JSON.stringify(values)),
    auto_score: score,
    score_breakdown: JSON.parse(JSON.stringify(breakdown)),
    analysis: JSON.parse(JSON.stringify(analysis)),
  };
}
