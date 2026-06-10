import { useState } from "react";
import { Mail, Eye, EyeOff, ArrowRight, ChefHat, AlertCircle, Loader } from "lucide-react";
import { supabase } from "../../lib/supabase";

type AuthMode = "login" | "signup" | "magic";

const PROVIDERS = [
  {
    id: "google",
    label: "Continuer avec Google",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    bg: "#fff",
    border: "rgba(0,0,0,0.15)",
    color: "#1a1a1a",
  },
  {
    id: "github",
    label: "Continuer avec GitHub",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
    bg: "#24292e",
    border: "#24292e",
    color: "#fff",
  },
];

interface AuthScreenProps {
  onAuth: () => void;
}

export function AuthScreen({ onAuth }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleOAuth(provider: "google" | "github") {
    setError("");
    setLoading(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    setLoading(null);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading("email");
    try {
      if (mode === "magic") {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setSuccess("Lien de connexion envoyé ! Vérifiez votre boîte mail.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setSuccess("Compte créé ! Vérifiez votre boîte mail pour confirmer.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      setError(
        msg === "Invalid login credentials" ? "Email ou mot de passe incorrect." :
        msg === "User already registered" ? "Un compte existe déjà avec cet email." :
        msg
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="flex flex-col min-h-full"
      style={{ background: "var(--background)" }}
    >
      {/* Top illustration */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-end pb-8 pt-16 px-6"
        style={{
          background: "linear-gradient(160deg, #C4623A 0%, #8B4513 60%, #2C1A0E 100%)",
          minHeight: 220,
        }}
      >
        <div
          className="rounded-2xl flex items-center justify-center mb-4"
          style={{ width: 72, height: 72, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
        >
          <ChefHat size={36} color="#fff" />
        </div>
        <h1 style={{ fontFamily: "'Lora', Georgia, serif", color: "#fff", fontSize: "1.8rem", textAlign: "center" }}>
          FridgeMate
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", marginTop: "0.25rem", textAlign: "center" }}>
          Zéro gaspillage, 100% saveurs
        </p>
      </div>

      {/* Auth card */}
      <div className="flex-1 px-5 py-6 flex flex-col gap-5">
        {/* Mode toggle */}
        <div
          className="flex rounded-2xl p-1"
          style={{ background: "var(--muted)" }}
        >
          {(["login", "signup"] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setSuccess(""); }}
              className="flex-1 py-2.5 rounded-xl transition-all"
              style={{
                background: mode === m ? "var(--card)" : "transparent",
                color: mode === m ? "var(--foreground)" : "var(--muted-foreground)",
                fontWeight: mode === m ? 600 : 400,
                fontSize: "0.875rem",
                boxShadow: mode === m ? "0 1px 4px rgba(44,26,14,0.08)" : "none",
              }}
            >
              {m === "login" ? "Se connecter" : "Créer un compte"}
            </button>
          ))}
        </div>

        {/* OAuth buttons */}
        <div className="flex flex-col gap-2.5">
          {PROVIDERS.map(p => (
            <div key={p.id} className="flex flex-col gap-1">
              <button
                onClick={() => handleOAuth(p.id as "google" | "github")}
                disabled={loading !== null}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
                style={{
                  background: p.bg,
                  border: `1px solid ${p.border}`,
                  color: p.color,
                  opacity: loading && loading !== p.id ? 0.5 : 1,
                }}
              >
                {loading === p.id
                  ? <Loader size={20} color={p.color} style={{ animation: "spin 1s linear infinite" }} />
                  : p.icon
                }
                <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{p.label}</span>
              </button>
              <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", paddingLeft: "0.5rem" }}>
                Indisponible pour votre appareil
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>ou par e-mail</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Mail size={16} color="var(--muted-foreground)" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl outline-none transition-all"
              style={{
                background: "var(--input-background)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                fontSize: "0.9rem",
              }}
            />
          </div>

          {mode !== "magic" && (
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder={mode === "signup" ? "Choisir un mot de passe" : "Mot de passe"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl outline-none transition-all"
                style={{
                  background: "var(--input-background)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                  fontSize: "0.9rem",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPass ? <EyeOff size={16} color="var(--muted-foreground)" /> : <Eye size={16} color="var(--muted-foreground)" />}
              </button>
            </div>
          )}

          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(196,98,58,0.1)", border: "1px solid rgba(196,98,58,0.3)" }}>
              <AlertCircle size={15} color="#C4623A" />
              <p style={{ fontSize: "0.82rem", color: "#C4623A" }}>{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(107,143,107,0.1)", border: "1px solid rgba(107,143,107,0.3)" }}>
              <p style={{ fontSize: "0.82rem", color: "#2C4A2C" }}>{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-all"
            style={{ background: "var(--primary)", color: "#fff", opacity: loading ? 0.7 : 1 }}
          >
            {loading === "email"
              ? <Loader size={20} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
              : <ArrowRight size={20} />
            }
            <span style={{ fontWeight: 600 }}>
              {mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}
            </span>
          </button>
        </form>

        {/* Magic link */}
        <button
          onClick={() => { setMode(m => m === "magic" ? "login" : "magic"); setError(""); setSuccess(""); }}
          style={{ color: "var(--muted-foreground)", fontSize: "0.8rem", textAlign: "center" }}
        >
          {mode === "magic" ? "← Retour" : "Connexion par lien magique (sans mot de passe)"}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
