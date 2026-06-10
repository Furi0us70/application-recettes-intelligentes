import { X, Clock, ChefHat, Timer, Heart, Share2, Flame, Snowflake } from "lucide-react";
import { Recipe } from "./data";

interface RecipeModalProps {
  recipe: Recipe;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onShare: (recipe: Recipe) => void;
  onStartTimer: (minutes: number) => void;
}

export function RecipeModal({ recipe, isFavorite, onClose, onToggleFavorite, onShare, onStartTimer }: RecipeModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--background)" }}
    >
      {/* Hero image */}
      <div className="relative flex-shrink-0" style={{ height: 240 }}>
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(44,26,14,0.7) 100%)" }}
        />
        <button
          onClick={onClose}
          className="absolute top-4 left-4 rounded-full flex items-center justify-center"
          style={{ width: 38, height: 38, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}
        >
          <X size={18} color="#2C1A0E" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => onShare(recipe)}
            className="rounded-full flex items-center justify-center"
            style={{ width: 38, height: 38, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}
          >
            <Share2 size={16} color="#2C1A0E" />
          </button>
          <button
            onClick={() => onToggleFavorite(recipe.id)}
            className="rounded-full flex items-center justify-center"
            style={{ width: 38, height: 38, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)" }}
          >
            <Heart size={16} color={isFavorite ? "#C4623A" : "#2C1A0E"} fill={isFavorite ? "#C4623A" : "none"} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="font-display text-white" style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "1.4rem" }}>
            {recipe.title}
          </h2>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8 flex flex-col gap-5">
        {/* Stats */}
        <div
          className="grid grid-cols-3 rounded-2xl p-4 gap-2"
          style={{ background: "var(--muted)" }}
        >
          {[
            { icon: <Clock size={18} color="var(--primary)" />, label: "Préparation", value: `${recipe.prepTime} min` },
            { icon: recipe.tags.includes("chaud") ? <Flame size={18} color="var(--primary)" /> : <Snowflake size={18} color="#64a0c8" />, label: "Cuisson", value: recipe.cookTime ? `${recipe.cookTime} min` : "Aucune" },
            { icon: <ChefHat size={18} color="var(--primary)" />, label: "Difficulté", value: recipe.difficulty },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              {icon}
              <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", textTransform: "capitalize" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        <div>
          <h3 style={{ fontFamily: "'Lora', Georgia, serif", marginBottom: "0.75rem" }}>Ingrédients</h3>
          <div className="flex flex-col gap-2">
            {recipe.ingredients.map((ing, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <div
                  className="rounded-full flex-shrink-0"
                  style={{ width: 8, height: 8, background: "var(--primary)" }}
                />
                <span style={{ fontSize: "0.9rem" }}>{ing}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <h3 style={{ fontFamily: "'Lora', Georgia, serif", marginBottom: "0.75rem" }}>Préparation</h3>
          <div className="flex flex-col gap-3">
            {recipe.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="flex-shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: 28,
                    height: 28,
                    background: "var(--primary)",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    marginTop: 2,
                  }}
                >
                  {i + 1}
                </div>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.6, paddingTop: "0.25rem" }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timer CTA */}
      {recipe.cookTime > 0 && (
        <div
          className="px-4 pb-6 pt-3 flex-shrink-0"
          style={{ borderTop: "1px solid var(--border)", background: "var(--background)" }}
        >
          <button
            onClick={() => { onStartTimer(recipe.cookTime); onClose(); }}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 transition-all"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            <Timer size={20} />
            <span style={{ fontWeight: 600 }}>Lancer le timer ({recipe.cookTime} min)</span>
          </button>
        </div>
      )}
    </div>
  );
}
