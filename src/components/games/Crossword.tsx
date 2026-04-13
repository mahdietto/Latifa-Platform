import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, CheckCircle2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { speak } from "@/lib/tts";

interface CrosswordProps {
  gameData: {
    words: { word: string; clue: string }[];
  };
  onComplete: (score: number, total: number) => void;
}

const Crossword = ({ gameData, onComplete }: CrosswordProps) => {
  const { words } = gameData;
  const [answers, setAnswers] = useState<Record<number, string>>(
    Object.fromEntries(words.map((_, i) => [i, ""]))
  );
  const [results, setResults] = useState<Record<number, boolean> | null>(null);
  const [finished, setFinished] = useState(false);

  const checkAnswers = () => {
    const res: Record<number, boolean> = {};
    words.forEach((w, i) => {
      const correct = answers[i]?.trim().toLowerCase() === w.word.toLowerCase();
      res[i] = correct;
      if (correct) speak(w.word);
    });
    setResults(res);
    if (Object.values(res).every(Boolean)) {
      setFinished(true);
      setTimeout(() => onComplete(words.length, words.length), 500);
    }
  };

  if (finished) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
        <p className="font-body text-lg text-muted-foreground">Jeu terminé !</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      {words.map((w, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-primary">{i + 1}.</span>
            <p className="font-body text-sm text-foreground">{w.clue}</p>
            <span className="text-xs text-muted-foreground">({w.word.length} lettres)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {w.word.split("").map((_, ci) => (
                <div
                  key={ci}
                  className={`w-8 h-8 rounded border-2 flex items-center justify-center font-body font-bold text-sm uppercase ${
                    results
                      ? results[i]
                        ? "border-emerald bg-emerald/10 text-emerald"
                        : "border-destructive bg-destructive/10"
                      : "border-border"
                  }`}
                >
                  {answers[i]?.[ci] || ""}
                </div>
              ))}
            </div>
            {results && results[i] && (
              <button type="button" onClick={() => speak(w.word)} className="p-1 hover:text-primary">
                <Volume2 className="w-4 h-4 text-emerald" />
              </button>
            )}
            {results && results[i] && <CheckCircle2 className="w-5 h-5 text-emerald" />}
          </div>
          <Input
            value={answers[i] || ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
            placeholder="Tape le mot..."
            maxLength={w.word.length}
            className="font-body uppercase tracking-widest max-w-xs"
            disabled={results?.[i]}
          />
        </div>
      ))}

      <Button onClick={checkAnswers} className="font-body">
        Vérifier
      </Button>
    </div>
  );
};

export default Crossword;
