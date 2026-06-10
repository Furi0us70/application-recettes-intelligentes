import { X, Copy, MessageCircle, Mail, Check } from "lucide-react";
import { useState } from "react";
import { Recipe } from "./data";

interface ShareModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export function ShareModal({ recipe, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `🍽️ ${recipe.title}\n⏱️ ${recipe.prepTime + recipe.cookTime} min · ${recipe.difficulty}\n\n${recipe.description}\n\nPartagé depuis FridgeMate 🌿`;

  function handleCopy() {
    navigator.clipboard.writeText(shareText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const channels = [
    {
      label: "WhatsApp",
      icon: <MessageCircle size={20} color="#25D366" />,
      bg: "rgba(37,211,102,0.1)",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank"),
    },
    {
      label: "E-mail",
      icon: <Mail size={20} color="#C4623A" />,
      bg: "rgba(196,98,58,0.1)",
      action: () => window.open(`mailto:?subject=${encodeURIComponent(recipe.title)}&body=${encodeURIComponent(shareText)}`, "_blank"),
    },
    {
      label: copied ? "Copié !" : "Copier",
      icon: copied ? <Check size={20} color="#6B8F6B" /> : <Copy size={20} color="#6B8F6B" />,
      bg: "rgba(107,143,107,0.1)",
      action: handleCopy,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(44,26,14,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-6 flex flex-col gap-5"
        style={{ background: "var(--background)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 style={{ fontFamily: "'Lora', Georgia, serif" }}>Partager la recette</h3>
          <button onClick={onClose} className="rounded-full p-1.5" style={{ background: "var(--muted)" }}>
            <X size={16} color="var(--muted-foreground)" />
          </button>
        </div>

        {/* Preview */}
        <div
          className="rounded-2xl p-4 flex gap-3 items-center"
          style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
        >
          <img
            src={recipe.image}
            alt={recipe.title}
            className="rounded-xl object-cover flex-shrink-0"
            style={{ width: 56, height: 56 }}
          />
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{recipe.title}</p>
            <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>
              {recipe.prepTime + recipe.cookTime} min · {recipe.difficulty}
            </p>
          </div>
        </div>

        {/* Channels */}
        <div className="grid grid-cols-3 gap-3">
          {channels.map(ch => (
            <button
              key={ch.label}
              onClick={ch.action}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl transition-all"
              style={{ background: ch.bg }}
            >
              {ch.icon}
              <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--foreground)" }}>{ch.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl"
          style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
