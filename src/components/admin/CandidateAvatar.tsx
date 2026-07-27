import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Loader2, Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getPhotoUrl } from "@/lib/applications.functions";
import { answersOf, initials, type AppRow } from "@/lib/applications";
import { cn } from "@/lib/utils";

export function photoPathOf(app: AppRow) {
  const value = answersOf(app).photo_path;
  return typeof value === "string" ? value : "";
}

export function useCandidatePhoto(path: string) {
  const fetchUrl = useServerFn(getPhotoUrl);
  return useQuery({
    queryKey: ["candidate-photo", path],
    queryFn: () => fetchUrl({ data: { path } }),
    enabled: Boolean(path),
    staleTime: 30 * 60 * 1000,
  });
}

async function downloadPhoto(url: string, name: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${name.replace(/\s+/g, "-").toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noreferrer");
  }
}

export function CandidateAvatar({
  app,
  className,
  textClassName,
}: {
  app: AppRow;
  className?: string;
  textClassName?: string;
}) {
  const path = photoPathOf(app);
  const { data, isLoading } = useCandidatePhoto(path);
  const [open, setOpen] = useState(false);
  const url = data?.url ?? null;
  const name = app.full_name;

  if (!url) {
    return (
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary",
          className,
          textClassName,
        )}
      >
        {isLoading && path ? <Loader2 className="size-4 animate-spin" /> : initials(name)}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        title="Ver fotografia"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "group relative size-11 shrink-0 overflow-hidden rounded-full ring-1 ring-border transition-transform hover:scale-105",
          className,
        )}
      >
        <img src={url} alt={`Fotografia de ${name}`} className="size-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 className="size-4 text-foreground" />
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="text-base">{name}</DialogTitle>
          <img
            src={url}
            alt={`Fotografia de ${name}`}
            className="max-h-[70vh] w-full rounded-xl object-contain"
          />
          <div className="flex justify-end">
            <Button className="rounded-full" onClick={() => downloadPhoto(url, name)}>
              <Download className="mr-2 size-4" /> Baixar fotografia
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
