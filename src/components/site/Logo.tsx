import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "size-8 text-sm" : size === "lg" ? "size-16 text-2xl" : "size-11 text-lg";
  const title = size === "sm" ? "text-base" : size === "lg" ? "text-3xl" : "text-xl";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "grid place-items-center rounded-2xl font-display font-bold text-primary-foreground",
          dims,
        )}
        style={{ backgroundImage: "var(--gradient-primary)" }}
        aria-hidden
      >
        MM
      </div>
      <div className="leading-none">
        <span className={cn("block font-display font-bold tracking-tight", title)}>
          Mwila Mania
        </span>
        <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          Recrutamento
        </span>
      </div>
    </div>
  );
}
