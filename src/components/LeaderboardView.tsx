import { useState, useEffect } from "react";
import { ArrowLeft, Star, Trophy, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardViewProps {
  onBack: () => void;
}

const LeaderboardView = ({ onBack }: LeaderboardViewProps) => {
  const [leaderboard, setLeaderboard] = useState<{ userId: string; displayName: string; stars: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      // Get all completed progress
      const { data: progress } = await supabase
        .from("student_progress")
        .select("user_id, stars")
        .eq("completed", true);

      if (!progress) return;

      // Aggregate stars per user
      const starMap: Record<string, number> = {};
      progress.forEach((p) => {
        starMap[p.user_id] = (starMap[p.user_id] || 0) + (p.stars || 0);
      });

      // Get profiles for those users
      const userIds = Object.keys(starMap);
      if (userIds.length === 0) return;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p) => {
        nameMap[p.user_id] = p.display_name || "Anonyme";
      });

      const board = userIds
        .map((uid) => ({
          userId: uid,
          displayName: nameMap[uid] || "Anonyme",
          stars: starMap[uid],
        }))
        .sort((a, b) => b.stars - a.stars);

      setLeaderboard(board);
    };
    load();
  }, []);

  const rankIcon = (i: number) => {
    if (i === 0) return <Trophy className="w-5 h-5 text-accent fill-accent" />;
    if (i === 1) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (i === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{i + 1}</span>;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Button variant="ghost" onClick={onBack} className="mb-6 gap-2 font-body">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Button>

      <h2 className="font-display text-2xl font-bold text-foreground mb-6">🏆 Classement</h2>

      {leaderboard.length === 0 ? (
        <p className="text-muted-foreground font-body">Aucun étudiant classé pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, i) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm ${
                i === 0 ? "bg-accent/10 border-accent/30" : "bg-card/80 border-border/50"
              }`}
            >
              {rankIcon(i)}
              <span className="flex-1 font-body font-semibold text-foreground">{entry.displayName}</span>
              <div className="flex items-center gap-1 text-accent">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold font-body">{entry.stars}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardView;
