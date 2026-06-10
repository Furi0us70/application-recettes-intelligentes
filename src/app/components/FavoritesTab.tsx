import { Heart } from "lucide-react";
import { Recipe, MOCK_RECIPES } from "./data";
import { RecipeCard } from "./RecipeCard";

interface FavoritesTabProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onShare: (recipe: Recipe) => void;
  onOpenRecipe: (recipe: Recipe) => void;
}

export function FavoritesTab({ favorites, onToggleFavorite, onShare, onOpenRecipe }: FavoritesTabProps) {
  const favoriteRecipes = MOCK_RECIPES.filter(r => favorites.includes(r.id));

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <Heart size={18} color="var(--primary)" fill="var(--primary)" />
          <h1 className="font-display" style={{ fontFamily: "'Lora', Georgia, serif" }}>Mes favoris</h1>
        </div>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "0.82rem" }}>
          {favoriteRecipes.length} recette{favoriteRecipes.length !== 1 ? "s" : ""} sauvegardée{favoriteRecipes.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ scrollbarWidth: "none" }}>
        {favoriteRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div
              className="rounded-3xl flex items-center justify-center"
              style={{ width: 80, height: 80, background: "rgba(196,98,58,0.08)", border: "2px dashed rgba(196,98,58,0.25)" }}
            >
              <Heart size={32} color="rgba(196,98,58,0.4)" />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: "var(--foreground)", marginBottom: "0.25rem" }}>Aucun favori pour l'instant</p>
              <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                Cliquez sur ❤️ dans une recette pour la sauvegarder ici.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {favoriteRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                onShare={onShare}
                onOpen={onOpenRecipe}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
