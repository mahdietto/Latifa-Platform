import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Fabuliste {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  description: string;
}

export function useFabulistes() {
  const [fabulistes, setFabulistes] = useState<Fabuliste[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFabulistes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("fabulistes")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setFabulistes(data as any as Fabuliste[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFabulistes();
  }, [fetchFabulistes]);

  return { fabulistes, loading, refetch: fetchFabulistes };
}

export function useFabulisteFables(fabulisteId: string | undefined) {
  const [fables, setFables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fabulisteId) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await (supabase as any)
        .from("fables")
        .select("*")
        .eq("fabuliste_id", fabulisteId)
        .order("created_at", { ascending: true });
      setFables(data || []);
      setLoading(false);
    };
    fetch();
  }, [fabulisteId]);

  return { fables, loading };
}
