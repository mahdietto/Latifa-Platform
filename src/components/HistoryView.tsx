import { useState, useEffect } from "react";
import { ArrowLeft, Star, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface HistoryViewProps {
  onBack: () => void;
}

const HistoryView = ({ onBack }: HistoryViewProps) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: progress } = await supabase
        .from("student_progress")
        .select("*, fables(title)")
        .eq("user_id", user.id);

      if (progress) {
        const enriched = await Promise.all(
          progress.map(async (p) => {
            const { count } = await supabase
              .from("fable_games")
              .select("*", { count: "exact", head: true })
              .eq("fable_id", p.fable_id);
            return { ...p, fableTitle: (p.fables as any)?.title || "—", totalGames: count || 0 };
          })
        );
        setEntries(enriched);
      }
    };
    load();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Button variant="ghost" onClick={onBack} className="mb-6 gap-2 font-body">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Button>

      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Mon Historique</h2>

      {entries.length === 0 ? (
        <p className="text-muted-foreground font-body">Aucune fable commencée pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {entries.map((p) => {
            const gamesCompleted = (p.games_completed as string[]) || [];
            return (
              <div key={p.id} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{p.fableTitle}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground font-body">
                      <span className="flex items-center gap-1">
                        {p.video_watched ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5" />}
                        Vidéo
                      </span>
                      <span className="flex items-center gap-1">
                        {p.story_read ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5" />}
                        Histoire
                      </span>
                      <span className="flex items-center gap-1">
                        {gamesCompleted.length}/{p.totalGames} Jeux
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.completed && (
                      <>
                        {Array.from({ length: p.stars || 0 }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                        ))}
                        {Array.from({ length: 5 - (p.stars || 0) }).map((_, i) => (
                          <Star key={`e-${i}`} className="w-5 h-5 text-muted-foreground/30" />
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
