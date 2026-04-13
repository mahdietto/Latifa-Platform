import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Trophy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, stopSpeaking } from "@/lib/tts";

interface FillBlanksProps {
  gameData: {
    paragraph: string;
    words: string[];
  };
  onComplete: (score: number, total: number) => void;
}

const FillBlanks = ({ gameData, onComplete }: FillBlanksProps) => {
  const { paragraph, words } = gameData;
  const parts = paragraph.split(/(___[^_]+___)/g);
  const blanks = parts
    .filter((p) => p.startsWith("___") && p.endsWith("___"))
    .map((p) => p.replace(/___/g, ""));

  const [shuffledWords] = useState(() =>
    [...words].sort(() => Math.random() - 0.5)
  );
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [results, setResults] = useState<Record<number, boolean> | null>(null);
  const [finished, setFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [charIndex, setCharIndex] = useState(-1);

  const usedWords = new Set(Object.values(answers));
  let blankIdx = -1;

  const handleDrop = (idx: number) => {
    if (!draggedWord || results) return;
    setAnswers((prev) => ({ ...prev, [idx]: draggedWord }));
    setDraggedWord(null);
  };

  const removeAnswer = (idx: number) => {
    if (results) return;
    setAnswers((prev) => {
      const c = { ...prev };
      delete c[idx];
      return c;
    });
  };

  const checkAnswers = () => {
    const res: Record<number, boolean> = {};
    blanks.forEach((correct, i) => {
      res[i] = answers[i] === correct;
    });
    setResults(res);
    if (Object.values(res).every(Boolean)) {
      setFinished(true);
      setTimeout(() => onComplete(blanks.length, blanks.length), 500);
    }
  };

  const speakParagraph = () => {
    stopSpeaking();
    setIsSpeaking(true);
    setCharIndex(0);
    const full = paragraph.replace(/___([^_]+)___/g, "$1");
    speak(full, {
      onEnd: () => { setIsSpeaking(false); setCharIndex(-1); },
      onWordBoundary: (ci) => setCharIndex(ci),
    });
  };

  // Build the full text without markers to map char indices
  const fullText = paragraph.replace(/___([^_]+)___/g, "$1");

  // Render paragraph with highlighting
  const renderParagraph = () => {
    let textPos = 0;
    return parts.map((part, i) => {
      if (part.startsWith("___") && part.endsWith("___")) {
        blankIdx++;
        const idx = blankIdx;
        const word = part.replace(/___/g, "");
        const partStart = textPos;
        textPos += word.length;

        return (
          <span
            key={i}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
            onClick={() => answers[idx] && removeAnswer(idx)}
            className={`inline-block min-w-[80px] mx-1 px-2 py-0.5 rounded border-2 border-dashed text-center cursor-pointer transition-colors ${
              results
                ? results[idx]
                  ? "border-emerald bg-emerald/10"
                  : "border-destructive bg-destructive/10"
                : answers[idx]
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30"
            }`}
          >
            {answers[idx] || "______"}
            {results && results[idx] && <CheckCircle2 className="inline w-3.5 h-3.5 ml-1 text-emerald" />}
          </span>
        );
      }

      // Normal text segment with highlighting
      const partStart = textPos;
      textPos += part.length;

      if (isSpeaking && charIndex >= 0) {
        if (charIndex >= partStart + part.length) {
          return <span key={i} className="text-accent font-medium transition-colors duration-100">{part}</span>;
        } else if (charIndex > partStart) {
          const splitAt = charIndex - partStart;
          return (
            <span key={i}>
              <span className="text-accent font-medium transition-colors duration-100">{part.substring(0, splitAt)}</span>
              <span>{part.substring(splitAt)}</span>
            </span>
          );
        }
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Reset blankIdx for render
  blankIdx = -1;

  return (
    <div className="space-y-6">
      {finished && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-4">
          <p className="font-body text-lg text-muted-foreground">Jeu terminé !</p>
        </motion.div>
      )}

      <Button variant="outline" size="sm" onClick={speakParagraph} className="gap-2 font-body">
        <Volume2 className="w-4 h-4" /> {isSpeaking ? "Écoute en cours..." : "Écouter le paragraphe"}
      </Button>

      <div className="p-4 rounded-lg bg-card border border-border font-body text-base leading-relaxed">
        {renderParagraph()}
      </div>

      <div className="flex flex-wrap gap-2">
        {shuffledWords.map((word) => {
          const used = usedWords.has(word);
          return (
            <motion.div
              key={word}
              draggable={!used && !results}
              onDragStart={() => setDraggedWord(word)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md border font-body text-sm cursor-grab ${
                used ? "opacity-30" : "border-primary bg-primary/5 hover:bg-primary/10"
              }`}
            >
              <button type="button" onClick={() => speak(word)} className="p-0.5 hover:text-primary">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
              {word}
            </motion.div>
          );
        })}
      </div>

      {!finished && (
        <Button onClick={checkAnswers} disabled={Object.keys(answers).length < blanks.length} className="font-body">
          Vérifier
        </Button>
      )}
    </div>
  );
};

export default FillBlanks;
