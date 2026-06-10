import { useState, useEffect } from "react";
import { Camera, BookOpen, Heart, Timer, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AuthScreen } from "./components/AuthScreen";
import { ProfileMenu } from "./components/ProfileMenu";
import { ScannerTab } from "./components/ScannerTab";
import { RecipesTab } from "./components/RecipesTab";
import { FavoritesTab } from "./components/FavoritesTab";
import { TimerTab } from "./components/TimerTab";
import { RecipeModal } from "./components/RecipeModal";
import { ShareModal } from "./components/ShareModal";
import { Recipe } from "./components/data";

type Tab = "scanner" | "recettes" | "favoris" | "timer";

const TABS: { id: Tab; label: string; Icon: typeof Camera }[] = [
  { id: "scanner", label: "Scanner", Icon: Camera },
  { id: "recettes", label: "Recettes", Icon: BookOpen },
  { id: "favoris", label: "Favoris", Icon: Heart },
  { id: "timer", label: "Timer", Icon: Timer },
];

export default function App() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("scanner");
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null);
  const [shareRecipe, setShareRecipe] = useState<Recipe | null>(null);
  const [timerMinutes, setTimerMinutes] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleScanComplete(ingredients: string[]) {
    setDetectedIngredients(ingredients);
    setActiveTab("recettes");
  }

  function toggleFavorite(id: string) {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }

  function handleStartTimer(minutes: number) {
    setTimerMinutes(minutes);
    setActiveTab("timer");
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "100dvh", background: "var(--background)" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="rounded-2xl flex items-center justify-center"
            style={{ width: 64, height: 64, background: "rgba(196,98,58,0.1)" }}
          >
            <div
              className="rounded-full"
              style={{ width: 28, height: 28, border: "3px solid var(--primary)", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }}
            />
          </div>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }}>Chargement…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ height: "100dvh", maxWidth: 430, margin: "0 auto", overflowY: "auto", scrollbarWidth: "none" }}>
        <AuthScreen onAuth={() => {}} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div
      className="flex flex-col"
      style={{
        height: "100dvh",
        maxWidth: 430,
        margin: "0 auto",
        background: "var(--background)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-2"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <span style={{ fontFamily: "'Lora', Georgia, serif", fontSize: "1.1rem", fontWeight: 600, color: "var(--primary)" }}>
          FridgeMate
        </span>
        <button
          onClick={() => setShowProfile(true)}
          className="rounded-full overflow-hidden flex items-center justify-center transition-all"
          style={{ width: 36, height: 36, background: avatarUrl ? "transparent" : "var(--primary)", border: "2px solid var(--border)" }}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="profil" className="w-full h-full object-cover" />
          ) : (
            <User size={18} color="#fff" />
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "scanner" && (
          <div className="h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <ScannerTab onScanComplete={handleScanComplete} />
          </div>
        )}
        {activeTab === "recettes" && (
          <RecipesTab
            detectedIngredients={detectedIngredients}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onShare={setShareRecipe}
            onOpenRecipe={setOpenRecipe}
          />
        )}
        {activeTab === "favoris" && (
          <FavoritesTab
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onShare={setShareRecipe}
            onOpenRecipe={setOpenRecipe}
          />
        )}
        {activeTab === "timer" && (
          <TimerTab initialMinutes={timerMinutes} key={timerMinutes} />
        )}
      </div>

      {/* Bottom nav */}
      <nav
        className="flex-shrink-0 flex items-center"
        style={{
          borderTop: "1px solid var(--border)",
          background: "rgba(253,246,238,0.95)",
          backdropFilter: "blur(12px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          paddingTop: "0.5rem",
          paddingLeft: "0.5rem",
          paddingRight: "0.5rem",
        }}
      >
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all"
              style={{
                background: active ? "rgba(196,98,58,0.1)" : "transparent",
              }}
            >
              <Icon
                size={22}
                color={active ? "var(--primary)" : "var(--muted-foreground)"}
                fill={active && id === "favoris" ? "var(--primary)" : "none"}
              />
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "var(--primary)" : "var(--muted-foreground)",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Recipe detail modal */}
      {openRecipe && (
        <RecipeModal
          recipe={openRecipe}
          isFavorite={favorites.includes(openRecipe.id)}
          onClose={() => setOpenRecipe(null)}
          onToggleFavorite={toggleFavorite}
          onShare={setShareRecipe}
          onStartTimer={handleStartTimer}
        />
      )}

      {/* Share bottom sheet */}
      {shareRecipe && (
        <ShareModal recipe={shareRecipe} onClose={() => setShareRecipe(null)} />
      )}

      {/* Profile menu */}
      {showProfile && (
        <ProfileMenu
          user={user}
          favoritesCount={favorites.length}
          onClose={() => setShowProfile(false)}
          onSignOut={() => { setShowProfile(false); setFavorites([]); }}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
