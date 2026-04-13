import { useState, useRef, useEffect } from "react";
import { Star, User, History, Trophy, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AnimatePresence, motion } from "framer-motion";

interface ProfileMenuProps {
  onNavigate?: (view: "history" | "leaderboard") => void;
}

const ProfileMenu = ({ onNavigate }: ProfileMenuProps) => {
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [totalStars, setTotalStars] = useState(0);
  const [displayStars, setDisplayStars] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const loadStars = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("student_progress")
      .select("stars")
      .eq("user_id", user.id);
    setTotalStars((data || []).reduce((s, r) => s + (r.stars || 0), 0));
  };

  useEffect(() => {
    loadStars();
  }, [user]);

  // Smooth counting animation
  useEffect(() => {
    if (displayStars === totalStars) return;
    const diff = totalStars - displayStars;
    const step = diff > 0 ? 1 : -1;
    const delay = Math.max(30, 200 / Math.abs(diff));
    const timer = setTimeout(() => {
      setDisplayStars((prev) => prev + step);
    }, delay);
    return () => clearTimeout(timer);
  }, [displayStars, totalStars]);

  // Expose refreshStars globally for game completion modal
  useEffect(() => {
    (window as any).__refreshStars = loadStars;
    return () => { delete (window as any).__refreshStars; };
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center gap-1.5 rounded-full border-2 border-amber-400/80 bg-black/50 px-3 py-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.45)] backdrop-blur-md"
        title="Étoiles collectées"
      >
        <Star className="h-5 w-5 shrink-0 fill-amber-400 text-amber-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
        <motion.span
          key={displayStars}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="min-w-[1.5ch] text-center font-body text-lg font-extrabold tabular-nums tracking-tight text-amber-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        >
          {displayStars}
        </motion.span>
      </div>

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center hover:bg-primary/30 transition-colors"
        >
          <User className="w-5 h-5 text-primary" />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-56 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl overflow-hidden z-50"
            >
              <div className="px-4 py-3 border-b border-border/30">
                <p className="text-sm font-bold font-body text-foreground">{user.display_name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              <div className="py-1">
                {isAdmin && (
                  <button
                    onClick={() => { setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    Tableau de bord
                  </button>
                )}
                <button
                  onClick={() => { onNavigate?.("history"); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-foreground hover:bg-muted/50 transition-colors"
                >
                  <History className="w-4 h-4 text-muted-foreground" />
                  Historique
                </button>
                <button
                  onClick={() => { onNavigate?.("leaderboard"); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  Classement
                </button>
              </div>

              <div className="border-t border-border/30 py-1">
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-body text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileMenu;
