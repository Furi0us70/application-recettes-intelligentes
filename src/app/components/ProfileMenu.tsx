import { useState } from "react";
import { User, LogOut, X, ChevronRight, Heart, Settings } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface ProfileMenuProps {
  user: SupabaseUser;
  favoritesCount: number;
  onClose: () => void;
  onSignOut: () => void;
}

export function ProfileMenu({ user, favoritesCount, onClose, onSignOut }: ProfileMenuProps) {
  const [loading, setLoading] = useState(false);

  const avatar = user.user_metadata?.avatar_url;
  const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;
  const email = user.email ?? "";
  const provider = user.app_metadata?.provider ?? "email";

  const providerLabel: Record<string, string> = {
    google: "Google",
    apple: "Apple",
    github: "GitHub",
    facebook: "Facebook",
    email: "E-mail",
  };

  async function handleSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    onSignOut();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(44,26,14,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl flex flex-col"
        style={{ background: "var(--background)", maxHeight: "80vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="rounded-full" style={{ width: 36, height: 4, background: "var(--border)" }} />
        </div>

        <div className="px-5 pt-3 pb-7 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 style={{ fontFamily: "'Lora', Georgia, serif" }}>Mon profil</h3>
            <button onClick={onClose} className="rounded-full p-1.5" style={{ background: "var(--muted)" }}>
              <X size={16} color="var(--muted-foreground)" />
            </button>
          </div>

          {/* User card */}
          <div
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={name ?? email}
                className="rounded-full object-cover flex-shrink-0"
                style={{ width: 56, height: 56 }}
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center flex-shrink-0"
                style={{ width: 56, height: 56, background: "var(--primary)" }}
              >
                <User size={26} color="#fff" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {name && (
                <p style={{ fontWeight: 600, fontSize: "1rem" }} className="truncate">{name}</p>
              )}
              <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)" }} className="truncate">{email}</p>
              <span
                className="inline-block mt-1 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(196,98,58,0.12)", color: "var(--primary)", fontSize: "0.68rem", fontWeight: 600 }}
              >
                via {providerLabel[provider] ?? provider}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="flex flex-col items-center justify-center py-4 rounded-2xl"
              style={{ background: "rgba(196,98,58,0.08)", border: "1px solid rgba(196,98,58,0.15)" }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Heart size={16} color="var(--primary)" fill="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: "1.4rem", color: "var(--primary)" }}>{favoritesCount}</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Favoris</span>
            </div>
            <div
              className="flex flex-col items-center justify-center py-4 rounded-2xl"
              style={{ background: "rgba(107,143,107,0.08)", border: "1px solid rgba(107,143,107,0.15)" }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Settings size={16} color="var(--accent)" />
                <span style={{ fontWeight: 700, fontSize: "1.4rem", color: "var(--accent)" }}>∞</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Recettes IA</span>
            </div>
          </div>

          {/* Actions */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-4 transition-all"
              style={{ background: "var(--card)", borderBottom: "none" }}
            >
              <div className="rounded-xl flex items-center justify-center" style={{ width: 36, height: 36, background: "rgba(212,24,61,0.1)" }}>
                <LogOut size={18} color="#D4183D" />
              </div>
              <span style={{ flex: 1, textAlign: "left", color: "#D4183D", fontWeight: 500 }}>
                {loading ? "Déconnexion…" : "Se déconnecter"}
              </span>
              <ChevronRight size={16} color="var(--muted-foreground)" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
