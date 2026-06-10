import { useState, useEffect, useCallback } from "react";
import { SlidersHorizontal, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Recipe, Filter, FILTER_LABELS } from "./data";
import { RecipeCard } from "./RecipeCard";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface RecipesTabProps {
  detectedIngredients: string[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onShare: (recipe: Recipe) => void;
  onOpenRecipe: (recipe: Recipe) => void;
}

const ALL_FILTERS: Filter[] = ["vegan", "rapide", "facile", "sans-gluten", "chaud", "froid"];

export function RecipesTab({ detectedIngredients, favorites, onToggleFavorite, onShare, onOpenRecipe }: RecipesTabProps) {
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastIngredients, setLastIngredients] = useState<string[]>([]);

  const fetchRecipes = useCallback(async (ingredients: string[], filters: Filter[]) => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-871aede6/recipes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ ingredients, filters }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      setRecipes(data.recipes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      detectedIngredients.length > 0 &&
      JSON.stringify(detectedIngredients) !== JSON.stringify(lastIngredients)
    ) {
      setLastIngredients(detectedIngredients);
      fetchRecipes(detectedIngredients, activeFilters);
    }
  }, [detectedIngredients]);

  function toggleFilter(f: Filter) {
    const next = activeFilters.includes(f)
      ? activeFilters.filter(x => x !== f)
      : [...activeFilters, f];
    setActiveFilters(next);
    if (detectedIngredients.length > 0) {
      fetchRecipes(detectedIngredients, next);
    }
  }

  const showEmpty = !loading && !error && recipes.length === 0 && detectedIngredients.length === 0;
  const showNoResult = !loading && !error && recipes.length === 0 && detectedIngredients.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sparkles size={18} color="var(--primary)" />
            <h1 style={{ fontFamily: "'Lora', Georgia, serif" }}>Recettes suggérées</h1>
          </div>
          {detectedIngredients.length > 0 && !loading && (
            <button
              onClick={() => fetchRecipes(detectedIngredients, activeFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
              style={{ background: "var(--muted)", fontSize: "0.75rem", color: "var(--muted-foreground)" }}
            >
              <RefreshCw size={13} />
              Régénérer
            </button>
          )}
        </div>
        {detectedIngredients.length > 0 && (
          <p className="text-muted-foreground" style={{ fontSize: "0.82rem" }}>
            Basé sur : {detectedIngredients.join(", ")}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal size={13} color="var(--muted-foreground)" />
          <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Filtrer
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {ALL_FILTERS.map(f => {
            const active = activeFilters.includes(f);
            return (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: active ? "var(--primary)" : "var(--muted)",
                  color: active ? "#fff" : "var(--muted-foreground)",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  border: active ? "1px solid var(--primary)" : "1px solid transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {FILTER_LABELS[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ scrollbarWidth: "none" }}>
        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div
                className="rounded-full"
                style={{ width: 16, height: 16, background: "var(--primary)", animation: "pulse 1.5s ease-in-out infinite" }}
              />
              <p style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: 500 }}>
                Gemini recherche des recettes…
              </p>
            </div>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  animation: `pulse ${1 + i * 0.2}s ease-in-out infinite`,
                }}
              >
                <div style={{ height: 160, background: "var(--muted)" }} />
                <div className="p-4 flex flex-col gap-3">
                  <div style={{ height: 20, width: "70%", borderRadius: 8, background: "var(--muted)" }} />
                  <div style={{ height: 14, width: "90%", borderRadius: 6, background: "var(--muted)" }} />
                  <div style={{ height: 14, width: "60%", borderRadius: 6, background: "var(--muted)" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-2xl p-5 flex flex-col gap-3 items-center text-center"
            style={{ background: "rgba(196,98,58,0.08)", border: "1px solid rgba(196,98,58,0.2)" }}
          >
            <AlertCircle size={28} color="var(--primary)" />
            <div>
              <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Impossible de charger les recettes</p>
              <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>{error}</p>
            </div>
            <button
              onClick={() => fetchRecipes(detectedIngredients, activeFilters)}
              className="px-5 py-2.5 rounded-xl"
              style={{ background: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: "0.875rem" }}
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Empty — no scan yet */}
        {showEmpty && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div
              className="rounded-3xl flex items-center justify-center"
              style={{ width: 80, height: 80, background: "rgba(196,98,58,0.08)", border: "2px dashed rgba(196,98,58,0.25)" }}
            >
              <Sparkles size={32} color="rgba(196,98,58,0.4)" />
            </div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Aucun ingrédient scanné</p>
              <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                Allez dans l'onglet Scanner pour photographier vos ingrédients.
              </p>
            </div>
          </div>
        )}

        {/* No results after filter */}
        {showNoResult && (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>
              Aucune recette pour ces filtres.
            </p>
            <button
              onClick={() => { setActiveFilters([]); fetchRecipes(detectedIngredients, []); }}
              style={{ color: "var(--primary)", fontSize: "0.875rem", fontWeight: 600 }}
            >
              Effacer les filtres
            </button>
          </div>
        )}

        {/* Recipes */}
        {!loading && !error && recipes.length > 0 && (
          <div className="flex flex-col gap-4">
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
              {recipes.length} recette{recipes.length > 1 ? "s" : ""} générée{recipes.length > 1 ? "s" : ""} par Gemini
            </p>
            {recipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={favorites.includes(recipe.id)}
                onToggleFavorite={onToggleFavorite}
                onShare={onShare}
                onOpen={onOpenRecipe}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </div>
  );
}
