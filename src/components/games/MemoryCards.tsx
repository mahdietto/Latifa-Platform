import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { speak } from "@/lib/tts";

interface MemoryCardsProps {
  gameData: {
    pairs: { imageUrl: string; word: string }[];
  };
  onComplete: (score: number, total: number) => void;
}

interface Card {
  id: number;
  type: "image" | "word";
  value: string;
  pairId: number;
}

const MemoryCards = ({ gameData, onComplete }: MemoryCardsProps) => {
  const [cards] = useState<Card[]>(() => {
    const allCards: Card[] = [];
    gameData.pairs.forEach((pair, i) => {
      allCards.push({ id: i * 2, type: "image", value: pair.imageUrl, pairId: i });
      allCards.push({ id: i * 2 + 1, type: "word", value: pair.word, pairId: i });
    });
    return allCards.sort(() => Math.random() - 0.5);
  });

  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (matched.size === cards.length && cards.length > 0) {
      setFinished(true);
      const pairCount = gameData.pairs.length;
      setTimeout(() => onComplete(pairCount, pairCount), 500);
    }
  }, [matched.size]);

  const handleFlip = (cardId: number) => {
    if (flipped.has(cardId) || matched.has(cardId) || selected.length >= 2) return;

    const card = cards.find((c) => c.id === cardId)!;
    // Auto-play word when flipped
    if (card.type === "word") speak(card.value);

    const newSelected = [...selected, cardId];
    setSelected(newSelected);
    setFlipped((prev) => new Set([...prev, cardId]));

    if (newSelected.length === 2) {
      const [first, second] = newSelected.map((id) => cards.find((c) => c.id === id)!);
      if (first.pairId === second.pairId) {
        setTimeout(() => {
          setMatched((prev) => new Set([...prev, first.id, second.id]));
          setSelected([]);
        }, 600);
      } else {
        setTimeout(() => {
          setFlipped((prev) => {
            const n = new Set(prev);
            n.delete(first.id);
            n.delete(second.id);
            return n;
          });
          setSelected([]);
        }, 1000);
      }
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
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {cards.map((card) => {
        const isFlipped = flipped.has(card.id) || matched.has(card.id);
        const isMatched = matched.has(card.id);
        return (
          <motion.div
            key={card.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFlip(card.id)}
            className={`aspect-square rounded-lg border-2 cursor-pointer flex items-center justify-center overflow-hidden transition-all ${
              isMatched
                ? "border-emerald bg-emerald/10"
                : isFlipped
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            {isFlipped ? (
              card.type === "image" ? (
                <img src={card.value} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-body text-sm font-semibold text-foreground p-2 text-center">
                  {card.value}
                </span>
              )
            ) : (
              <span className="text-2xl">❓</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default MemoryCards;
