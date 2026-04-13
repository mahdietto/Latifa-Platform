import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Gamepad2, GripVertical, Image, Type, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FableGame } from "@/hooks/use-fable-games";

const GAME_TYPES = [
  { value: "mcq", label: "❓ Questions à Choix Multiples" },
  { value: "video_sound_match", label: "🎧 Associer Son et Vidéo" },
  { value: "expression_rating_table", label: "📊 Auto-évaluation" },
  { value: "true_false", label: "✅ Vrai ou Faux" },
  { value: "fill_blanks", label: "📝 Texte à trous" },
  { value: "image_word_match", label: "🖼️ Images et Mots" },
  { value: "memory_cards", label: "🃏 Cartes Mémoire" },
  { value: "crossword", label: "🔤 Mots Croisés" },
  { value: "paragraph_order", label: "📖 Ordre des Événements" },
];

interface GameEditorVisualProps {
  fableId: string;
  games: FableGame[];
  onRefresh: () => void;
}

interface VideoSegmentData {
  enabled: boolean;
  startSeconds: number;
  endSeconds: number;
}

// ──── MCQ Editor ────
const MCQEditor = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  const questions = data?.questions || [{ question: "", choices: ["", ""], correctIndex: 0 }];

  const update = (idx: number, field: string, val: any) => {
    const q = [...questions];
    q[idx] = { ...q[idx], [field]: val };
    onChange({ questions: q });
  };

  const updateChoice = (qIdx: number, cIdx: number, val: string) => {
    const q = [...questions];
    const choices = [...q[qIdx].choices];
    choices[cIdx] = val;
    q[qIdx] = { ...q[qIdx], choices };
    onChange({ questions: q });
  };

  const addChoice = (qIdx: number) => {
    const q = [...questions];
    q[qIdx] = { ...q[qIdx], choices: [...q[qIdx].choices, ""] };
    onChange({ questions: q });
  };

  const removeChoice = (qIdx: number, cIdx: number) => {
    const q = [...questions];
    const choices = q[qIdx].choices.filter((_: any, i: number) => i !== cIdx);
    const ci = q[qIdx].correctIndex >= choices.length ? 0 : q[qIdx].correctIndex;
    q[qIdx] = { ...q[qIdx], choices, correctIndex: ci };
    onChange({ questions: q });
  };

  return (
    <div className="space-y-4">
      {questions.map((q: any, qIdx: number) => (
        <div key={qIdx} className="p-4 rounded-lg border border-border bg-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-body text-sm font-semibold text-muted-foreground">Question {qIdx + 1}</span>
            {questions.length > 1 && (
              <Button size="icon" variant="ghost" onClick={() => onChange({ questions: questions.filter((_: any, i: number) => i !== qIdx) })}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
          </div>
          <Input value={q.question} onChange={(e) => update(qIdx, "question", e.target.value)} placeholder="Écris la question ici..." />
          <div className="space-y-2">
            <Label className="font-body text-xs text-muted-foreground">Choix (cliquer le rond pour marquer la bonne réponse)</Label>
            {q.choices.map((c: string, cIdx: number) => (
              <div key={cIdx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => update(qIdx, "correctIndex", cIdx)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    q.correctIndex === cIdx ? "border-primary bg-primary" : "border-muted-foreground"
                  }`}
                >
                  {q.correctIndex === cIdx && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                </button>
                <Input value={c} onChange={(e) => updateChoice(qIdx, cIdx, e.target.value)} placeholder={`Choix ${cIdx + 1}`} className="flex-1" />
                {q.choices.length > 2 && (
                  <Button size="icon" variant="ghost" onClick={() => removeChoice(qIdx, cIdx)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => addChoice(qIdx)} className="text-xs font-body gap-1">
              <Plus className="w-3 h-3" /> Ajouter un choix
            </Button>
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange({ questions: [...questions, { question: "", choices: ["", ""], correctIndex: 0 }] })} className="font-body gap-1">
        <Plus className="w-4 h-4" /> Ajouter une question
      </Button>
    </div>
  );
};

// ──── True/False Editor ────
const TrueFalseEditor = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  const statements = data?.statements || [{ text: "", isTrue: true }];

  return (
    <div className="space-y-3">
      {statements.map((s: any, idx: number) => (
        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
          <Input value={s.text} onChange={(e) => {
            const arr = [...statements];
            arr[idx] = { ...arr[idx], text: e.target.value };
            onChange({ statements: arr });
          }} placeholder="Affirmation..." className="flex-1" />
          <select
            value={s.isTrue ? "true" : "false"}
            onChange={(e) => {
              const arr = [...statements];
              arr[idx] = { ...arr[idx], isTrue: e.target.value === "true" };
              onChange({ statements: arr });
            }}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body"
          >
            <option value="true">✅ Vrai</option>
            <option value="false">❌ Faux</option>
          </select>
          {statements.length > 1 && (
            <Button size="icon" variant="ghost" onClick={() => onChange({ statements: statements.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange({ statements: [...statements, { text: "", isTrue: true }] })} className="font-body gap-1">
        <Plus className="w-4 h-4" /> Ajouter une affirmation
      </Button>
    </div>
  );
};

// ──── Fill Blanks Editor ────
const FillBlanksEditor = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  const paragraph = data?.paragraph || "";
  const words = data?.words || [];

  return (
    <div className="space-y-3">
      <div>
        <Label className="font-body text-sm">Paragraphe</Label>
        <p className="text-xs text-muted-foreground font-body mb-1">
          Entourez les mots à deviner avec trois tirets bas : ___mot___
        </p>
        <Textarea
          value={paragraph}
          onChange={(e) => {
            const text = e.target.value;
            const extracted = [...text.matchAll(/___([^_]+)___/g)].map(m => m[1]);
            onChange({ paragraph: text, words: extracted });
          }}
          rows={4}
          placeholder="Le ___renard___ est très ___rusé___."
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Label className="font-body text-sm w-full">Mots à trouver (auto-détectés) :</Label>
        {words.length > 0 ? words.map((w: string, i: number) => (
          <span key={i} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-body font-semibold">{w}</span>
        )) : (
          <span className="text-xs text-muted-foreground font-body">Aucun mot détecté. Utilisez ___mot___ dans le texte.</span>
        )}
      </div>
    </div>
  );
};

// ──── Image Word Match / Memory Cards Editor ────
const PairsEditor = ({ data, onChange, label }: { data: any; onChange: (d: any) => void; label: string }) => {
  const pairs = data?.pairs || [{ imageUrl: "", word: "" }];

  return (
    <div className="space-y-3">
      <Label className="font-body text-sm">{label}</Label>
      {pairs.map((p: any, idx: number) => (
        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input value={p.imageUrl} onChange={(e) => {
                const arr = [...pairs];
                arr[idx] = { ...arr[idx], imageUrl: e.target.value };
                onChange({ pairs: arr });
              }} placeholder="URL de l'image" />
            </div>
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input value={p.word} onChange={(e) => {
                const arr = [...pairs];
                arr[idx] = { ...arr[idx], word: e.target.value };
                onChange({ pairs: arr });
              }} placeholder="Mot correspondant" />
            </div>
          </div>
          {p.imageUrl && (
            <img src={p.imageUrl} alt="" className="w-16 h-16 rounded-md object-cover shrink-0 border border-border" />
          )}
          {pairs.length > 1 && (
            <Button size="icon" variant="ghost" onClick={() => onChange({ pairs: pairs.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange({ pairs: [...pairs, { imageUrl: "", word: "" }] })} className="font-body gap-1">
        <Plus className="w-4 h-4" /> Ajouter une paire
      </Button>
    </div>
  );
};

// ──── Crossword Editor ────
const CrosswordEditor = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  const words = data?.words || [{ word: "", clue: "" }];

  return (
    <div className="space-y-3">
      {words.map((w: any, idx: number) => (
        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Input value={w.word} onChange={(e) => {
              const arr = [...words];
              arr[idx] = { ...arr[idx], word: e.target.value };
              onChange({ words: arr });
            }} placeholder="Mot" />
            <Input value={w.clue} onChange={(e) => {
              const arr = [...words];
              arr[idx] = { ...arr[idx], clue: e.target.value };
              onChange({ words: arr });
            }} placeholder="Indice" />
          </div>
          {words.length > 1 && (
            <Button size="icon" variant="ghost" onClick={() => onChange({ words: words.filter((_: any, i: number) => i !== idx) })}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange({ words: [...words, { word: "", clue: "" }] })} className="font-body gap-1">
        <Plus className="w-4 h-4" /> Ajouter un mot
      </Button>
    </div>
  );
};

// ──── Paragraph Order Editor ────
const ParagraphOrderEditor = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  const paragraph = data?.paragraph || "";
  const sentences = data?.sentences || [""];

  return (
    <div className="space-y-3">
      <div>
        <Label className="font-body text-sm">Paragraphe complet</Label>
        <Textarea value={paragraph} onChange={(e) => onChange({ ...data, paragraph: e.target.value })} rows={3} placeholder="Le texte complet ici..." />
      </div>
      <div>
        <Label className="font-body text-sm">Phrases dans l'ordre correct</Label>
        <p className="text-xs text-muted-foreground font-body mb-2">L'élève devra les remettre dans cet ordre.</p>
        {sentences.map((s: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-muted-foreground w-6 text-center">{idx + 1}</span>
            <Input value={s} onChange={(e) => {
              const arr = [...sentences];
              arr[idx] = e.target.value;
              onChange({ ...data, sentences: arr });
            }} placeholder={`Phrase ${idx + 1}`} className="flex-1" />
            {sentences.length > 1 && (
              <Button size="icon" variant="ghost" onClick={() => onChange({ ...data, sentences: sentences.filter((_: any, i: number) => i !== idx) })}>
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            )}
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => onChange({ ...data, sentences: [...sentences, ""] })} className="font-body gap-1">
          <Plus className="w-4 h-4" /> Ajouter une phrase
        </Button>
      </div>
    </div>
  );
};

const VideoSoundMatchEditor = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  const options = data?.options || [
    { sentence: "", isCorrect: true },
    { sentence: "", isCorrect: false },
  ];

  const setCorrect = (idx: number) => {
    const next = options.map((o: any, i: number) => ({ ...o, isCorrect: i === idx }));
    onChange({ ...data, options: next });
  };

  const updateSentence = (idx: number, sentence: string) => {
    const next = [...options];
    next[idx] = { ...next[idx], sentence };
    onChange({ ...data, options: next });
  };

  const addOption = () => {
    onChange({ ...data, options: [...options, { sentence: "", isCorrect: false }] });
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    let next = options.filter((_: any, i: number) => i !== idx);
    if (!next.some((o: any) => o.isCorrect)) {
      next = next.map((o: any, i: number) => ({ ...o, isCorrect: i === 0 }));
    }
    onChange({ ...data, options: next });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="font-body text-sm">Instruction (optionnel)</Label>
        <Input
          value={data?.prompt || ""}
          onChange={(e) => onChange({ ...data, prompt: e.target.value })}
          placeholder="Ex: Écoute les sons et choisis le bon."
        />
      </div>
      <p className="text-xs text-muted-foreground font-body">
        L'admin écrit des phrases. En jeu, l'élève ne verra pas les phrases, seulement les boutons pour écouter chaque son.
      </p>
      {options.map((option: any, idx: number) => (
        <div key={idx} className="p-3 rounded-lg border border-border bg-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-body font-semibold text-muted-foreground">Son {idx + 1}</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={option.isCorrect ? "default" : "outline"}
                onClick={() => setCorrect(idx)}
                className="text-xs"
              >
                {option.isCorrect ? "Bonne réponse" : "Marquer bonne réponse"}
              </Button>
              {options.length > 2 && (
                <Button type="button" size="icon" variant="ghost" onClick={() => removeOption(idx)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          </div>
          <Textarea
            value={option.sentence}
            onChange={(e) => updateSentence(idx, e.target.value)}
            rows={2}
            placeholder="Phrase qui sera lue en audio (non affichée à l'élève)"
          />
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addOption} className="font-body gap-1">
        <Plus className="w-4 h-4" /> Ajouter un son
      </Button>
    </div>
  );
};

const ExpressionRatingTableEditor = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  const rows = data?.rows || [{ expression: "" }];

  const updateRow = (idx: number, patch: any) => {
    const next = [...rows];
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...data, rows: next });
  };

  const addRow = () => {
    onChange({ ...data, rows: [...rows, { expression: "" }] });
  };

  const removeRow = (idx: number) => {
    if (rows.length <= 1) return;
    onChange({ ...data, rows: rows.filter((_: any, i: number) => i !== idx) });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground font-body">
        Colonnes fixes: Poor / Average / Good / Excellent. L'admin définit seulement les expressions/questions, sans bonne réponse.
      </p>
      {rows.map((row: any, idx: number) => (
        <div key={idx} className="p-3 rounded-lg border border-border bg-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-body font-semibold text-muted-foreground">Ligne {idx + 1}</span>
            {rows.length > 1 && (
              <Button size="icon" variant="ghost" onClick={() => removeRow(idx)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            )}
          </div>
          <Input
            value={row.expression || ""}
            onChange={(e) => updateRow(idx, { expression: e.target.value })}
            placeholder="Ex: Est-ce que tu comprends la morale de la fable ?"
          />
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={addRow} className="font-body gap-1">
        <Plus className="w-4 h-4" /> Ajouter une ligne
      </Button>
    </div>
  );
};

const VideoSegmentEditor = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  const current: VideoSegmentData = {
    enabled: Boolean(data?.videoSegment?.enabled),
    startSeconds: Number(data?.videoSegment?.startSeconds ?? 0),
    endSeconds: Number(data?.videoSegment?.endSeconds ?? 15),
  };

  const update = (patch: Partial<VideoSegmentData>) => {
    onChange({
      ...data,
      videoSegment: {
        ...current,
        ...patch,
      },
    });
  };

  return (
    <div className="mt-4 rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-body text-sm font-semibold text-foreground">Extrait vidéo du jeu</p>
          <p className="font-body text-xs text-muted-foreground">
            Utilise la vidéo de la fable et définis la partie visible pendant ce jeu.
          </p>
        </div>
        <input
          type="checkbox"
          checked={current.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
          className="w-4 h-4"
        />
      </div>

      {current.enabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="font-body text-xs">Début (secondes)</Label>
            <Input
              type="number"
              min={0}
              step={1}
              value={current.startSeconds}
              onChange={(e) => update({ startSeconds: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label className="font-body text-xs">Fin (secondes)</Label>
            <Input
              type="number"
              min={0}
              step={1}
              value={current.endSeconds}
              onChange={(e) => update({ endSeconds: Number(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ──── Main Component ────
const GameEditorVisual = ({ fableId, games, onRefresh }: GameEditorVisualProps) => {
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState("mcq");
  const [newTitle, setNewTitle] = useState("");
  const [newData, setNewData] = useState<any>({});
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editType, setEditType] = useState("mcq");
  const [editTitle, setEditTitle] = useState("");
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const renderEditor = (type: string, data: any, onChange: (d: any) => void) => {
    switch (type) {
      case "mcq": return <MCQEditor data={data} onChange={onChange} />;
      case "true_false": return <TrueFalseEditor data={data} onChange={onChange} />;
      case "fill_blanks": return <FillBlanksEditor data={data} onChange={onChange} />;
      case "image_word_match": return <PairsEditor data={data} onChange={onChange} label="Paires Image ↔ Mot" />;
      case "memory_cards": return <PairsEditor data={data} onChange={onChange} label="Paires Carte Mémoire" />;
      case "crossword": return <CrosswordEditor data={data} onChange={onChange} />;
      case "paragraph_order": return <ParagraphOrderEditor data={data} onChange={onChange} />;
      case "video_sound_match": return <VideoSoundMatchEditor data={data} onChange={onChange} />;
      case "expression_rating_table": return <ExpressionRatingTableEditor data={data} onChange={onChange} />;
      default: return <p className="text-sm text-muted-foreground font-body">Type non supporté</p>;
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("fable_games").insert({
        fable_id: fableId,
        game_type: newType,
        title: newTitle,
        game_data: newData,
        sort_order: games.length,
      });
      if (error) throw error;
      toast({ title: "Jeu ajouté !" });
      setAdding(false);
      setNewTitle("");
      setNewData({});
      onRefresh();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (gameId: string) => {
    if (!confirm("Supprimer ce jeu ?")) return;
    await supabase.from("fable_games").delete().eq("id", gameId);
    toast({ title: "Jeu supprimé" });
    onRefresh();
  };

  const startEditing = (game: FableGame) => {
    setEditingGameId(game.id);
    setEditType(game.game_type);
    setEditTitle(game.title || "");
    setEditData(game.game_data || {});
  };

  const handleUpdate = async () => {
    if (!editingGameId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("fable_games")
        .update({
          game_type: editType,
          title: editTitle,
          game_data: editData,
        })
        .eq("id", editingGameId);
      if (error) throw error;
      toast({ title: "Jeu modifié !" });
      setEditingGameId(null);
      onRefresh();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          Mini-Jeux ({games.length})
        </h3>
        <Button size="sm" onClick={() => { setAdding(true); setNewData({}); setNewType("mcq"); }} className="gap-1 font-body">
          <Plus className="w-4 h-4" /> Ajouter un jeu
        </Button>
      </div>

      {games.map((game) => (
        <div key={game.id} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="font-body text-sm font-semibold text-foreground">
              {GAME_TYPES.find((t) => t.value === game.game_type)?.label || game.game_type}
            </span>
            {game.title && <span className="text-xs text-muted-foreground">— {game.title}</span>}
            {game.game_data?.videoSegment?.enabled && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                Extrait vidéo
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => startEditing(game)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => handleDelete(game.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}

      {editingGameId && (
        <div className="p-5 rounded-xl border-2 border-primary/30 bg-primary/5 space-y-4">
          <h4 className="font-display text-base font-semibold text-foreground">Modifier le jeu</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-body text-sm">Type de jeu</Label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body"
              >
                {GAME_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="font-body text-sm">Titre (optionnel)</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Ex: Quiz vocabulaire" />
            </div>
          </div>

          <div className="border-t border-border/50 pt-4">
            {renderEditor(editType, editData, setEditData)}
            <VideoSegmentEditor data={editData} onChange={setEditData} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleUpdate} disabled={saving} className="gap-1 font-body">
              <Save className="w-4 h-4" /> {saving ? "Enregistrement..." : "Mettre à jour"}
            </Button>
            <Button variant="outline" onClick={() => setEditingGameId(null)} className="font-body">Annuler</Button>
          </div>
        </div>
      )}

      {adding && (
        <div className="p-5 rounded-xl border-2 border-primary/30 bg-primary/5 space-y-4">
          <h4 className="font-display text-base font-semibold text-foreground">Nouveau jeu</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-body text-sm">Type de jeu</Label>
              <select
                value={newType}
                onChange={(e) => { setNewType(e.target.value); setNewData({}); }}
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

          <div className="border-t border-border/50 pt-4">
            {renderEditor(newType, newData, setNewData)}
            <VideoSegmentEditor data={newData} onChange={setNewData} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleAdd} disabled={saving} className="gap-1 font-body">
              <Save className="w-4 h-4" /> {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button variant="outline" onClick={() => setAdding(false)} className="font-body">Annuler</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameEditorVisual;
