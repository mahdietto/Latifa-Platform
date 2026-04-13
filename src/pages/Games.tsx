import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { useFables } from "@/data/fables";
import { useFableGames } from "@/hooks/use-fable-games";
import { useStudentProgress } from "@/hooks/use-student-progress";
import { useAuth } from "@/contexts/AuthContext";
import { Gamepad2, Sparkles } from "lucide-react";
import GamePlayer from "@/components/games/GamePlayer";
import FableCard from "@/components/FableCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Games = () => {
  const { fables } = useFables();
  const { user } = useAuth();
  const [selectedFableId, setSelectedFableId] = useState<string | null>(null);

  const selectedFable = fables.find((f) => f.id === selectedFableId);

  return (
    <div className="min-h-screen pt-20">
      <Header />
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6">
        {!user ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center rounded-2xl border border-border bg-card p-10">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">Connexion requise</h2>
            <p className="font-body text-muted-foreground mb-6">
              Les mini-jeux sont réservés aux utilisateurs connectés.
            </p>
            <Link to="/auth">
              <Button size="lg">Se connecter</Button>
            </Link>
          </motion.div>
        ) : (
        <AnimatePresence mode="wait">
          {selectedFable ? (
            <SelectedFableGames
              key="games"
              fableId={selectedFable.id}
              fableTitle={selectedFable.title}
              fableVideoUrl={selectedFable.videoUrl}
              onBack={() => setSelectedFableId(null)}
            />
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 mt-6 px-2 pt-6 text-center md:mt-10 md:pt-8"
              >
                <div className="mb-3 flex items-center justify-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-amber-300 drop-shadow" />
                  <span className="text-sm font-body font-semibold uppercase tracking-wider text-white drop-shadow-md">Mini-Jeux</span>
                  <Gamepad2 className="h-5 w-5 text-amber-300 drop-shadow" />
                </div>
                <h2 className="mb-4 font-display text-4xl font-bold text-white drop-shadow-md md:text-5xl">
                  Teste tes <span className="text-gradient-primary">Connaissances</span>
                </h2>
                <p className="mx-auto max-w-xl font-body text-lg text-white/95 drop-shadow leading-relaxed">
                  Choisis une fable et joue à ses mini-jeux éducatifs !
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {fables.map((fable, i) => (
                  <FableCard
                    key={fable.id}
                    fable={fable}
                    index={i}
                    onClick={() => setSelectedFableId(fable.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </div>
    </div>
  );
};

const SelectedFableGames = ({ fableId, fableTitle, fableVideoUrl, onBack }: { fableId: string; fableTitle: string; fableVideoUrl?: string; onBack: () => void }) => {
  const { games } = useFableGames(fableId);
  const { progress, markGameCompleted } = useStudentProgress(fableId);
  const completedGameIds = (progress?.games_completed as string[]) || [];

  if (games.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
        <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">Pas encore de jeux</h3>
        <p className="font-body text-muted-foreground">Les jeux pour cette fable seront bientôt disponibles.</p>
        <button onClick={onBack} className="mt-4 text-primary font-body underline">Retour</button>
      </motion.div>
    );
  }

  return (
    <GamePlayer
      games={games}
      fableTitle={fableTitle}
      fableVideoUrl={fableVideoUrl}
      completedGameIds={completedGameIds}
      onGameComplete={(gameId) => markGameCompleted(fableId, gameId)}
      onBack={onBack}
    />
  );
};

export default Games;
