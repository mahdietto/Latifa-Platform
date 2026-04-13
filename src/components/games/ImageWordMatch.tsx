import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, CheckCircle2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/tts";

interface ImageWordMatchProps {
  gameData: {
    pairs: { imageUrl: string; word: string }[];
  };
  onComplete: (score: number, total: number) => void;
}

const ImageWordMatch = ({ gameData, onComplete }: ImageWordMatchProps) => {
  const { pairs } = gameData;
  const [shuffledWords] = useState(() =>
    [...pairs].map((p) => p.word).sort(() => Math.random() - 0.5)
  );
  const [assignments, setAssignments] = useState<Record<number, string>>({});
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [results, setResults] = useState<Record<number, boolean> | null>(null);
  const [finished, setFinished] = useState(false);

  const assignedWords = new Set(Object.values(assignments));

  const handleDrop = (imgIdx: number) => {
    if (!draggedWord || results) return;
    setAssignments((prev) => ({ ...prev, [imgIdx]: draggedWord }));
    setDraggedWord(null);
  };

  const removeAssignment = (imgIdx: number) => {
    if (results) return;
    setAssignments((prev) => {
      const copy = { ...prev };
      delete copy[imgIdx];
      return copy;
    });
  };

  const checkAnswers = () => {
    const res: Record<number, boolean> = {};
    pairs.forEach((p, i) => {
      res[i] = assignments[i] === p.word;
    });
    setResults(res);
    if (Object.values(res).every(Boolean)) {
      setFinished(true);
      setTimeout(() => onComplete(pairs.length, pairs.length), 500);
    }
  };

  const allAssigned = Object.keys(assignments).length === pairs.length;

  return (
    <div className="space-y-6">
      {finished && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-4">
          <p className="font-body text-lg text-muted-foreground">Jeu terminé !</p>
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {pairs.map((pair, i) => (
          <div key={i} className="space-y-2">
            <div className="rounded-lg overflow-hidden border border-border aspect-square">
              <img src={pair.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              onClick={() => assignments[i] && removeAssignment(i)}
              className={`min-h-[40px] rounded-md border-2 border-dashed p-2 text-center text-sm font-body cursor-pointer transition-colors ${
                results
                  ? results[i]
                    ? "border-emerald bg-emerald/10"
                    : "border-destructive bg-destructive/10"
                  : assignments[i]
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              {assignments[i] || (
                <span className="text-muted-foreground text-xs">Glisser ici</span>
              )}
              {results && results[i] && <CheckCircle2 className="inline w-4 h-4 ml-1 text-emerald" />}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {shuffledWords.map((word) => {
          const used = assignedWords.has(word);
          return (
            <motion.div
              key={word}
              draggable={!used && !results}
              onDragStart={() => setDraggedWord(word)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md border font-body text-sm cursor-grab ${
                used ? "opacity-30 cursor-default" : "border-primary bg-primary/5 hover:bg-primary/10"
              }`}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); speak(word); }}
                className="p-0.5 hover:text-primary"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              {word}
            </motion.div>
          );
        })}
      </div>

      {!finished && (
        <Button onClick={checkAnswers} disabled={!allAssigned} className="font-body">
          Vérifier
        </Button>
      )}
    </div>
  );
};

export default ImageWordMatch;
