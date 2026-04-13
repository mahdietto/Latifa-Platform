import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameCompletionModalProps {
  open: boolean;
  score: number;
  total: number;
  starsEarned: number;
  totalStars: number;
  onClose: () => void;
}

const GameCompletionModal = ({ open, score, total, starsEarned, totalStars, onClose }: GameCompletionModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-sm p-8 text-center"
          >
            <motion.div
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
            </motion.div>

            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Bravo ! 🎉
            </h2>
            <p className="font-body text-muted-foreground mb-4">
              Score : <span className="text-primary font-bold">{score}</span> / {total}
            </p>

            <div className="flex items-center justify-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Star
                    className={`w-8 h-8 ${
                      i < starsEarned ? "text-accent fill-accent" : "text-muted-foreground/30"
                    }`}
                  />
                </motion.div>
              ))}
            </div>
            <p className="text-sm font-body text-muted-foreground mb-1">
              + {starsEarned} étoile{starsEarned > 1 ? "s" : ""} gagnée{starsEarned > 1 ? "s" : ""}
            </p>
            <p className="text-xs font-body text-muted-foreground mb-6">
              Total : ⭐ {totalStars} étoiles
            </p>

            <Button onClick={onClose} className="w-full font-body font-semibold">
              Continuer
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GameCompletionModal;
