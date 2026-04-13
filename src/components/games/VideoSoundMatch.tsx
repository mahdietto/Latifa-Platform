import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, stopSpeaking } from "@/lib/tts";

interface SoundOption {
  sentence: string;
  isCorrect: boolean;
}

interface VideoSoundMatchProps {
  gameData: {
    prompt?: string;
    options: SoundOption[];
  };
  onComplete: (score: number, total: number) => void;
}

const VideoSoundMatch = ({ gameData, onComplete }: VideoSoundMatchProps) => {
  const options = useMemo(() => gameData.options || [], [gameData.options]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const correctIndex = useMemo(
    () => options.findIndex((o) => o.isCorrect),
    [options]
  );

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  if (options.length < 2 || correctIndex < 0) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card">
        <p className="font-body text-sm text-muted-foreground">
          Données du jeu invalides. Ajoutez au moins 2 sons et marquez une bonne réponse.
        </p>
      </div>
    );
  }

  const handleChoose = (idx: number) => {
    if (answered) return;
    setSelectedIndex(idx);
    setAnswered(true);
    const score = idx === correctIndex ? 1 : 0;
    setTimeout(() => onComplete(score, 1), 700);
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="p-4 rounded-lg bg-card border border-border">
        <p className="font-body text-sm text-muted-foreground mb-1">Exercice audio + vidéo</p>
        <p className="font-body text-base text-foreground font-semibold">
          {gameData.prompt || "Écoute tous les sons puis choisis celui qui correspond à l'extrait vidéo."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option, idx) => {
          const isCorrect = idx === correctIndex;
          const isSelected = idx === selectedIndex;
          const showCorrect = answered && isCorrect;
          const showWrong = answered && isSelected && !isCorrect;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border transition-colors ${
                showCorrect
                  ? "border-emerald bg-emerald/10"
                  : showWrong
                    ? "border-destructive bg-destructive/10"
                    : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-body text-sm font-semibold text-foreground">Son {idx + 1}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => speak(option.sentence)}
                  className="gap-1"
                >
                  <Volume2 className="w-4 h-4" /> Écouter
                </Button>
              </div>

              <Button
                type="button"
                variant={showCorrect ? "default" : "outline"}
                onClick={() => handleChoose(idx)}
                disabled={answered}
                className={`w-full mt-3 font-body ${
                  showCorrect ? "bg-emerald hover:bg-emerald" : ""
                } ${showWrong ? "border-destructive text-destructive" : ""}`}
              >
                Choisir ce son
              </Button>

              {showCorrect && (
                <div className="mt-2 flex items-center gap-1 text-emerald text-xs font-body">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bonne réponse
                </div>
              )}
              {showWrong && (
                <div className="mt-2 flex items-center gap-1 text-destructive text-xs font-body">
                  <XCircle className="w-3.5 h-3.5" /> Mauvaise réponse
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoSoundMatch;
