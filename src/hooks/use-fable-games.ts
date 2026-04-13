import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FableGame {
  id: string;
  fable_id: string;
  game_type: string;
  title: string;
  game_data: any;
  sort_order: number;
}

export function useFableGames(fableId: string | undefined) {
  const [games, setGames] = useState<FableGame[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    if (!fableId) {
      setGames([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("fable_games")
      .select("*")
      .eq("fable_id", fableId)
      .order("sort_order", { ascending: true });
    if (!error && data) {
      setGames(data as FableGame[]);
    }
    setLoading(false);
  }, [fableId]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, refetch: fetchGames };
}
