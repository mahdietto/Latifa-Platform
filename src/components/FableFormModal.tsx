import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Fable } from "@/data/fables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFableGames } from "@/hooks/use-fable-games";
import GameEditorVisual from "@/components/admin/GameEditorVisual";
import { buildThemeOptions } from "@/data/themes";
import { buildOriginOptions, getCustomOrigins, getFableOriginMap, getHiddenOrigins, setFableOrigin } from "@/data/origins";
import { useAuth } from "@/contexts/AuthContext";
import { useNavOverlay } from "@/contexts/NavOverlayContext";

interface FableFormModalProps {
  fable?: Fable | null;
  onClose: () => void;
  onSaved: () => void;
}

const FableFormModal = ({ fable, onClose, onSaved }: FableFormModalProps) => {
  const { isAdmin } = useAuth();
  const { setHeaderSuppressed } = useNavOverlay();
  const isEdit = !!fable;

  useEffect(() => {
    setHeaderSuppressed(true);
    return () => setHeaderSuppressed(false);
  }, [setHeaderSuppressed]);
  const [title, setTitle] = useState(fable?.title || "");
  const [slug, setSlug] = useState(fable?.slug || "");
  const [teaser, setTeaser] = useState(fable?.teaser || "");
  const [moral, setMoral] = useState(fable?.moral || "");
  const [story, setStory] = useState(fable?.story || "");
  const [difficulty, setDifficulty] = useState<string>(fable?.difficulty || "Facile");
  const [duration, setDuration] = useState(fable?.duration || "3 min");
  const [hasGame, setHasGame] = useState(fable?.hasGame || false);
  const [videoUrl, setVideoUrl] = useState(fable?.videoUrl || "");
  const [theme, setTheme] = useState(fable?.theme || "");
  const [origin, setOrigin] = useState(() => {
    if (!fable?.id) return "";
    const map = getFableOriginMap();
    return map[fable.id] || "";
  });
  const [imagePreview, setImagePreview] = useState(fable?.image || "");
  const [savedFableId, setSavedFableId] = useState<string | null>(fable?.id || null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { games, refetch: refetchGames } = useFableGames(savedFableId || undefined);
  const themeOptions = buildThemeOptions([]);
  const originOptions = buildOriginOptions([], getCustomOrigins(), getHiddenOrigins());

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const path = `${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}.${ext}`;

    try {
      const { error } = await supabase.storage.from("fable-images").upload(path, file, {
        upsert: true,
        contentType: file.type || `image/${ext}`,
      });
      if (!error) {
        const { data: urlData } = supabase.storage.from("fable-images").getPublicUrl(path);
        setImagePreview(`${urlData.publicUrl}${urlData.publicUrl.includes("?") ? "&" : "?"}v=${Date.now()}`);
      } else {
        console.warn("[FableFormModal] storage upload:", error);
        toast({
          title: "Envoi Supabase impossible",
          description: `${error.message} — aperçu local utilisé ; vérifie les droits storage (admin).`,
          variant: "destructive",
        });
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Erreur d’upload", description: msg, variant: "destructive" });
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      // Allow choosing the same file again (otherwise onChange does not fire)
      input.value = "";
    }
  };

  const openFilePicker = () => {
    const el = fileRef.current;
    if (el) el.value = "";
    el?.click();
  };

  const generateSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-zà-ÿ0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && !savedFableId) setSlug(generateSlug(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fableData = {
        title,
        slug: slug || generateSlug(title),
        teaser,
        moral,
        story,
        difficulty,
        duration,
        has_game: hasGame,
        video_url: videoUrl || null,
        image_url: imagePreview,
        theme,
      };

      if (isEdit && fable) {
        await supabase.from("fables").update(fableData).eq("id", fable.id);
        if (origin) setFableOrigin(fable.id, origin);
        toast({ title: "Fable modifiée !" });
      } else if (savedFableId) {
        await supabase.from("fables").update(fableData).eq("id", savedFableId);
        if (origin) setFableOrigin(savedFableId, origin);
        toast({ title: "Fable modifiée !" });
      } else {
        const { data, error } = await supabase.from("fables").insert(fableData).select().single();
        if (error) throw error;
        setSavedFableId(data.id);
        if (origin) setFableOrigin(data.id, origin);
        toast({ title: "Fable créée ! Vous pouvez maintenant ajouter des jeux." });
        return;
      }
      onSaved();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-lg border border-border shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {isEdit || savedFableId ? "Modifier la fable" : "Ajouter une fable"}
          </h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label className="font-body">Image</Label>
            <button
              type="button"
              className="mt-2 w-full border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                openFilePicker();
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Aperçu"
                  className="pointer-events-none mx-auto h-40 w-full max-w-full select-none rounded-md object-cover"
                  draggable={false}
                />
              ) : (
                <div className="py-8">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground font-body">Cliquer pour télécharger une image</p>
                </div>
              )}
              {imagePreview && (
                <p className="mt-2 text-xs text-muted-foreground font-body">Cliquer pour changer l’image</p>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body">Titre</Label>
              <Input value={title} onChange={(e) => handleTitleChange(e.target.value)} required placeholder="Le Corbeau et le Renard" />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="corbeau-renard" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body">Accroche</Label>
            <Input value={teaser} onChange={(e) => setTeaser(e.target.value)} required placeholder="Un renard rusé..." />
          </div>

          <div className="space-y-2">
            <Label className="font-body">Morale</Label>
            <Input value={moral} onChange={(e) => setMoral(e.target.value)} required placeholder="Tout flatteur vit aux dépens..." />
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <Label className="font-body">Histoire</Label>
              <Textarea value={story} onChange={(e) => setStory(e.target.value)} required rows={6} placeholder="Maître Corbeau, sur un arbre perché..." />
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-body">URL Vidéo (Cloudinary)</Label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://res.cloudinary.com/..." />
          </div>

          <div className="space-y-2">
            <Label className="font-body">Thème</Label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body">
              <option value="">— Choisir un thème —</option>
              {themeOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="font-body">Origine</Label>
            <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body">
              <option value="">— Choisir une origine —</option>
              {originOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="font-body">Difficulté</Label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body">
                <option value="Facile">Facile</option>
                <option value="Moyen">Moyen</option>
                <option value="Difficile">Difficile</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="font-body">Durée</Label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="3 min" />
            </div>
            <div className="flex items-end pb-1 gap-2">
              <input type="checkbox" id="hasGame" checked={hasGame} onChange={(e) => setHasGame(e.target.checked)} className="w-4 h-4" />
              <Label htmlFor="hasGame" className="font-body">Mini-jeu</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="font-body">Annuler</Button>
            <Button type="submit" className="gap-2 font-body font-semibold">
              <Save className="w-4 h-4" />
              {isEdit || savedFableId ? "Modifier" : "Créer et ajouter des jeux"}
            </Button>
          </div>
        </form>

        {savedFableId && (
          <div className="px-6 pb-6 border-t border-border pt-4">
            <GameEditorVisual fableId={savedFableId} games={games} onRefresh={refetchGames} />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FableFormModal;
