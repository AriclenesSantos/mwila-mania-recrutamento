import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { FieldDef, FormValues } from "@/lib/form-schema";

interface Props {
  field: FieldDef;
  values: FormValues;
  error?: boolean;
  onChange: (id: string, value: string | string[] | boolean) => void;
}

export function FieldRenderer({ field, values, error, onChange }: Props) {
  const value = values[field.id];

  return (
    <div className="space-y-3">
      {field.type !== "consent" && (
        <Label className="block text-sm leading-relaxed font-medium text-foreground/90">
          {field.label}
          {field.optional && <span className="ml-2 text-xs text-muted-foreground">(opcional)</span>}
        </Label>
      )}
      {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}

      {(field.type === "text" ||
        field.type === "email" ||
        field.type === "tel" ||
        field.type === "number") && (
        <Input
          type={field.type === "number" ? "number" : field.type}
          inputMode={field.type === "number" ? "numeric" : undefined}
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          maxLength={field.type === "number" ? 3 : 300}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={cn(
            "h-12 rounded-xl border-border bg-secondary/40",
            error && "border-destructive",
          )}
        />
      )}

      {field.type === "textarea" && (
        <Textarea
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          maxLength={5000}
          rows={5}
          onChange={(e) => onChange(field.id, e.target.value)}
          className={cn(
            "rounded-xl border-border bg-secondary/40 resize-none",
            error && "border-destructive",
          )}
        />
      )}

      {field.type === "radio" && (
        <div className="grid gap-2 sm:grid-cols-2">
          {field.options?.map((option) => {
            const active = value === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(field.id, option)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200",
                  active
                    ? "border-primary bg-primary/12 text-foreground glow"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  error && !active && "border-destructive/50",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {field.type === "checkboxes" && (
        <div className="flex flex-wrap gap-2">
          {field.options?.map((option) => {
            const list = Array.isArray(value) ? value : [];
            const active = list.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  onChange(
                    field.id,
                    active ? list.filter((o) => o !== option) : [...list, option],
                  )
                }
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                  active
                    ? "border-accent bg-accent/15 text-foreground"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-accent/50 hover:text-foreground",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {field.type === "photo" && (
        <PhotoField
          value={typeof value === "string" ? value : ""}
          error={error}
          onChange={(v) => onChange(field.id, v)}
        />
      )}

      {field.type === "info" && (
        <div className="rounded-xl border border-border bg-secondary/30 p-4">
          <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {field.content?.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
      )}

      {field.type === "consent" && (

        <label
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
            value === true ? "border-primary bg-primary/10" : "border-border bg-secondary/30",
            error && value !== true && "border-destructive",
          )}
        >
          <Checkbox
            checked={value === true}
            onCheckedChange={(checked) => onChange(field.id, checked === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-muted-foreground">{field.label}</span>
        </label>
      )}
    </div>
  );
}

function PhotoField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: boolean;
  onChange: (value: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Escolhe um ficheiro de imagem (JPG ou PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("A fotografia deve ter no máximo 5 MB.");
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("candidate-photos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      onChange(path);
      setPreview(URL.createObjectURL(file));
    } catch {
      setMessage("Não foi possível enviar a fotografia. Tenta novamente.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center transition-colors",
          value ? "border-primary bg-primary/10" : "border-border bg-secondary/30",
          error && !value && "border-destructive",
        )}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        {preview ? (
          <img
            src={preview}
            alt="Pré-visualização da fotografia enviada"
            className="size-28 rounded-full object-cover"
          />
        ) : uploading ? (
          <Loader2 className="size-7 animate-spin text-primary" />
        ) : (
          <Upload className="size-7 text-primary" />
        )}
        <span className="text-sm text-muted-foreground">
          {uploading
            ? "A enviar fotografia..."
            : value
              ? "Fotografia enviada. Toca para substituir."
              : "Toca para escolher uma fotografia (JPG ou PNG, até 5 MB)."}
        </span>
      </label>
      {message && <p className="text-sm text-destructive">{message}</p>}
    </div>
  );
}
