import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import { NavOverlayProvider } from "@/contexts/NavOverlayContext";
import Index from "./pages/Index.tsx";
import Landing from "./pages/Landing.tsx";
import Auth from "./pages/Auth.tsx";
import Games from "./pages/Games.tsx";
import Fabulistes from "./pages/Fabulistes.tsx";
import NotFound from "./pages/NotFound.tsx";
import Admin from "./pages/Admin.tsx";
import FablePage from "./pages/Fable.tsx";
import AppVideoBackground from "@/components/AppVideoBackground";

const queryClient = new QueryClient();

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppVideoBackground />
      <div className="relative z-10 min-h-screen">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <NavOverlayProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/library" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/jeux" element={<RequireAuth><Games /></RequireAuth>} />
              <Route path="/fabulistes" element={<RequireAuth><Fabulistes /></RequireAuth>} />
              <Route path="/fable/:id" element={<RequireAuth><FablePage /></RequireAuth>} />
              <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </NavOverlayProvider>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
