import { motion } from "framer-motion";
import { ArrowLeft, Feather, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Fabuliste } from "@/data/fabulistes";
import { useFabulisteFables } from "@/data/fabulistes";

interface FabulisteDetailProps {
  fabuliste: Fabuliste;
  onBack: () => void;
}

const FabulisteDetail = ({ fabuliste, onBack }: FabulisteDetailProps) => {
  const { fables, loading } = useFabulisteFables(fabuliste.id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <Button onClick={onBack} variant="secondary" size="lg" className="gap-2 font-body font-semibold mb-6">
        <ArrowLeft className="w-5 h-5" />
        Retour aux Fabulistes
      </Button>

      {/* Writer image + info */}
      <div className="mb-8 rounded-lg bg-card border border-border overflow-hidden">
        <div className="aspect-video flex items-center justify-center bg-muted overflow-hidden">
          <img
            src={fabuliste.image_url}
            alt={fabuliste.name}
            className="w-full h-full object-contain bg-muted"
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-2 mb-2">
          <Feather className="w-5 h-5 text-accent" />
          <span className="text-sm font-body font-semibold text-accent uppercase tracking-wider">Fabuliste</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">{fabuliste.name}</h1>

        <div className="mb-8">
          <h3 className="font-display text-xl font-semibold text-foreground mb-3">Biographie</h3>
          <p className="text-foreground/70 font-body text-base leading-relaxed whitespace-pre-line">{fabuliste.description}</p>
        </div>

        {/* Fables by this fabuliste */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-display text-xl font-semibold text-foreground">Ses Fables</h3>
          </div>

          {loading ? (
            <p className="text-muted-foreground font-body">Chargement...</p>
          ) : fables.length === 0 ? (
            <p className="text-muted-foreground font-body">Aucune fable associée pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fables.map((fable: any) => (
                <div
                  key={fable.id}
                  className="rounded-lg overflow-hidden border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="h-32 overflow-hidden">
                    <img src={fable.image_url} alt={fable.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-display text-lg font-bold text-foreground">{fable.title}</h4>
                    <p className="text-xs text-muted-foreground font-body mt-1 line-clamp-2">{fable.teaser}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FabulisteDetail;
