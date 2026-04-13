import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Gamepad2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FableGame } from "@/hooks/use-fable-games";

const GAME_TYPES = [
  { value: "image_word_match", label: "🖼️ Images et Mots" },
  { value: "fill_blanks", label: "📝 Texte à trous" },
  { value: "memory_cards", label: "🃏 Cartes Mémoire" },
  { value: "true_false", label: "✅ Vrai ou Faux" },
  { value: "crossword", label: "🔤 Mots Croisés" },
  { value: "paragraph_order", label: "📖 Ordre des Événements" },
];

interface GameEditorProps {
  fableId: string;
  games: FableGame[];
  onRefresh: () => void;
}

const GameEditor = ({ fableId, games, onRefresh }: GameEditorProps) => {
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState("image_word_match");
  const [newTitle, setNewTitle] = useState("");
  const [newData, setNewData] = useState("");
  const { toast } = useToast();

  const getTemplate = (type: string) => {
    switch (type) {
      case "image_word_match":
        return JSON.stringify({ pairs: [{ imageUrl: "https://...", word: "mot" }] }, null, 2);
      case "fill_blanks":
        return JSON.stringify({ paragraph: "Le ___renard___ est ___rusé___.", words: ["renard", "rusé"] }, null, 2);
      case "memory_cards":
        return JSON.stringify({ pairs: [{ imageUrl: "https://...", word: "mot" }] }, null, 2);
      case "true_false":
        return JSON.stringify({ statements: [{ text: "Le corbeau chante bien.", isTrue: false }] }, null, 2);
      case "crossword":
        return JSON.stringify({ words: [{ word: "renard", clue: "Animal rusé de la fable" }] }, null, 2);
      case "paragraph_order":
        return JSON.stringify({ paragraph: "Le texte complet ici...", sentences: ["Première phrase.", "Deuxième phrase."] }, null, 2);
      default:
        return "{}";
    }
  };

  const handleAdd = async () => {
    try {
      const gameData = JSON.parse(newData || "{}");
      const { error } = await supabase.from("fable_games").insert({
        fable_id: fableId,
        game_type: newType,
        title: newTitle,
        game_data: gameData,
        sort_order: games.length,
      });
      if (error) throw error;
      toast({ title: "Jeu ajouté !" });
      setAdding(false);
      setNewTitle("");
      setNewData("");
      onRefresh();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm("Supprimer ce jeu ?")) return;
    await supabase.from("fable_games").delete().eq("id", gameId);
    toast({ title: "Jeu supprimé" });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          Mini-Jeux ({games.length})
        </h3>
        <Button size="sm" onClick={() => { setAdding(true); setNewData(getTemplate(newType)); }} className="gap-1 font-body">
          <Plus className="w-4 h-4" /> Ajouter un jeu
        </Button>
      </div>

      {games.map((game) => (
        <div key={game.id} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
          <div>
            <span className="font-body text-sm font-semibold text-foreground">
              {GAME_TYPES.find((t) => t.value === game.game_type)?.label || game.game_type}
            </span>
            {game.title && <span className="text-xs text-muted-foreground ml-2">— {game.title}</span>}
          </div>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(game.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}

      {adding && (
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-body text-sm">Type de jeu</Label>
              <select
                value={newType}
                onChange={(e) => { setNewType(e.target.value); setNewData(getTemplate(e.target.value)); }}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body"
              >
                {GAME_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="font-body text-sm">Titre (optionnel)</Label>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Quiz vocabulaire" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="font-body text-sm">Données du jeu (JSON)</Label>
            <Textarea value={newData} onChange={(e) => setNewData(e.target.value)} rows={10} className="font-mono text-xs" />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAdd} className="gap-1 font-body">
              <Save className="w-4 h-4" /> Enregistrer
            </Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="font-body">Annuler</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameEditor;
