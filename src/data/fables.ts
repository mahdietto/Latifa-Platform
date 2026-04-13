import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

import fableFox from "@/assets/fable-fox.jpg";
import fableTortoise from "@/assets/fable-tortoise.jpg";
import fableCrow from "@/assets/fable-crow.jpg";
import fableLion from "@/assets/fable-lion.jpg";
import fableAnt from "@/assets/fable-ant.jpg";
import fableWolf from "@/assets/fable-wolf.jpg";

const fallbackImages: Record<string, string> = {
  "corbeau-renard": fableCrow,
  "cigale-fourmi": fableAnt,
  "lievre-tortue": fableTortoise,
  "lion-rat": fableLion,
  "renard-raisins": fableFox,
  "loup-agneau": fableWolf,
};

export interface Fable {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  image: string;
  difficulty: "Facile" | "Moyen" | "Difficile";
  duration: string;
  moral: string;
  story: string;
  videoUrl?: string;
  hasGame: boolean;
  theme: string;
}

function rowToFable(row: any): Fable {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    teaser: row.teaser,
    image: row.image_url || fallbackImages[row.slug] || fableFox,
    difficulty: row.difficulty as Fable["difficulty"],
    duration: row.duration,
    moral: row.moral,
    story: row.story,
    videoUrl: row.video_url,
    hasGame: row.has_game,
    theme: row.theme || "",
  };
}

export function useFables() {
  const [fables, setFables] = useState<Fable[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFables = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("fables")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setFables(data.map(rowToFable));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFables();
  }, [fetchFables]);

  return { fables, loading, refetch: fetchFables };
}
