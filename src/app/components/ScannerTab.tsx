import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, ChevronRight, Sparkles, AlertCircle, RefreshCw, X } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface ScannerTabProps {
  onScanComplete: (ingredients: string[]) => void;
}

type Phase = "idle" | "camera" | "analyzing" | "detected" | "error";

export function ScannerTab({ onScanComplete }: ScannerTabProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  async function startCamera() {
    setPhase("camera");
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      setPhase("error");
      setErrorMsg("Impossible d'accéder à la caméra. Vérifiez les permissions de votre navigateur.");
    }
  }

  async function captureAndAnalyze() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Draw frame to canvas
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    // Get base64 (strip the data URI prefix)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
    setCapturedImage(dataUrl);

    stopCamera();
    setPhase("analyzing");

    try {
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-871aede6/detect-ingredients`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur serveur");
      const detected: string[] = data.ingredients ?? [];
      if (detected.length === 0) {
        setPhase("error");
        setErrorMsg("Aucun ingrédient détecté. Réessayez avec une photo plus nette.");
        return;
      }
      setIngredients(detected);
      setPhase("detected");
    } catch (e) {
      setPhase("error");
      setErrorMsg(e instanceof Error ? e.message : "Erreur lors de l'analyse.");
    }
  }

  function handleReset() {
    stopCamera();
    setPhase("idle");
    setIngredients([]);
    setCapturedImage(null);
    setErrorMsg("");
  }

  function handleConfirm() {
    onScanComplete(ingredients);
  }

  return (
    <div className="flex flex-col h-full px-4 pt-6 pb-4 gap-5">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: "'Lora', Georgia, serif" }}>Scanner mes ingrédients</h1>
        <p className="text-muted-foreground mt-1" style={{ fontSize: "0.875rem" }}>
          Photographiez vos ingrédients — Gemini Vision les identifie et propose des recettes.
        </p>
      </div>

      {/* Viewfinder area */}
      <div
        className="relative rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{
          aspectRatio: "4/3",
          background: phase === "detected" ? "#EEF5EE" : "#1C1008",
          border: "2px solid var(--border)",
        }}
      >
        {/* Live camera */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          style={{ display: phase === "camera" ? "block" : "none" }}
        />

        {/* Captured image preview */}
        {capturedImage && (phase === "analyzing") && (
          <img
            src={capturedImage}
            alt="Capture"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Idle state */}
        {phase === "idle" && (
          <div className="flex flex-col items-center gap-3 text-center px-6 z-10">
            <div
              className="rounded-2xl flex items-center justify-center"
              style={{ width: 64, height: 64, background: "rgba(196,98,58,0.2)" }}
            >
              <Camera size={28} color="#C4623A" />
            </div>
            <p style={{ color: "#D4A574", fontSize: "0.9rem" }}>
              Appuyez pour ouvrir la caméra
            </p>
            {/* Corner guides */}
            {[["top-6 left-6", "border-t-2 border-l-2"], ["top-6 right-6", "border-t-2 border-r-2"], ["bottom-6 left-6", "border-b-2 border-l-2"], ["bottom-6 right-6", "border-b-2 border-r-2"]].map(([pos, border], i) => (
              <div key={i} className={`absolute w-7 h-7 ${pos} ${border}`} style={{ borderColor: "#C4623A" }} />
            ))}
          </div>
        )}

        {/* Camera active — corner guides */}
        {phase === "camera" && (
          <>
            {[["top-4 left-4", "border-t-2 border-l-2"], ["top-4 right-4", "border-t-2 border-r-2"], ["bottom-4 left-4", "border-b-2 border-l-2"], ["bottom-4 right-4", "border-b-2 border-r-2"]].map(([pos, border], i) => (
              <div key={i} className={`absolute w-7 h-7 ${pos} ${border} z-10`} style={{ borderColor: "#C4623A" }} />
            ))}
            <button
              onClick={handleReset}
              className="absolute top-3 right-3 z-20 rounded-full flex items-center justify-center"
              style={{ width: 36, height: 36, background: "rgba(0,0,0,0.5)" }}
            >
              <X size={16} color="#fff" />
            </button>
          </>
        )}

        {/* Analyzing */}
        {phase === "analyzing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10" style={{ background: "rgba(28,16,8,0.6)" }}>
            <div className="relative" style={{ width: 64, height: 64 }}>
              <div className="absolute inset-0 rounded-full" style={{ border: "3px solid #C4623A", animation: "spin 1s linear infinite" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={24} color="#C4623A" />
              </div>
            </div>
            <p style={{ color: "#D4A574", fontSize: "0.9rem" }}>Gemini analyse la photo…</p>
          </div>
        )}

        {/* Detected */}
        {phase === "detected" && (
          <div className="flex flex-col items-center gap-3 px-4 py-6 text-center z-10">
            <div className="rounded-full flex items-center justify-center" style={{ width: 52, height: 52, background: "rgba(107,143,107,0.2)" }}>
              <Sparkles size={24} color="#6B8F6B" />
            </div>
            <p style={{ color: "#2C4A2C", fontWeight: 600, fontSize: "1rem" }}>
              {ingredients.length} ingrédient{ingredients.length > 1 ? "s" : ""} détecté{ingredients.length > 1 ? "s" : ""} !
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {ingredients.map((ing) => (
                <span
                  key={ing}
                  className="px-3 py-1 rounded-full capitalize"
                  style={{ background: "rgba(107,143,107,0.15)", color: "#2C4A2C", fontSize: "0.8rem", fontWeight: 500, border: "1px solid rgba(107,143,107,0.3)" }}
                >
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <div className="flex flex-col items-center gap-3 px-6 text-center z-10">
            <AlertCircle size={32} color="#C4623A" />
            <p style={{ color: "#D4A574", fontSize: "0.85rem" }}>{errorMsg}</p>
          </div>
        )}
      </div>

      {/* Tip */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3 flex-shrink-0"
        style={{ background: "rgba(196,98,58,0.08)", border: "1px solid rgba(196,98,58,0.2)" }}
      >
        <AlertCircle size={16} color="#C4623A" className="flex-shrink-0 mt-0.5" />
        <p style={{ color: "#8A6A52", fontSize: "0.78rem", lineHeight: 1.5 }}>
          Posez vos ingrédients à plat, bien éclairés. Gemini Vision les identifiera automatiquement.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {phase === "idle" && (
          <button
            onClick={startCamera}
            className="w-full rounded-2xl flex items-center justify-center gap-3 py-4 transition-all"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            <Camera size={22} />
            <span style={{ fontWeight: 600 }}>Ouvrir la caméra</span>
          </button>
        )}

        {phase === "camera" && (
          <button
            onClick={captureAndAnalyze}
            className="w-full rounded-2xl flex items-center justify-center gap-3 py-4 transition-all"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            <div className="rounded-full border-2 border-white" style={{ width: 20, height: 20 }} />
            <span style={{ fontWeight: 600 }}>Prendre la photo</span>
          </button>
        )}

        {phase === "analyzing" && (
          <button disabled className="w-full rounded-2xl flex items-center justify-center gap-3 py-4 opacity-60" style={{ background: "var(--primary)", color: "#fff" }}>
            <span style={{ fontWeight: 600 }}>Analyse en cours…</span>
          </button>
        )}

        {phase === "detected" && (
          <>
            <button
              onClick={handleConfirm}
              className="w-full rounded-2xl flex items-center justify-center gap-3 py-4 transition-all"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              <span style={{ fontWeight: 600 }}>Trouver des recettes</span>
              <ChevronRight size={20} />
            </button>
            <button
              onClick={handleReset}
              className="w-full rounded-2xl py-3 flex items-center justify-center gap-2 transition-all"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              <RefreshCw size={16} />
              Rescanner
            </button>
          </>
        )}

        {phase === "error" && (
          <button
            onClick={handleReset}
            className="w-full rounded-2xl py-4 flex items-center justify-center gap-2"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            <RefreshCw size={18} />
            <span style={{ fontWeight: 600 }}>Réessayer</span>
          </button>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
