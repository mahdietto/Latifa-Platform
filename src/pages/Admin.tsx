import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, BookOpen, Wifi, Gamepad2, Shield, ShieldOff,
  Search, ArrowLeft, Crown, User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserInfo {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "admin" | "user";
}

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [studentCount, setStudentCount] = useState(0);
  const [fableCount, setFableCount] = useState(0);
  const [gameCount, setGameCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [togglingRole, setTogglingRole] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/library");
  }, [authLoading, isAdmin, navigate]);

  // Load stats
  useEffect(() => {
    const load = async () => {
      const [fables, students, games] = await Promise.all([
        supabase.from("fables").select("*", { count: "exact", head: true }),
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "user"),
        supabase.from("fable_games").select("*", { count: "exact", head: true }),
      ]);
      setFableCount(fables.count || 0);
      setStudentCount(students.count || 0);
      setGameCount(games.count || 0);
    };
    load();
  }, []);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url");
      const { data: roles } = await supabase.from("user_roles").select("user_id, role");
      if (profiles) {
        const roleMap = new Map((roles || []).map((r) => [r.user_id, r.role]));
        const mapped: UserInfo[] = profiles.map((p) => ({
          user_id: p.user_id,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          role: (roleMap.get(p.user_id) as "admin" | "user") || "user",
        }));
        // Sort admins first
        mapped.sort((a, b) => (a.role === "admin" ? -1 : 1) - (b.role === "admin" ? -1 : 1));
        setUsers(mapped);
      }
      setLoadingUsers(false);
    };
    loadUsers();
  }, []);

  // Presence
  useEffect(() => {
    const channel = supabase.channel("admin-online-users", {
      config: { presence: { key: "user" } },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        setOnlineCount(Object.keys(channel.presenceState()).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await channel.track({ user_id: session.user.id, online_at: new Date().toISOString() });
          }
        }
      });
    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleRole = async (userId: string, currentRole: "admin" | "user") => {
    setTogglingRole(userId);
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);
      if (error) throw error;
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole as "admin" | "user" } : u))
      );
      toast({ title: newRole === "admin" ? "Promu administrateur !" : "Rétrogradé en utilisateur" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setTogglingRole(null);
    }
  };

  const filteredUsers = users.filter((u) =>
    !userSearch.trim() || (u.display_name || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  if (authLoading) return null;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen pt-20">
      <Header />

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/library")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
              <Crown className="w-8 h-8 text-primary" />
              Tableau de bord Admin
            </h1>
            <p className="text-muted-foreground font-body text-sm mt-1">
              Gérer les utilisateurs, fables et jeux
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={Users} label="Étudiants inscrits" value={studentCount} color="text-primary" bgColor="bg-primary/10" />
          <StatCard icon={Wifi} label="En ligne" value={onlineCount} color="text-emerald-500" bgColor="bg-emerald-500/10" />
          <StatCard icon={BookOpen} label="Fables" value={fableCount} color="text-accent" bgColor="bg-accent/10" />
          <StatCard icon={Gamepad2} label="Mini-jeux" value={gameCount} color="text-primary" bgColor="bg-primary/10" />
        </div>

        {/* Users Management */}
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-5 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Gestion des utilisateurs ({users.length})
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body">Utilisateur</TableHead>
                  <TableHead className="font-body">Rôle</TableHead>
                  <TableHead className="font-body text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingUsers ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground font-body py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground font-body py-8">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {(u.display_name || "?")[0].toUpperCase()}
                          </div>
                          <span className="font-body font-medium text-foreground">
                            {u.display_name || "Sans nom"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-body font-semibold">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-body font-semibold">
                            <User className="w-3 h-3" /> Étudiant
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={u.role === "admin" ? "outline" : "default"}
                          disabled={togglingRole === u.user_id}
                          onClick={() => toggleRole(u.user_id, u.role)}
                          className="gap-1.5 font-body text-xs"
                        >
                          {u.role === "admin" ? (
                            <>
                              <ShieldOff className="w-3.5 h-3.5" />
                              Rétrograder
                            </>
                          ) : (
                            <>
                              <Shield className="w-3.5 h-3.5" />
                              Promouvoir Admin
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bgColor }: {
  icon: any; label: string; value: number; color: string; bgColor: string;
}) => (
  <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold font-display text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground font-body">{label}</p>
    </div>
  </div>
);

export default Admin;
