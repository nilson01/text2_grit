import { useState, useRef, useEffect } from "react";
import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FocusTimer({ onComplete, initialMinutes = 25 }) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [remaining, setRemaining] = useState(initialMinutes * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - (totalSeconds - remaining) * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const r = Math.max(0, totalSeconds - elapsed);
        setRemaining(r);
        if (r <= 0) {
          clearInterval(intervalRef.current);
          setRunning(false);
          onComplete?.(Math.round(totalSeconds / 60));
        }
      }, 250);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, totalSeconds]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setRemaining(totalSeconds);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    const elapsedMin = Math.round((totalSeconds - remaining) / 60);
    if (elapsedMin > 0) onComplete?.(elapsedMin);
    setRemaining(totalSeconds);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-64 h-64">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 260 260">
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="4"
          />
          <circle
            cx="130"
            cy="130"
            r="120"
            fill="none"
            stroke="hsl(160, 84%, 39%)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-light tracking-tight tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
            {running ? "Focusing" : "Ready"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
        >
          <RotateCcw className="h-5 w-5 text-muted-foreground" />
        </button>
        <button
          onClick={() => setRunning(!running)}
          className={cn(
            "h-16 w-16 rounded-full flex items-center justify-center transition-all shadow-xl",
            running
              ? "bg-amber-500 shadow-amber-500/25"
              : "bg-emerald-500 shadow-emerald-500/25"
          )}
        >
          {running ? (
            <Pause className="h-6 w-6 text-white" />
          ) : (
            <Play className="h-6 w-6 text-white ml-0.5" />
          )}
        </button>
        <button
          onClick={stop}
          className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
        >
          <Square className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Duration selector */}
      {!running && (
        <div className="flex items-center gap-2">
          {[15, 25, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => {
                setTotalSeconds(m * 60);
                setRemaining(m * 60);
              }}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                totalSeconds === m * 60
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {m}m
            </button>
          ))}
        </div>
      )}
    </div>
  );
}