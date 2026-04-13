import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, stopSpeaking } from "@/lib/tts";

interface TrueFalseProps {
  gameData: {
    statements: { text: string; isTrue: boolean }[];
  };
  onComplete: (score: number, total: number) => void;
}

const TrueFalse = ({ gameData, onComplete }: TrueFalseProps) => {
  const { statements } = gameData;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [charIndex, setCharIndex] = useState(-1);

  const current = statements[currentIdx];

  const handleSpeak = (text: string) => {
    stopSpeaking();
    setIsSpeaking(true);
    setCharIndex(0);
    speak(text, {
      onEnd: () => { setIsSpeaking(false); setCharIndex(-1); },
      onWordBoundary: (ci) => setCharIndex(ci),
    });
  };

  const handleAnswer = (answer: boolean) => {
    if (answered !== null) return;
    const correct = answer === current.isTrue;
    setAnswered(correct);
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      stopSpeaking();
      setIsSpeaking(false);
      setCharIndex(-1);
      if (currentIdx + 1 < statements.length) {
        setCurrentIdx((i) => i + 1);
        setAnswered(null);
      } else {
        setFinished(true);
        const finalScore = score + (correct ? 1 : 0);
        if (finalScore >= statements.length * 0.7) {
          setTimeout(() => onComplete(finalScore, statements.length), 500);
        }
      }
    }, 1200);
  };

  if (finished) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
        <p className="font-body text-lg text-muted-foreground">Jeu terminé !</p>
      </motion.div>
    );
  }

  const renderHighlighted = () => {
    if (!isSpeaking || charIndex < 0) return <span>{current.text}</span>;
    return (
      <>
        <span className="text-accent font-medium transition-colors duration-100">{current.text.substring(0, charIndex)}</span>
        <span>{current.text.substring(charIndex)}</span>
      </>
    );
  };

  return (
    <div className="max-w-xl space-y-6">
      <p className="text-sm text-muted-foreground font-body">
        Question {currentIdx + 1} / {statements.length}
      </p>
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((currentIdx + 1) / statements.length) * 100}%` }} />
      </div>

      <div className="p-5 rounded-lg bg-card border border-border">
        <div className="flex items-start gap-3">
          <button type="button" onClick={() => handleSpeak(current.text)} className="mt-1 p-1 hover:text-primary shrink-0">
            <Volume2 className="w-5 h-5" />
          </button>
          <p className="font-body text-lg text-foreground">{renderHighlighted()}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={() => handleAnswer(true)}
          disabled={answered !== null}
          className={`flex-1 gap-2 font-body text-lg ${
            answered !== null && current.isTrue ? "bg-emerald hover:bg-emerald" : ""
          }`}
          variant={answered !== null && !current.isTrue ? "outline" : "default"}
        >
          {answered !== null && current.isTrue && <CheckCircle2 className="w-5 h-5" />}
          Vrai
        </Button>
        <Button
          size="lg"
          onClick={() => handleAnswer(false)}
          disabled={answered !== null}
          className={`flex-1 gap-2 font-body text-lg ${
            answered !== null && !current.isTrue ? "bg-emerald hover:bg-emerald" : ""
          }`}
          variant={answered !== null && current.isTrue ? "outline" : "default"}
        >
          {answered !== null && !current.isTrue && <CheckCircle2 className="w-5 h-5" />}
          Faux
        </Button>
      </div>

      {answered !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-lg ${answered ? "bg-emerald/10 text-emerald" : "bg-destructive/10 text-destructive"}`}>
          <div className="flex items-center gap-2 font-body font-semibold">
            {answered ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {answered ? "Bonne réponse !" : "Mauvaise réponse..."}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TrueFalse;
