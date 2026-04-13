import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Fable } from "@/data/fables";
import { Gamepad2, Clock, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import FableFormModal from "@/components/FableFormModal";
import { useToast } from "@/hooks/use-toast";

interface FableCardProps {
  fable: Fable;
  index: number;
  onClick: () => void;
  onRefresh?: () => void;
}

const difficultyColors: Record<string, string> = {
  Facile: "bg-emerald/10 text-emerald",
  Moyen: "bg-accent/10 text-accent",
  Difficile: "bg-destructive/10 text-destructive",
};

const FableCard = ({ fable, index, onClick, onRefresh }: FableCardProps) => {
  const { isAdmin } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Supprimer cette fable ?")) return;
    await supabase.from("fable_games").delete().eq("fable_id", fable.id);
    await supabase.from("fables").delete().eq("id", fable.id);
    toast({ title: "Fable supprimée" });
    onRefresh?.();
  };

  return (
    <>
      <motion.div
        layoutId={`fable-card-${fable.id}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.35, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={onClick}
        className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-zinc-500/45 bg-card shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl"
      >
        {isAdmin && (
          <div className="absolute top-3 right-3 z-10 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button size="icon" variant="secondary" className="w-8 h-8 bg-background/90 backdrop-blur-sm shadow-md" onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button size="icon" variant="destructive" className="w-8 h-8 shadow-md" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.img
            src={fable.image}
            alt={fable.title}
            className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-110"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/22 to-transparent transition-opacity duration-300 group-hover:from-black/82 group-hover:via-black/28" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${difficultyColors[fable.difficulty]}`}>{fable.difficulty}</span>
          </div>
          {fable.hasGame && !isAdmin && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/90 text-primary-foreground">
                <Gamepad2 className="w-3 h-3" /> Jeu
              </span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3 h-3 text-muted" />
              <span className="text-xs text-muted font-medium">{fable.duration}</span>
            </div>
            <h3 className="font-display text-lg font-bold text-primary-foreground leading-tight mb-1">{fable.title}</h3>
            <p className="text-xs text-muted leading-relaxed line-clamp-2">{fable.teaser}</p>
          </div>
        </div>
      </motion.div>

      {editOpen && (
        <FableFormModal fable={fable} onClose={() => setEditOpen(false)} onSaved={() => { setEditOpen(false); onRefresh?.(); }} />
      )}
    </>
  );
};

export default FableCard;
