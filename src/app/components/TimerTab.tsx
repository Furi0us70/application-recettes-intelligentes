import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Plus, Minus, Timer } from "lucide-react";

interface TimerTabProps {
  initialMinutes?: number;
}

export function TimerTab({ initialMinutes = 0 }: TimerTabProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remaining, setRemaining] = useState(initialMinutes * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (initialMinutes > 0) {
      setTotalSeconds(initialMinutes * 60);
      setRemaining(initialMinutes * 60);
      setFinished(false);
    }
  }, [initialMinutes]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = totalSeconds > 0 ? (remaining / totalSeconds) : 0;

  function handleReset() {
    setRunning(false);
    setRemaining(totalSeconds);
    setFinished(false);
  }

  function adjustTime(delta: number) {
    if (running) return;
    const newVal = Math.max(0, Math.min(5999, totalSeconds + delta));
    setTotalSeconds(newVal);
    setRemaining(newVal);
    setFinished(false);
  }

  const circumference = 2 * Math.PI * 110;
  const strokeDashoffset = circumference * (1 - progress);

  const presets = [
    { label: "5 min", seconds: 300 },
    { label: "10 min", seconds: 600 },
    { label: "20 min", seconds: 1200 },
    { label: "30 min", seconds: 1800 },
    { label: "45 min", seconds: 2700 },
    { label: "1 h", seconds: 3600 },
  ];

  return (
    <div className="flex flex-col h-full px-4 pt-6 pb-4 gap-5">
      <div className="flex items-center gap-2">
        <Timer size={18} color="var(--primary)" />
        <h1 className="font-display" style={{ fontFamily: "'Lora', Georgia, serif" }}>Timer de cuisson</h1>
      </div>

      {/* Circular timer */}
      <div className="flex flex-col items-center gap-4 flex-1 justify-center">
        <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
          {/* Background track */}
          <svg className="absolute inset-0" width="260" height="260" viewBox="0 0 260 260">
            <circle
              cx="130" cy="130" r="110"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="12"
            />
            <circle
              cx="130" cy="130" r="110"
              fill="none"
              stroke={finished ? "#C4623A" : progress > 0.25 ? "var(--accent)" : "#D45A3A"}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 130 130)"
              style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
            />
          </svg>

          {/* Time display */}
          <div className="flex flex-col items-center z-10">
            {finished ? (
              <div className="flex flex-col items-center gap-1">
                <span style={{ fontSize: "2rem" }}>🍽️</span>
                <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "1.1rem" }}>Terminé !</span>
              </div>
            ) : (
              <>
                <span
                  style={{
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize: "3.2rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
                  {running ? "en cours…" : remaining === totalSeconds ? "prêt" : "en pause"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Adjust buttons */}
        {!running && !finished && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => adjustTime(-60)}
              className="rounded-full flex items-center justify-center transition-all"
              style={{ width: 44, height: 44, background: "var(--muted)", color: "var(--foreground)" }}
            >
              <Minus size={18} />
            </button>
            <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>1 min</span>
            <button
              onClick={() => adjustTime(60)}
              className="rounded-full flex items-center justify-center transition-all"
              style={{ width: 44, height: 44, background: "var(--muted)", color: "var(--foreground)" }}
            >
              <Plus size={18} />
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="rounded-full flex items-center justify-center transition-all"
            style={{ width: 52, height: 52, background: "var(--muted)" }}
          >
            <RotateCcw size={20} color="var(--muted-foreground)" />
          </button>
          <button
            onClick={() => { if (totalSeconds > 0) setRunning(r => !r); }}
            disabled={totalSeconds === 0 || finished}
            className="rounded-full flex items-center justify-center transition-all"
            style={{
              width: 72,
              height: 72,
              background: totalSeconds === 0 || finished ? "var(--muted)" : "var(--primary)",
              color: "#fff",
              opacity: totalSeconds === 0 || finished ? 0.5 : 1,
            }}
          >
            {running ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <div style={{ width: 52 }} />
        </div>
      </div>

      {/* Presets */}
      <div>
        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>
          Durées rapides
        </p>
        <div className="grid grid-cols-3 gap-2">
          {presets.map(preset => (
            <button
              key={preset.label}
              onClick={() => {
                setRunning(false);
                setTotalSeconds(preset.seconds);
                setRemaining(preset.seconds);
                setFinished(false);
              }}
              className="py-2.5 rounded-xl transition-all"
              style={{
                background: totalSeconds === preset.seconds ? "var(--primary)" : "var(--muted)",
                color: totalSeconds === preset.seconds ? "#fff" : "var(--muted-foreground)",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
