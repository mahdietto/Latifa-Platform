import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface StudentProgress {
  id: string;
  user_id: string;
  fable_id: string;
  video_watched: boolean;
  story_read: boolean;
  games_completed: string[];
  completed: boolean;
  stars: number;
  game_attempts: Record<string, number>;
}

export function useStudentProgress(fableId?: string) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [allProgress, setAllProgress] = useState<StudentProgress[]>([]);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    if (fableId) {
      const { data } = await supabase
        .from("student_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("fable_id", fableId)
        .maybeSingle();
      setProgress(data ? {
        ...data,
        games_completed: (data.games_completed as string[]) || [],
        game_attempts: (data.game_attempts as Record<string, number>) || {},
      } : null);
    } else {
      const { data } = await supabase
        .from("student_progress")
        .select("*")
        .eq("user_id", user.id);
      setAllProgress((data || []).map(d => ({
        ...d,
        games_completed: (d.games_completed as string[]) || [],
        game_attempts: (d.game_attempts as Record<string, number>) || {},
      })));
    }
  }, [user, fableId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateProgress = useCallback(
    async (fId: string, updates: Partial<StudentProgress>) => {
      if (!user) return;
      const existing = progress || (await supabase.from("student_progress").select("*").eq("user_id", user.id).eq("fable_id", fId).maybeSingle()).data;
      if (existing) {
        await supabase.from("student_progress").update(updates).eq("user_id", user.id).eq("fable_id", fId);
      } else {
        await supabase.from("student_progress").insert({
          user_id: user.id,
          fable_id: fId,
          ...updates,
        });
      }
      fetchProgress();
    },
    [user, progress, fetchProgress]
  );

  const markGameCompleted = useCallback(
    async (fId: string, gameId: string) => {
      if (!user) return;
      const { data: existing } = await supabase.from("student_progress").select("*").eq("user_id", user.id).eq("fable_id", fId).maybeSingle();
      if (existing) {
        const current = (existing.games_completed as string[]) || [];
        const attempts = (existing.game_attempts as Record<string, number>) || {};
        attempts[gameId] = (attempts[gameId] || 0) + 1;
        const newCompleted = current.includes(gameId) ? current : [...current, gameId];
        await supabase.from("student_progress").update({
          games_completed: newCompleted,
          game_attempts: attempts,
        }).eq("id", existing.id);
      } else {
        await supabase.from("student_progress").insert({
          user_id: user.id,
          fable_id: fId,
          games_completed: [gameId],
          game_attempts: { [gameId]: 1 },
        });
      }
      fetchProgress();
    },
    [user, fetchProgress]
  );

  return { progress, allProgress, updateProgress, markGameCompleted, refetch: fetchProgress };
}

// Utility functions for stars calculation
export function calculateStars(gameAttempts: Record<string, number>, totalGames: number): number {
  if (totalGames === 0) return 3;
  const perfectGames = Object.values(gameAttempts).filter(n => n === 1).length;
  const ratio = perfectGames / totalGames;
  if (ratio >= 1) return 5;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
}
