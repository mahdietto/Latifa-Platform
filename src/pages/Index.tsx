import { useState, useMemo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import FableCard from "@/components/FableCard";
import { useFables } from "@/data/fables";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentProgress } from "@/hooks/use-student-progress";
import { CheckCircle2, Search, Star, Plus, X, ChevronDown } from "lucide-react";
import FableFormModal from "@/components/FableFormModal";
import HistoryView from "@/components/HistoryView";
import LeaderboardView from "@/components/LeaderboardView";
import { buildThemeOptions, normalizeThemeValue } from "@/data/themes";
import { Button } from "@/components/ui/button";
import { buildOriginOptions, getCustomOrigins, getFableOriginMap, getHiddenOrigins, normalizeOriginValue, setCustomOrigins, setHiddenOrigins } from "@/data/origins";

type SubView = "library" | "history" | "leaderboard";

type DropdownOption = { value: string; label: string };

function useOutsideClose(ref: React.RefObject<HTMLElement>, onClose: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, [enabled, onClose, ref]);
}

const Index = () => {
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string>("");
  const [selectedOrigin, setSelectedOrigin] = useState<string>("");
  const [newTheme, setNewTheme] = useState("");
  const [customThemes, setCustomThemes] = useState<string[]>([]);
  const [hiddenThemes, setHiddenThemes] = useState<string[]>([]);
  const [newOrigin, setNewOrigin] = useState("");
  const [customOrigins, setCustomOriginsState] = useState<string[]>([]);
  const [hiddenOrigins, setHiddenOriginsState] = useState<string[]>([]);
  const [fableOrigins, setFableOrigins] = useState<Record<string, string>>({});
  const [subView, setSubView] = useState<SubView>("library");
  const { fables, refetch } = useFables();
  const { user, isAdmin } = useAuth();
  const { allProgress } = useStudentProgress();
  const [themeOpen, setThemeOpen] = useState(false);
  const [originOpen, setOriginOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const originRef = useRef<HTMLDivElement>(null);

  // #region agent log
  const __dbg = (hypothesisId: string, message: string, data: Record<string, unknown>) => {
    fetch('http://127.0.0.1:7421/ingest/c6053bea-9487-4841-81bf-5bdbee3fc35f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'949dc9'},body:JSON.stringify({sessionId:'949dc9',runId:'pre-fix',hypothesisId,location:'src/pages/Index.tsx',message,data,timestamp:Date.now()})}).catch(()=>{});
  };
  const __measureLayout = () => {
    const de = document.documentElement;
    const body = document.body;
    const sel = window.getSelection?.();
    return {
      innerWidth: window.innerWidth,
      clientWidth: de.clientWidth,
      scrollbarWidth: window.innerWidth - de.clientWidth,
      scrollY: window.scrollY,
      bodyOverflow: getComputedStyle(body).overflow,
      bodyPaddingRight: getComputedStyle(body).paddingRight,
      htmlOverflow: getComputedStyle(de).overflow,
      selectionLen: sel?.toString?.().length ?? 0,
      activeTag: (document.activeElement as HTMLElement | null)?.tagName ?? null,
    };
  };
  // #endregion agent log

  // Close dropdowns on outside interaction
  useOutsideClose(themeRef, () => setThemeOpen(false), themeOpen);
  useOutsideClose(originRef, () => setOriginOpen(false), originOpen);

  useEffect(() => {
    const stored = localStorage.getItem("custom_fable_themes");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setCustomThemes(parsed);
      } catch {
        // ignore malformed local data
      }
    }
    const hiddenStored = localStorage.getItem("hidden_fable_themes");
    if (hiddenStored) {
      try {
        const parsed = JSON.parse(hiddenStored);
        if (Array.isArray(parsed)) setHiddenThemes(parsed);
      } catch {
        // ignore malformed local data
      }
    }
  }, []);

  useEffect(() => {
    setCustomOriginsState(getCustomOrigins());
    setHiddenOriginsState(getHiddenOrigins());
    setFableOrigins(getFableOriginMap());
    const reloadOrigins = () => setFableOrigins(getFableOriginMap());
    window.addEventListener("fable-origins-updated", reloadOrigins);
    return () => window.removeEventListener("fable-origins-updated", reloadOrigins);
  }, []);

  useEffect(() => {
    localStorage.setItem("custom_fable_themes", JSON.stringify(customThemes));
  }, [customThemes]);

  useEffect(() => {
    localStorage.setItem("hidden_fable_themes", JSON.stringify(hiddenThemes));
  }, [hiddenThemes]);

  useEffect(() => {
    setCustomOrigins(customOrigins);
  }, [customOrigins]);

  useEffect(() => {
    setHiddenOrigins(hiddenOrigins);
  }, [hiddenOrigins]);

  const completedFableIds = new Set(
    allProgress.filter((p) => p.completed).map((p) => p.fable_id)
  );

  const filteredFables = useMemo(() => {
    let result = fables;
    if (selectedTheme) result = result.filter((f) => f.theme === selectedTheme);
    if (selectedOrigin) result = result.filter((f) => fableOrigins[f.id] === selectedOrigin);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.teaser.toLowerCase().includes(q) ||
          f.moral.toLowerCase().includes(q)
      );
    }
    return result;
  }, [fables, searchQuery, selectedTheme, selectedOrigin, fableOrigins]);

  const themeOptions = useMemo(
    () => buildThemeOptions([...fables.map((f) => f.theme), ...customThemes]),
    [fables, customThemes]
  );

  const visibleThemeOptions = useMemo(
    () => themeOptions.filter((t) => !hiddenThemes.includes(t.value)),
    [themeOptions, hiddenThemes]
  );

  const originOptions = useMemo(
    () => buildOriginOptions(Object.values(fableOrigins), customOrigins, hiddenOrigins),
    [fableOrigins, customOrigins, hiddenOrigins]
  );

  return (
    <div className="min-h-screen pt-20">
      <Header onNavigate={(view) => setSubView(view)} />

      <AnimatePresence mode="wait">
        {subView === "history" ? (
          <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HistoryView onBack={() => setSubView("library")} />
          </motion.div>
        ) : subView === "leaderboard" ? (
          <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LeaderboardView onBack={() => setSubView("library")} />
          </motion.div>
        ) : (
          <motion.main
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3 drop-shadow-md">
                Découvre les Fables
              </h2>
              <p className="text-white/95 font-body max-w-xl mx-auto drop-shadow leading-relaxed">
                Plonge dans les classiques de Jean de La Fontaine, découvre leurs morales et amuse-toi avec des mini-jeux.
              </p>
            </motion.div>

            {isAdmin && (
              <div className="flex justify-end mb-4">
                <Button onClick={() => setAddOpen(true)} className="gap-2 font-body font-semibold">
                  <Plus className="w-4 h-4" />
                  Ajouter une fable
                </Button>
              </div>
            )}

            <div className="max-w-5xl mx-auto mb-8 relative z-30">
              <div className="flex flex-col md:flex-row md:items-stretch rounded-[2rem] border border-border/55 bg-card/82 backdrop-blur-md shadow-sm ring-1 ring-black/[0.04]">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher une fable..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && filteredFables.length > 0) {
                        e.preventDefault();
                        navigate(user ? `/fable/${filteredFables[0].id}` : "/auth");
                      }
                    }}
                    className="h-12 w-full border-0 bg-transparent py-3 pl-12 pr-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/25 md:h-14"
                  />
                </div>

                <div className="h-px bg-border/50 md:h-auto md:w-px" />

                <div ref={themeRef} className="relative p-2 md:p-0 md:w-[13.5rem]">
                  <button
                    type="button"
                    className="flex h-12 w-full items-center justify-between rounded-xl border-0 bg-transparent px-3 font-body text-sm font-semibold text-foreground outline-none select-none focus:outline-none md:h-14"
                    onPointerDown={() => {
                      window.getSelection?.()?.removeAllRanges?.();
                      // #region agent log
                      __dbg("H2_selection", "theme:onPointerDown", __measureLayout());
                      // #endregion agent log
                    }}
                    onClick={() => {
                      const next = !themeOpen;
                      setThemeOpen(next);
                      // #region agent log
                      __dbg("H1_scroll_lock", "theme:toggle", { open: next, ...__measureLayout() });
                      // #endregion agent log
                    }}
                  >
                    <span className="truncate">
                      {selectedTheme
                        ? (visibleThemeOptions.find((t) => t.value === selectedTheme)?.label ?? "Tous les thèmes")
                        : "Tous les thèmes"}
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 opacity-70 transition-transform ${themeOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {themeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-[calc(100%+8px)] z-[80] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/55 bg-card/82 text-foreground shadow-[0_18px_60px_-18px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] backdrop-blur-[96px] backdrop-saturate-200 backdrop-brightness-75"
                      >
                        <div className="max-h-72 overflow-auto p-1">
                          {([{ value: "", label: "Tous les thèmes" }, ...visibleThemeOptions] as DropdownOption[]).map((opt) => (
                            <button
                              key={opt.value || "__all__"}
                              type="button"
                              className={`w-full rounded-xl px-3 py-2 text-left text-sm font-body font-semibold transition-colors hover:bg-muted/50 ${
                                (opt.value === "" ? selectedTheme === "" : selectedTheme === opt.value) ? "bg-muted/50" : ""
                              }`}
                              onClick={() => {
                                setSelectedTheme(opt.value);
                                setThemeOpen(false);
                                // #region agent log
                                __dbg("H1_scroll_lock", "theme:select", { value: opt.value, ...__measureLayout() });
                                // #endregion agent log
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-px bg-border/50 md:h-auto md:w-px" />

                <div ref={originRef} className="relative p-2 pt-0 md:p-0 md:w-[14.5rem]">
                  <button
                    type="button"
                    className="flex h-12 w-full items-center justify-between rounded-xl border-0 bg-transparent px-3 font-body text-sm font-semibold text-foreground outline-none select-none focus:outline-none md:h-14"
                    onPointerDown={() => {
                      window.getSelection?.()?.removeAllRanges?.();
                      // #region agent log
                      __dbg("H2_selection", "origin:onPointerDown", __measureLayout());
                      // #endregion agent log
                    }}
                    onClick={() => {
                      const next = !originOpen;
                      setOriginOpen(next);
                      // #region agent log
                      __dbg("H1_scroll_lock", "origin:toggle", { open: next, ...__measureLayout() });
                      // #endregion agent log
                    }}
                  >
                    <span className="truncate">
                      {selectedOrigin
                        ? (originOptions.find((o) => o.value === selectedOrigin)?.label ?? "Toutes les origines")
                        : "Toutes les origines"}
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 opacity-70 transition-transform ${originOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {originOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-[calc(100%+8px)] z-[80] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/55 bg-card/82 text-foreground shadow-[0_18px_60px_-18px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06] backdrop-blur-[96px] backdrop-saturate-200 backdrop-brightness-75"
                      >
                        <div className="max-h-72 overflow-auto p-1">
                          {([{ value: "", label: "Toutes les origines" }, ...originOptions] as DropdownOption[]).map((opt) => (
                            <button
                              key={opt.value || "__all__"}
                              type="button"
                              className={`w-full rounded-xl px-3 py-2 text-left text-sm font-body font-semibold transition-colors hover:bg-muted/50 ${
                                (opt.value === "" ? selectedOrigin === "" : selectedOrigin === opt.value) ? "bg-muted/50" : ""
                              }`}
                              onClick={() => {
                                setSelectedOrigin(opt.value);
                                setOriginOpen(false);
                                // #region agent log
                                __dbg("H1_scroll_lock", "origin:select", { value: opt.value, ...__measureLayout() });
                                // #endregion agent log
                              }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="max-w-4xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border border-border bg-card/70 space-y-2">
                  <p className="text-sm font-body font-semibold text-foreground">Gérer les thèmes</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTheme}
                      onChange={(e) => setNewTheme(e.target.value)}
                      placeholder="Nouveau thème"
                      className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body"
                    />
                    <Button type="button" variant="outline" onClick={() => {
                      const value = normalizeThemeValue(newTheme);
                      if (!value) return;
                      if (!themeOptions.some((t) => t.value === value)) setCustomThemes((prev) => [...prev, value]);
                      setHiddenThemes((prev) => prev.filter((v) => v !== value));
                      setSelectedTheme(value);
                      setNewTheme("");
                    }}>
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {themeOptions.map((t) => (
                      <span key={t.value} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted/70">
                        {t.label}
                        <button type="button" onClick={() => {
                          setHiddenThemes((prev) => (prev.includes(t.value) ? prev : [...prev, t.value]));
                          if (selectedTheme === t.value) setSelectedTheme("");
                        }}>
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card/70 space-y-2">
                  <p className="text-sm font-body font-semibold text-foreground">Gérer les origines</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOrigin}
                      onChange={(e) => setNewOrigin(e.target.value)}
                      placeholder="Nouvelle origine"
                      className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body"
                    />
                    <Button type="button" variant="outline" onClick={() => {
                      const value = normalizeOriginValue(newOrigin);
                      if (!value) return;
                      if (!originOptions.some((o) => o.value === value)) setCustomOriginsState((prev) => [...prev, value]);
                      setHiddenOriginsState((prev) => prev.filter((v) => v !== value));
                      setSelectedOrigin(value);
                      setNewOrigin("");
                    }}>
                      Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {originOptions.map((o) => (
                      <span key={o.value} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-muted/70">
                        {o.label}
                        <button type="button" onClick={() => {
                          setHiddenOriginsState((prev) => (prev.includes(o.value) ? prev : [...prev, o.value]));
                          setCustomOriginsState((prev) => prev.filter((v) => v !== o.value));
                          if (selectedOrigin === o.value) setSelectedOrigin("");
                        }}>
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFables.map((fable, index) => {
                const isCompleted = user && completedFableIds.has(fable.id);
                const progressItem = allProgress.find((p) => p.fable_id === fable.id);
                const stars = progressItem?.stars || 0;
                return (
                  <div key={fable.id} className="relative">
                    {isCompleted && (
                      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg border border-border/30">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: stars }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-accent fill-accent" />
                          ))}
                        </div>
                      </div>
                    )}
                    <FableCard
                      fable={fable}
                      index={index}
                      onClick={() => navigate(user ? `/fable/${fable.id}` : "/auth")}
                      onRefresh={refetch}
                    />
                  </div>
                );
              })}
            </div>

            {filteredFables.length === 0 && (
              <p className="text-center text-muted-foreground font-body mt-8">Aucune fable trouvée.</p>
            )}
          </motion.main>
        )}
      </AnimatePresence>

      {addOpen && (
        <FableFormModal onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); refetch(); }} />
      )}
    </div>
  );
};

export default Index;
