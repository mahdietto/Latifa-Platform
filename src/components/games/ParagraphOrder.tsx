import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Trophy, CheckCircle2, Play, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/tts";

interface ParagraphOrderProps {
  gameData: {
    paragraph: string;
    sentences: string[]; // in correct order
  };
  onComplete: (score: number, total: number) => void;
}

const ParagraphOrder = ({ gameData, onComplete }: ParagraphOrderProps) => {
  const { paragraph, sentences } = gameData;
  const [phase, setPhase] = useState<"listen" | "sort">("listen");
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [results, setResults] = useState<boolean[] | null>(null);
  const [finished, setFinished] = useState(false);

  const startSort = () => {
    setShuffled([...sentences].sort(() => Math.random() - 0.5));
    setPhase("sort");
  };

  const moveUp = (idx: number) => {
    if (idx === 0 || results) return;
    setShuffled((prev) => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };

  const moveDown = (idx: number) => {
    if (idx === shuffled.length - 1 || results) return;
    setShuffled((prev) => {
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };

  const checkOrder = () => {
    const res = shuffled.map((s, i) => s === sentences[i]);
    setResults(res);
    if (res.every(Boolean)) {
      setFinished(true);
      setTimeout(() => onComplete(sentences.length, sentences.length), 500);
    }
  };

  if (finished) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
        <p className="font-body text-lg text-muted-foreground">Jeu terminé !</p>
      </motion.div>
    );
  }

  if (phase === "listen") {
    return (
      <div className="space-y-6 max-w-xl">
        <p className="font-body text-muted-foreground">
          Écoute le paragraphe attentivement, puis remets les phrases dans l'ordre.
        </p>
        <div className="p-5 rounded-lg bg-card border border-border font-body text-base leading-relaxed">
          {paragraph}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => speak(paragraph)} className="gap-2 font-body">
            <Volume2 className="w-4 h-4" /> Écouter
          </Button>
          <Button onClick={startSort} className="gap-2 font-body">
            <Play className="w-4 h-4" /> Je suis prêt !
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      <p className="font-body text-muted-foreground">
        Remets les phrases dans le bon ordre :
      </p>
      {shuffled.map((sentence, i) => (
        <motion.div
          key={sentence}
          layout
          className={`flex items-center gap-2 p-3 rounded-lg border-2 font-body text-sm ${
            results
              ? results[i]
                ? "border-emerald bg-emerald/10"
                : "border-destructive bg-destructive/10"
              : "border-border bg-card"
          }`}
        >
          <span className="font-display font-bold text-primary w-6">{i + 1}</span>
          <p className="flex-1">{sentence}</p>
          <div className="flex flex-col gap-0.5">
            <button type="button" onClick={() => moveUp(i)} className="p-0.5 hover:text-primary" disabled={!!results}>
              <ArrowUp className="w-4 h-4" />
            </button>
            <button type="button" onClick={() => moveDown(i)} className="p-0.5 hover:text-primary" disabled={!!results}>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
          <button type="button" onClick={() => speak(sentence)} className="p-1 hover:text-primary">
            <Volume2 className="w-4 h-4" />
          </button>
          {results && results[i] && <CheckCircle2 className="w-5 h-5 text-emerald" />}
        </motion.div>
      ))}

      {!results && (
        <Button onClick={checkOrder} className="font-body">Vérifier l'ordre</Button>
      )}
      {results && !results.every(Boolean) && (
        <Button onClick={() => setResults(null)} variant="outline" className="font-body">
          Réessayer
        </Button>
      )}
    </div>
  );
};

export default ParagraphOrder;
