import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFables } from "@/data/fables";
import FableDetail from "@/components/FableDetail";
import { Button } from "@/components/ui/button";

const FablePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fables, loading } = useFables();

  const selectedFable = useMemo(
    () => fables.find((f) => f.id === id) || null,
    [fables, id]
  );

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-12 animate-pulse">
          <div className="h-10 w-44 rounded-lg bg-muted mb-6" />
          <div className="mb-8 rounded-lg border border-border overflow-hidden">
            <div className="aspect-video bg-muted" />
          </div>
          <div className="h-12 w-3/4 bg-muted rounded mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-4/5 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!selectedFable) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-foreground font-body">Fable introuvable.</p>
          <Button onClick={() => navigate("/library")}>Retour aux fables</Button>
        </div>
      </div>
    );
  }

  return <FableDetail fable={selectedFable} onBack={() => navigate("/library")} />;
};

export default FablePage;
