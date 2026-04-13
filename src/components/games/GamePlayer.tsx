import { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Gamepad2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FableGame } from "@/hooks/use-fable-games";
import GameCompletionModal from "@/components/GameCompletionModal";
import ImageWordMatch from "./ImageWordMatch";
import FillBlanks from "./FillBlanks";
import MemoryCards from "./MemoryCards";
import TrueFalse from "./TrueFalse";
import Crossword from "./Crossword";
import ParagraphOrder from "./ParagraphOrder";
import MCQ from "./MCQ";
import VideoSoundMatch from "./VideoSoundMatch";
import ExpressionRatingTable from "./ExpressionRatingTable";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const GAME_LABELS: Record<string, string> = {
  image_word_match: "🖼️ Images et Mots",
  fill_blanks: "📝 Texte à trous",
  memory_cards: "🃏 Cartes Mémoire",
  true_false: "✅ Vrai ou Faux",
  crossword: "🔤 Mots Croisés",
  paragraph_order: "📖 Ordre des Événements",
  mcq: "❓ Questions à Choix Multiples",
  video_sound_match: "🎧 Son et Vidéo",
  expression_rating_table: "📊 Auto-évaluation",
};

interface GamePlayerProps {
  games: FableGame[];
  fableTitle: string;
  fableVideoUrl?: string;
  completedGameIds: string[];
  onGameComplete: (gameId: string) => void;
  onBack: () => void;
}

const GamePlayer = ({ games, fableTitle, fableVideoUrl, completedGameIds, onGameComplete, onBack }: GamePlayerProps) => {
  const [selectedGame, setSelectedGame] = useState<FableGame | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ score: 0, total: 0, starsEarned: 0, totalStars: 0 });
  const [isClipPlaying, setIsClipPlaying] = useState(false);
  const { user } = useAuth();
  const clipVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoSegment = useMemo(() => {
    const raw = selectedGame?.game_data?.videoSegment;
    if (!raw?.enabled) return null;

    const start = Number(raw.startSeconds ?? 0);
    const end = Number(raw.endSeconds ?? 0);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;

    return { start, end };
  }, [selectedGame]);

  const handleGameComplete = useCallback(async (gameId: string, score: number, total: number) => {
    // Calculate stars for this game
    const starsEarned = total === 0 ? 3 : score >= total ? 5 : score >= total * 0.75 ? 4 : score >= total * 0.5 ? 3 : score >= total * 0.25 ? 2 : 1;

    // First: mark game completed (this creates the student_progress record if needed)
    await new Promise<void>((resolve) => {
      onGameComplete(gameId);
      // Give markGameCompleted time to insert/update the record
      setTimeout(resolve, 300);
    });

    // Now update stars on the existing record
    if (user && games.length > 0) {
      const fableId = games[0].fable_id;
      const { data: existing } = await supabase
        .from("student_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("fable_id", fableId)
        .maybeSingle();

      if (existing) {
        const newStars = Math.max(existing.stars || 0, starsEarned);
        await supabase.from("student_progress").update({ stars: newStars }).eq("user_id", user.id).eq("fable_id", fableId);
      } else {
        await supabase.from("student_progress").insert({
          user_id: user.id,
          fable_id: fableId,
          stars: starsEarned,
        });
      }
    }

    // Get total stars
    let totalStars = 0;
    if (user) {
      const { data } = await supabase
        .from("student_progress")
        .select("stars")
        .eq("user_id", user.id);
      totalStars = (data || []).reduce((s, r) => s + (r.stars || 0), 0);
    }

    // Refresh stars in profile menu
    if ((window as any).__refreshStars) {
      (window as any).__refreshStars();
    }

    setModalData({ score, total, starsEarned, totalStars });
    setModalOpen(true);
  }, [onGameComplete, user, games]);

  const renderGame = (game: FableGame) => {
    const onComplete = (score: number, total: number) => handleGameComplete(game.id, score, total);
    switch (game.game_type) {
      case "image_word_match":
        return <ImageWordMatch gameData={game.game_data} onComplete={onComplete} />;
      case "fill_blanks":
        return <FillBlanks gameData={game.game_data} onComplete={onComplete} />;
      case "memory_cards":
        return <MemoryCards gameData={game.game_data} onComplete={onComplete} />;
      case "true_false":
        return <TrueFalse gameData={game.game_data} onComplete={onComplete} />;
      case "crossword":
        return <Crossword gameData={game.game_data} onComplete={onComplete} />;
      case "paragraph_order":
        return <ParagraphOrder gameData={game.game_data} onComplete={onComplete} />;
      case "mcq":
        return <MCQ gameData={game.game_data} onComplete={onComplete} />;
      case "video_sound_match":
        return <VideoSoundMatch gameData={game.game_data} onComplete={onComplete} />;
      case "expression_rating_table":
        return <ExpressionRatingTable gameData={game.game_data} onComplete={onComplete} />;
      default:
        return <p className="font-body text-muted-foreground">Jeu non reconnu.</p>;
    }
  };

  const playClip = () => {
    if (!clipVideoRef.current || !videoSegment) return;
    const video = clipVideoRef.current;
    if (video.currentTime < videoSegment.start || video.currentTime >= videoSegment.end) {
      video.currentTime = videoSegment.start;
    }
    video.play();
  };

  const pauseClip = () => {
    clipVideoRef.current?.pause();
  };

  const replayClip = () => {
    if (!clipVideoRef.current || !videoSegment) return;
    const video = clipVideoRef.current;
    video.currentTime = videoSegment.start;
    video.play();
  };

  return (
    <div className="space-y-6">
      <GameCompletionModal
        open={modalOpen}
        score={modalData.score}
        total={modalData.total}
        starsEarned={modalData.starsEarned}
        totalStars={modalData.totalStars}
        onClose={() => { setModalOpen(false); setSelectedGame(null); }}
      />

      <AnimatePresence mode="wait">
        {selectedGame ? (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button onClick={() => setSelectedGame(null)} variant="secondary" size="sm" className="mb-4 gap-2 font-body">
              <ArrowLeft className="w-4 h-4" /> Retour aux jeux
            </Button>
            <h3 className="font-display text-xl font-bold text-foreground mb-1">
              {GAME_LABELS[selectedGame.game_type] || selectedGame.game_type}
            </h3>
            {selectedGame.title && (
              <p className="font-body text-sm text-muted-foreground mb-4">{selectedGame.title}</p>
            )}
            {videoSegment && fableVideoUrl && (
              <div className="mb-5 rounded-lg border border-border bg-card overflow-hidden">
                <div className="p-3 border-b border-border/80">
                  <p className="font-body text-sm font-semibold text-foreground">
                    Extrait vidéo pour ce jeu
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    Regarde l'extrait puis réponds aux questions.
                  </p>
                </div>
                <video
                  ref={clipVideoRef}
                  src={fableVideoUrl}
                  className="w-full aspect-video bg-black"
                  controls={false}
                  playsInline
                  disablePictureInPicture
                  controlsList="nodownload noplaybackrate noremoteplayback"
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    if (!videoSegment) return;
                    video.currentTime = Math.max(0, videoSegment.start);
                  }}
                  onPlay={() => setIsClipPlaying(true)}
                  onPause={() => setIsClipPlaying(false)}
                  onSeeking={(e) => {
                    const video = e.currentTarget;
                    if (!videoSegment) return;
                    if (video.currentTime < videoSegment.start) {
                      video.currentTime = videoSegment.start;
                    }
                    if (video.currentTime > videoSegment.end) {
                      video.currentTime = videoSegment.end;
                    }
                  }}
                  onTimeUpdate={(e) => {
                    const video = e.currentTarget;
                    if (!videoSegment) return;
                    if (video.currentTime >= videoSegment.end) {
                      video.pause();
                      video.currentTime = videoSegment.end;
                    }
                  }}
                />
                <div className="p-3 border-t border-border/80 flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={playClip} className="font-body">
                    Lire
                  </Button>
                  <Button size="sm" variant="secondary" onClick={pauseClip} className="font-body">
                    Pause
                  </Button>
                  <Button size="sm" variant="outline" onClick={replayClip} className="font-body">
                    Rejouer l'extrait
                  </Button>
                  <span className="text-xs text-muted-foreground font-body ml-auto">
                    Segment: {videoSegment.start}s - {videoSegment.end}s {isClipPlaying ? "• en lecture" : ""}
                  </span>
                </div>
              </div>
            )}
            {renderGame(selectedGame)}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button onClick={onBack} variant="secondary" size="sm" className="mb-4 gap-2 font-body">
              <ArrowLeft className="w-4 h-4" /> Retour à la fable
            </Button>
            <h3 className="font-display text-2xl font-bold text-foreground mb-1">
              Mini-Jeux : {fableTitle}
            </h3>
            <p className="font-body text-muted-foreground mb-6">
              {completedGameIds.length} / {games.length} jeux complétés
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {games.map((game) => {
                const completed = completedGameIds.includes(game.id);
                return (
                  <motion.div
                    key={game.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedGame(game)}
                    className={`cursor-pointer p-5 rounded-lg border-2 transition-all ${
                      completed
                        ? "border-emerald bg-emerald/5"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-primary" />
                        <span className="font-body font-semibold text-foreground">
                          {GAME_LABELS[game.game_type] || game.game_type}
                        </span>
                      </div>
                      {completed && <CheckCircle2 className="w-5 h-5 text-emerald" />}
                    </div>
                    {game.title && (
                      <p className="text-sm text-muted-foreground font-body mt-1">{game.title}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamePlayer;
