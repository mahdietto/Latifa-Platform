import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AppUser {
  id: string;
  email: string;
  display_name: string;
  role: "admin" | "user";
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  register: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

async function buildAppUser(authUser: User): Promise<AppUser> {
  const [{ data: profile }, { data: isAdmin }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", authUser.id)
      .maybeSingle(),
    supabase
      .rpc("has_role", { _user_id: authUser.id, _role: "admin" }),
  ]);

  return {
    id: authUser.id,
    email: authUser.email || "",
    display_name: profile?.display_name || authUser.email || "",
    role: isAdmin ? "admin" : "user",
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async (authUser: User | null) => {
    try {
      if (!authUser) {
        setUser(null);
        return;
      }

      const appUser = await buildAppUser(authUser);
      setUser(appUser);
    } catch {
      setUser({
        id: authUser.id,
        email: authUser.email || "",
        display_name: authUser.email || "",
        role: "user",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      queueMicrotask(() => {
        if (mounted) {
          void syncUser(session?.user ?? null);
        }
      });
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        void syncUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    await syncUser(data.user ?? null);
  }, [syncUser]);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin: user?.role === "admin", login, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};