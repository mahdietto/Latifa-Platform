import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Volume2, Trophy, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak, stopSpeaking } from "@/lib/tts";

interface MCQProps {
  gameData: {
    questions: { question: string; choices: string[]; correctIndex: number }[];
  };
  onComplete: (score: number, total: number) => void;
}

const HighlightedText = ({ text, charIndex, isSpeaking }: { text: string; charIndex: number; isSpeaking: boolean }) => {
  if (!isSpeaking || charIndex < 0) return <span>{text}</span>;
  return (
    <>
      <span className="text-accent font-medium transition-colors duration-100">{text.substring(0, charIndex)}</span>
      <span>{text.substring(charIndex)}</span>
    </>
  );
};

const MCQ = ({ gameData, onComplete }: MCQProps) => {
  const { questions } = gameData;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [charIndex, setCharIndex] = useState(-1);

  const current = questions[currentIdx];

  const handleSpeak = (text: string) => {
    stopSpeaking();
    setIsSpeaking(true);
    setCharIndex(0);
    speak(text, {
      onEnd: () => { setIsSpeaking(false); setCharIndex(-1); },
      onWordBoundary: (ci) => setCharIndex(ci),
    });
  };

  const handleAnswer = (choiceIdx: number) => {
    if (answered) return;
    setSelected(choiceIdx);
    setAnswered(true);
    const correct = choiceIdx === current.correctIndex;
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      stopSpeaking();
      setIsSpeaking(false);
      setCharIndex(-1);
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((i) => i + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        setFinished(true);
        const finalScore = score + (correct ? 1 : 0);
        if (finalScore >= questions.length * 0.6) {
          setTimeout(() => onComplete(finalScore, questions.length), 500);
        }
      }
    }, 1500);
  };

  if (finished) {
    return (
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
        <p className="font-body text-lg text-muted-foreground">Jeu terminé !</p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <p className="text-sm text-muted-foreground font-body">
        Question {currentIdx + 1} / {questions.length}
      </p>
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="p-5 rounded-lg bg-card border border-border">
        <div className="flex items-start gap-3">
          <button type="button" onClick={() => handleSpeak(current.question)} className="mt-1 p-1 hover:text-primary shrink-0">
            <Volume2 className="w-5 h-5" />
          </button>
          <p className="font-body text-lg text-foreground">
            <HighlightedText text={current.question} charIndex={charIndex} isSpeaking={isSpeaking} />
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {current.choices.map((choice, i) => {
          const isCorrect = i === current.correctIndex;
          const isSelected = selected === i;
          let variant: "default" | "outline" = "outline";
          let extraClass = "";

          if (answered) {
            if (isCorrect) {
              variant = "default";
              extraClass = "bg-emerald hover:bg-emerald border-emerald";
            } else if (isSelected) {
              variant = "default";
              extraClass = "bg-destructive hover:bg-destructive border-destructive";
            }
          }

          return (
            <Button
              key={i}
              size="lg"
              variant={variant}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={`w-full justify-start gap-3 font-body text-base ${extraClass}`}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); speak(choice); }}
                className="p-0.5 hover:text-primary shrink-0"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <span className="flex-1 text-left">{choice}</span>
              {answered && isCorrect && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {answered && isSelected && !isCorrect && <XCircle className="w-5 h-5 shrink-0" />}
            </Button>
          );
        })}
      </div>

      {answered && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-3 rounded-lg ${selected === current.correctIndex ? "bg-emerald/10 text-emerald" : "bg-destructive/10 text-destructive"}`}>
          <div className="flex items-center gap-2 font-body font-semibold">
            {selected === current.correctIndex ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {selected === current.correctIndex ? "Bonne réponse !" : "Mauvaise réponse..."}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MCQ;
