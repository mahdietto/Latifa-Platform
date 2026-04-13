import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Fable } from "@/data/fables";
import { ArrowLeft, Clock, Gamepad2, Sparkles, CheckCircle2, Eye, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useFableGames } from "@/hooks/use-fable-games";
import { useStudentProgress } from "@/hooks/use-student-progress";
import GamePlayer from "@/components/games/GamePlayer";
import GameLoadingScreen from "@/components/GameLoadingScreen";
import { speak, stopSpeaking } from "@/lib/tts";

interface FableDetailProps {
  fable: Fable;
  onBack: () => void;
}

const FableDetail = ({ fable, onBack }: FableDetailProps) => {
  const SPEED_OPTIONS = [
    { label: "Lent", value: 0.75 },
    { label: "Normal", value: 0.8 },
    { label: "Rapide", value: 1.1 },
    { label: "Très rapide", value: 1.3 },
  ] as const;

  const { user, isAdmin } = useAuth();
  const { games } = useFableGames(fable.id);
  const { progress, updateProgress, markGameCompleted } = useStudentProgress(fable.id);
  const [showGames, setShowGames] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenCharIndex, setSpokenCharIndex] = useState(-1);
  const [readingSpeed, setReadingSpeed] = useState<number>(0.9);

  const completedGameIds = (progress?.games_completed as string[]) || [];
  const allGamesCompleted = games.length > 0 && games.every((g) => completedGameIds.includes(g.id));
  const isFableCompleted = progress?.completed || false;

  const handleMarkVideoWatched = () => {
    if (user) updateProgress(fable.id, { video_watched: true });
  };

  const handleGameComplete = (gameId: string) => {
    if (user) markGameCompleted(fable.id, gameId);
  };

  const handleStartGames = () => {
    if (!user) return;
    setShowGames(true);
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      setSpokenCharIndex(-1);
    } else {
      setIsSpeaking(true);
      setSpokenCharIndex(0);
      speak(fable.story, {
        rate: readingSpeed,
        onEnd: () => {
          setIsSpeaking(false);
          setSpokenCharIndex(-1);
          if (user && !progress?.story_read) {
            updateProgress(fable.id, { story_read: true });
          }
        },
        onWordBoundary: (charIndex) => {
          setSpokenCharIndex(charIndex);
        },
      });
    }
  };

  const storyRead = progress?.story_read;
  const videoWatched = progress?.video_watched;

  const storyCountsForCompletion = isAdmin ? storyRead : true;

  useEffect(() => {
    if (user && storyCountsForCompletion && videoWatched && allGamesCompleted && !isFableCompleted) {
      updateProgress(fable.id, { completed: true });
    }
  }, [user, storyCountsForCompletion, videoWatched, allGamesCompleted, isFableCompleted, fable.id, updateProgress]);

  useEffect(() => {
    setShowGames(false);
    setIsSpeaking(false);
    setSpokenCharIndex(-1);
    stopSpeaking();
  }, [fable.id]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // Render story text with TTS highlighting
  const storyContent = useMemo(() => {
    if (!isAdmin) return null;
    if (!isSpeaking || spokenCharIndex < 0) {
      return <span>{fable.story}</span>;
    }
    const spoken = fable.story.substring(0, spokenCharIndex);
    const rest = fable.story.substring(spokenCharIndex);
    return (
      <>
        <span className="text-accent font-medium transition-colors duration-150">{spoken}</span>
        <span>{rest}</span>
      </>
    );
  }, [fable.story, isSpeaking, spokenCharIndex, isAdmin]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <AnimatePresence>
        {gameLoading && <GameLoadingScreen />}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        {showGames ? (
          <motion.div key="games" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="max-w-4xl mx-auto px-4 pt-8 pb-12">
            <GamePlayer
              games={games}
              fableTitle={fable.title}
              fableVideoUrl={fable.videoUrl}
              completedGameIds={completedGameIds}
              onGameComplete={handleGameComplete}
              onBack={() => setShowGames(false)}
            />
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.25 }} className="fixed top-4 left-4 z-50">
              <Button onClick={() => { stopSpeaking(); setIsSpeaking(false); onBack(); }} variant="secondary" size="lg" className="gap-2 font-body font-semibold shadow-lg">
                <ArrowLeft className="w-5 h-5" />
                Retour aux Fables
              </Button>
            </motion.div>

            <div className="max-w-4xl mx-auto px-4 pt-20 pb-12">
              {isFableCompleted && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-lg bg-emerald/10 border border-emerald/30 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald" />
                  <span className="font-body font-semibold text-emerald">Fable complétée ! 🎉</span>
                </motion.div>
              )}

              {/* Video section only */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }} className="mb-8 rounded-lg bg-card border border-border overflow-hidden">
                <div className="aspect-video flex items-center justify-center bg-muted">
                  {user && fable.videoUrl ? (
                    <video
                      src={fable.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                      onEnded={handleMarkVideoWatched}
                    />
                  ) : !user ? (
                    <div className="text-center px-4">
                      <p className="text-sm text-muted-foreground font-body mb-3">
                        Connecte-toi pour débloquer la vidéo de la fable.
                      </p>
                      <Link to="/auth">
                        <Button size="sm" className="font-body">Se connecter</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground font-body">Vidéo bientôt disponible</p>
                      {user && !videoWatched && (
                        <Button size="sm" variant="outline" onClick={handleMarkVideoWatched} className="mt-2 gap-1 font-body text-xs">
                          <Eye className="w-3 h-3" /> Marquer comme vue
                        </Button>
                      )}
                      {videoWatched && (
                        <div className="mt-2 flex items-center justify-center gap-1 text-emerald text-xs font-body">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Vue
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">{fable.title}</h1>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-semibold">
                    <Clock className="w-4 h-4" /> {fable.duration}
                  </span>
                  <span className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
                    fable.difficulty === "Facile" ? "bg-emerald/10 text-emerald" :
                    fable.difficulty === "Moyen" ? "bg-accent/10 text-accent" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {fable.difficulty}
                  </span>
                  {games.length > 0 && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-semibold">
                      <Gamepad2 className="w-4 h-4" /> {games.length} jeu{games.length > 1 ? "x" : ""}
                    </span>
                  )}
                </div>

                <div className="mb-6 p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <h3 className="font-display text-lg font-semibold text-foreground">La Morale</h3>
                  </div>
                  <p className="text-foreground/80 font-body italic text-base leading-relaxed">« {fable.moral} »</p>
                </div>

                {isAdmin && (
                  <div className="mb-8">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-3">L'Histoire</h3>
                    <p className="text-foreground/70 font-body text-base leading-relaxed whitespace-pre-line">{storyContent}</p>
                    {storyRead && (
                      <div className="mt-2 flex items-center gap-1 text-emerald text-xs font-body">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Lue
                      </div>
                    )}
                  </div>
                )}

                {user && (
                  <div className="mb-8 p-4 rounded-lg bg-card border border-border">
                    <h4 className="font-display text-sm font-semibold text-foreground mb-3">📊 Progression</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-body">
                        <CheckCircle2 className={`w-4 h-4 ${videoWatched ? "text-emerald" : "text-muted-foreground"}`} />
                        <span className={videoWatched ? "text-foreground" : "text-muted-foreground"}>Vidéo regardée</span>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2 text-sm font-body">
                          <CheckCircle2 className={`w-4 h-4 ${storyRead ? "text-emerald" : "text-muted-foreground"}`} />
                          <span className={storyRead ? "text-foreground" : "text-muted-foreground"}>Histoire lue</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm font-body">
                        <CheckCircle2 className={`w-4 h-4 ${allGamesCompleted ? "text-emerald" : "text-muted-foreground"}`} />
                        <span className={allGamesCompleted ? "text-foreground" : "text-muted-foreground"}>
                          Jeux ({completedGameIds.length}/{games.length})
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 items-center">
                  {games.length > 0 && user && (
                    <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-body font-semibold gold-glow" onClick={handleStartGames}>
                      <Gamepad2 className="w-5 h-5" /> Jouer aux Mini-Jeux
                    </Button>
                  )}
                  {!user && (
                    <Link to="/auth">
                      <Button size="lg" className="gap-2 font-body font-semibold">
                        <Gamepad2 className="w-5 h-5" /> Connexion requise pour les jeux
                      </Button>
                    </Link>
                  )}
                  {isAdmin && (
                    <>
                      <Button variant="outline" size="lg" className="gap-2 font-body font-semibold" onClick={handleReadAloud}>
                        <Volume2 className="w-5 h-5" />
                        {isSpeaking ? "Arrêter la lecture" : "Lire à voix haute"}
                      </Button>
                      <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 backdrop-blur-sm px-3 py-2">
                        <span className="text-sm font-body text-muted-foreground whitespace-nowrap">Vitesse</span>
                        <div className="flex items-center gap-1">
                          {SPEED_OPTIONS.map((option) => {
                            const active = readingSpeed === option.value;
                            return (
                              <button
                                key={option.label}
                                type="button"
                                onClick={() => setReadingSpeed(option.value)}
                                className={`px-2.5 py-1.5 rounded-md text-xs font-body font-semibold transition-all ${
                                  active
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FableDetail;
