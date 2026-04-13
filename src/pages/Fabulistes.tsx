import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { useFabulistes, type Fabuliste } from "@/data/fabulistes";
import { Feather, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FabulisteDetail from "@/components/FabulisteDetail";
import FabulisteFormModal from "@/components/FabulisteFormModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Fabulistes = () => {
  const { fabulistes, loading, refetch } = useFabulistes();
  const [selected, setSelected] = useState<Fabuliste | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editFabuliste, setEditFabuliste] = useState<Fabuliste | null>(null);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const handleDelete = async (f: Fabuliste) => {
    if (!confirm(`Supprimer ${f.name} ?`)) return;
    await (supabase as any).from("fabulistes").delete().eq("id", f.id);
    toast({ title: "Fabuliste supprimé" });
    refetch();
  };

  return (
    <div className="min-h-screen pt-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FabulisteDetail fabuliste={selected} onBack={() => setSelected(null)} />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
                <div className="mb-3 flex items-center justify-center gap-2">
                  <Feather className="h-5 w-5 text-amber-300 drop-shadow" />
                  <span className="text-sm font-body font-semibold uppercase tracking-wider text-white drop-shadow-md">Les Auteurs</span>
                  <Feather className="h-5 w-5 text-amber-300 drop-shadow" />
                </div>
                <h2 className="mb-4 font-display text-4xl font-bold text-white drop-shadow-md md:text-5xl">
                  Découvre les <span className="text-gradient-primary">Fabulistes</span>
                </h2>
                <p className="mx-auto max-w-xl font-body text-lg text-white/95 drop-shadow leading-relaxed">
                  Explore la vie et les œuvres des grands fabulistes de la littérature.
                </p>
              </motion.div>

              {isAdmin && (
                <div className="flex justify-end mb-6">
                  <Button onClick={() => setAddOpen(true)} className="gap-2 font-body font-semibold">
                    <Plus className="w-4 h-4" /> Ajouter un fabuliste
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {fabulistes.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelected(f)}
                    className="group relative cursor-pointer overflow-hidden rounded-[1.75rem] border border-zinc-500/45 bg-card shadow-md transition-all duration-300 hover:border-primary/50 hover:shadow-xl"
                  >
                    {isAdmin && (
                      <div className="absolute top-3 right-3 z-10 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="secondary" className="w-8 h-8 bg-background/90 backdrop-blur-sm shadow-md" onClick={(e) => { e.stopPropagation(); setEditFabuliste(f); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="destructive" className="w-8 h-8 shadow-md" onClick={(e) => { e.stopPropagation(); handleDelete(f); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                    <div className="relative overflow-hidden aspect-[4/5]">
                      <motion.img
                        src={f.image_url}
                        alt={f.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Feather className="w-3 h-3 text-muted" />
                          <span className="text-xs text-muted font-medium">Fabuliste</span>
                        </div>
                        <h3 className="font-display text-lg font-bold text-primary-foreground leading-tight mb-1">{f.name}</h3>
                        <p className="text-xs text-muted leading-relaxed line-clamp-2">{f.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {!loading && fabulistes.length === 0 && (
                <p className="text-center text-muted-foreground font-body mt-8">Aucun fabuliste trouvé.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {addOpen && (
        <FabulisteFormModal onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); refetch(); }} />
      )}
      {editFabuliste && (
        <FabulisteFormModal fabuliste={editFabuliste} onClose={() => setEditFabuliste(null)} onSaved={() => { setEditFabuliste(null); refetch(); }} />
      )}
    </div>
  );
};

export default Fabulistes;
