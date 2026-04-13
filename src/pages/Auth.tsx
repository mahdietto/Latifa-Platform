import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, LogIn, UserPlus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    console.log("Auth submit:", { isLogin, email });
    try {
      if (isLogin) {
        await login(email, password);
        toast({ title: "Bienvenue !", description: "Connexion réussie." });
        navigate("/library");
      } else {
        if (!displayName.trim()) {
          toast({ title: "Erreur", description: "Veuillez entrer un prénom ou pseudo.", variant: "destructive" });
          setLoading(false);
          return;
        }
        await register(email, password, displayName);
        toast({ title: "Inscription réussie !", description: "Vérifiez votre email pour confirmer votre compte." });
        navigate("/library");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({ title: "Erreur", description: error.message || "Une erreur est survenue.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 gap-2 font-body">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        <div className="bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 p-8 fable-card-shadow">
          <div className="flex items-center justify-center gap-2 mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">
              Latifa <span className="text-gradient-primary">Platform</span>
            </h1>
          </div>

          <h2 className="font-display text-xl font-semibold text-foreground text-center mb-6">
            {isLogin ? "Connexion" : "Inscription"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="font-body">Prénom / Pseudo</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ton prénom ou pseudo" required={!isLogin} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton.email@exemple.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-body">Mot de passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" className="w-full gap-2 font-body font-semibold" disabled={loading}>
              {isLogin ? (
                <><LogIn className="w-4 h-4" />{loading ? "Connexion..." : "Se connecter"}</>
              ) : (
                <><UserPlus className="w-4 h-4" />{loading ? "Inscription..." : "S'inscrire"}</>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4 font-body">
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button onClick={() => setIsLogin(!isLogin)} className="ml-1 text-primary hover:underline font-semibold">
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
