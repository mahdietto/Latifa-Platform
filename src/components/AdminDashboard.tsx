import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Users, BookOpen, Wifi } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
  const [visible, setVisible] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [fableCount, setFableCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { count: fc } = await supabase.from("fables").select("*", { count: "exact", head: true });
      setFableCount(fc || 0);
      const { count: sc } = await supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "user");
      setStudentCount(sc || 0);
    };
    load();
  }, []);

  // Track online users via Supabase presence
  useEffect(() => {
    const channel = supabase.channel("online-users", {
      config: { presence: { key: "user" } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await channel.track({ user_id: session.user.id, online_at: new Date().toISOString() });
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
      <button
        onClick={() => setVisible(!visible)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-body font-semibold text-sm hover:bg-primary/20 transition-colors"
      >
        {visible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        Tableau de bord Admin
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display text-foreground">{studentCount}</p>
                  <p className="text-sm text-muted-foreground font-body">Étudiants inscrits</p>
                </div>
              </div>

              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display text-foreground">{onlineCount}</p>
                  <p className="text-sm text-muted-foreground font-body">En ligne maintenant</p>
                </div>
              </div>

              <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display text-foreground">{fableCount}</p>
                  <p className="text-sm text-muted-foreground font-body">Fables disponibles</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
