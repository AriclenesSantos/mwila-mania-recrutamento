import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { listApplications } from "./applications.functions";
import { supabase } from "@/integrations/supabase/client";
import type { AppRow } from "./applications";

export function useApplications() {
  const fetchAll = useServerFn(listApplications);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["applications"],
    queryFn: () => fetchAll() as Promise<AppRow[]>,
  });

  useEffect(() => {
    const channel = supabase
      .channel("applications-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => {
        queryClient.invalidateQueries({ queryKey: ["applications"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
