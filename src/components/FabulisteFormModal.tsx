import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Fabuliste } from "@/data/fabulistes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Upload, Save, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FabulisteFormModalProps {
  fabuliste?: Fabuliste | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FableOption {
  id: string;
  title: string;
  slug: string;
}

const FabulisteFormModal = ({ fabuliste, onClose, onSaved }: FabulisteFormModalProps) => {
  const isEdit = !!fabuliste;
  const [name, setName] = useState(fabuliste?.name || "");
  const [slug, setSlug] = useState(fabuliste?.slug || "");
  const [description, setDescription] = useState(fabuliste?.description || "");
  const [imagePreview, setImagePreview] = useState(fabuliste?.image_url || "");
  const [allFables, setAllFables] = useState<FableOption[]>([]);
  const [selectedFableIds, setSelectedFableIds] = useState<Set<string>>(new Set());
  const [fablesLoading, setFablesLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load all fables + pre-select ones already assigned to this fabuliste
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("fables")
        .select("id, title, slug, fabuliste_id")
        .order("title");
      if (data) {
        setAllFables(data.map((f) => ({ id: f.id, title: f.title, slug: f.slug })));
        if (isEdit && fabuliste) {
          const assigned = new Set(
            data.filter((f) => f.fabuliste_id === fabuliste.id).map((f) => f.id)
          );
          setSelectedFableIds(assigned);
        }
      }
      setFablesLoading(false);
    };
    load();
  }, [isEdit, fabuliste]);

  const generateSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-zà-ÿ0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) setSlug(generateSlug(val));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `fabulistes/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("fable-images").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("fable-images").getPublicUrl(path);
        setImagePreview(urlData.publicUrl);
      } else {
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const toggleFable = (id: string) => {
    setSelectedFableIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name,
        slug: slug || generateSlug(name),
        description,
        image_url: imagePreview,
      };

      let fabulisteId: string;

      if (isEdit && fabuliste) {
        await supabase.from("fabulistes").update(data).eq("id", fabuliste.id);
        fabulisteId = fabuliste.id;
        toast({ title: "Fabuliste modifié !" });
      } else {
        const { data: inserted, error } = await (supabase as any)
          .from("fabulistes")
          .insert(data)
          .select("id")
          .single();
        if (error) throw error;
        fabulisteId = inserted.id;
        toast({ title: "Fabuliste ajouté !" });
      }

      // Update fable assignments: unassign old, assign new
      // First, unassign any fables that were linked to this fabuliste but are no longer selected
      await supabase
        .from("fables")
        .update({ fabuliste_id: null })
        .eq("fabuliste_id", fabulisteId);

      // Then assign selected fables
      if (selectedFableIds.size > 0) {
        const ids = Array.from(selectedFableIds);
        for (const id of ids) {
          await supabase
            .from("fables")
            .update({ fabuliste_id: fabulisteId })
            .eq("id", id);
        }
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
        className="bg-card rounded-lg border border-border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {isEdit ? "Modifier le fabuliste" : "Ajouter un fabuliste"}
          </h2>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label className="font-body">Image</Label>
            <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => fileRef.current?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Aperçu" className="w-full h-40 object-cover rounded-md" />
              ) : (
                <div className="py-8">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground font-body">Cliquer pour télécharger</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body">Nom</Label>
              <Input value={name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="Jean de La Fontaine" />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="jean-de-la-fontaine" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body">Description / Biographie</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={6} placeholder="Biographie du fabuliste..." />
          </div>

          {/* Fable selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <Label className="font-body font-semibold">Fables associées</Label>
              <span className="text-xs text-muted-foreground">({selectedFableIds.size} sélectionnées)</span>
            </div>
            <div className="border border-border rounded-lg max-h-48 overflow-y-auto p-2 space-y-1 bg-background">
              {fablesLoading ? (
                <p className="text-sm text-muted-foreground p-2">Chargement...</p>
              ) : allFables.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">Aucune fable disponible</p>
              ) : (
                allFables.map((fable) => (
                  <label
                    key={fable.id}
                    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={selectedFableIds.has(fable.id)}
                      onCheckedChange={() => toggleFable(fable.id)}
                    />
                    <span className="text-sm font-body text-foreground">{fable.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="font-body">Annuler</Button>
            <Button type="submit" className="gap-2 font-body font-semibold">
              <Save className="w-4 h-4" />
              {isEdit ? "Modifier" : "Ajouter"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default FabulisteFormModal;
