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
