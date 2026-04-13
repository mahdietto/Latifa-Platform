import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RatingRow {
  expression: string;
}

interface ExpressionRatingTableProps {
  gameData: {
    rows: RatingRow[];
  };
  onComplete: (score: number, total: number) => void;
}

/** Order: Poor → Average → Good → Excellent (images only in UI; labels for a11y). */
const LEVELS = [
  { src: "/images/sad.png", ariaLabel: "Insuffisant" },
  { src: "/images/confused.png", ariaLabel: "Moyen" },
  { src: "/images/happiness.png", ariaLabel: "Bien" },
  { src: "/images/happy-face.png", ariaLabel: "Excellent" },
];

const ExpressionRatingTable = ({ gameData, onComplete }: ExpressionRatingTableProps) => {
  const rows = useMemo(() => gameData?.rows || [], [gameData]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = rows.length > 0 && rows.every((_, idx) => answers[idx] !== undefined);

  if (rows.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card">
        <p className="font-body text-sm text-muted-foreground">
          Aucune ligne configurée pour ce jeu.
        </p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    setTimeout(() => onComplete(rows.length, rows.length), 600);
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <p className="font-body text-sm text-muted-foreground">
        Lis chaque expression et choisis un seul niveau par ligne.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left p-3 font-body text-sm font-semibold text-foreground">Expression</th>
              {LEVELS.map((level) => (
                <th key={level.src} className="p-3 text-center align-middle">
                  <div className="flex justify-center">
                    <img
                      src={level.src}
                      alt=""
                      className="h-11 w-11 object-contain select-none pointer-events-none"
                      draggable={false}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border/60 last:border-0">
                <td className="p-3 font-body text-sm text-foreground">{row.expression}</td>
                {LEVELS.map((level, levelIndex) => {
                  const selected = answers[rowIndex] === levelIndex;
                  return (
                    <td key={levelIndex} className="p-2 text-center align-middle">
                      <button
                        type="button"
                        disabled={submitted}
                        aria-label={`${row.expression} — ${level.ariaLabel}`}
                        onClick={() => setAnswers((prev) => ({ ...prev, [rowIndex]: levelIndex }))}
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-colors ${
                          selected
                            ? "border-primary bg-primary/15 ring-2 ring-primary/30"
                            : "border-muted-foreground/35 hover:border-primary/55 bg-background/50"
                        }`}
                      >
                        {selected && (
                          <motion.span
                            key={`cross-${rowIndex}-${levelIndex}`}
                            initial={{ scale: 0.2, opacity: 0, rotate: -20 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 420, damping: 20 }}
                            className="text-primary text-2xl font-bold leading-none"
                            aria-hidden="true"
                          >
                            ✕
                          </motion.span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={!allAnswered || submitted} className="font-body">
          Valider
        </Button>
        {!allAnswered && (
          <p className="text-xs text-muted-foreground font-body">Sélectionne un niveau pour chaque ligne.</p>
        )}
      </div>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-emerald/10 text-emerald"
        >
          <div className="flex items-center gap-2 font-body font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            Merci ! Ton auto-évaluation a été enregistrée.
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ExpressionRatingTable;
