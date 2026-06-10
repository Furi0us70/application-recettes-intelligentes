import { Clock, Heart, Share2, ChevronRight, Flame, Snowflake } from "lucide-react";
import { Recipe, FILTER_LABELS } from "./data";

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onShare: (recipe: Recipe) => void;
  onOpen: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, isFavorite, onToggleFavorite, onShare, onOpen }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "0 2px 12px rgba(44,26,14,0.06)",
      }}
    >
      {/* Image */}
      <div className="relative" style={{ height: 160 }}>
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        {/* Temp badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1 rounded-full px-2 py-1"
          style={{
            background: recipe.tags.includes("chaud") ? "rgba(196,98,58,0.9)" : "rgba(100,160,200,0.9)",
            color: "#fff",
            fontSize: "0.72rem",
            fontWeight: 600,
          }}
        >
          {recipe.tags.includes("chaud") ? <Flame size={11} /> : <Snowflake size={11} />}
          {recipe.tags.includes("chaud") ? "Chaud" : "Froid"}
        </div>
        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => onShare(recipe)}
            className="rounded-full flex items-center justify-center transition-all"
            style={{ width: 34, height: 34, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}
          >
            <Share2 size={15} color="#2C1A0E" />
          </button>
          <button
            onClick={() => onToggleFavorite(recipe.id)}
            className="rounded-full flex items-center justify-center transition-all"
            style={{ width: 34, height: 34, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}
          >
            <Heart
              size={15}
              color={isFavorite ? "#C4623A" : "#2C1A0E"}
              fill={isFavorite ? "#C4623A" : "none"}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "1.05rem" }}>{recipe.title}</h3>
          <p className="text-muted-foreground mt-1" style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
            {recipe.description}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Clock size={13} color="var(--muted-foreground)" />
              <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                {totalTime} min
              </span>
            </div>
            <span
              className="px-2 py-0.5 rounded-full capitalize"
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                background: recipe.difficulty === "facile" ? "rgba(107,143,107,0.15)" : recipe.difficulty === "moyen" ? "rgba(212,165,116,0.2)" : "rgba(196,98,58,0.15)",
                color: recipe.difficulty === "facile" ? "#2C4A2C" : recipe.difficulty === "moyen" ? "#7A4A10" : "#7A2010",
              }}
            >
              {recipe.difficulty}
            </span>
          </div>
          <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
            {recipe.calories} kcal
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.filter(t => t !== "chaud" && t !== "froid").map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full"
              style={{
                fontSize: "0.68rem",
                fontWeight: 500,
                background: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
            >
              {FILTER_LABELS[tag]}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => onOpen(recipe)}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 transition-all"
          style={{ background: "var(--primary)", color: "#fff" }}
        >
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Voir la recette</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
