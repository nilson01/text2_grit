import { useState, useRef, useEffect } from "react";
import { Play, Pause, Square, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

const PHASES = [
  { label: "Focus", minutes: 25, color: "#10B981" },
  { label: "Short Break", minutes: 5, color: "#3B82F6" },
  { label: "Focus", minutes: 25, color: "#10B981" },
  { label: "Short Break", minutes: 5, color: "#3B82F6" },
  { label: "Focus", minutes: 25, color: "#10B981" },
  { label: "Short Break", minutes: 5, color: "#3B82F6" },
  { label: "Focus", minutes: 25, color: "#10B981" },
  { label: "Long Break", minutes: 15, color: "#8B5CF6" },
];

export default function PomodoroTimer({ onPhaseComplete }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [remaining, setRemaining] = useState(PHASES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const intervalRef = useRef(null);
  const startRef = useRef(null);
  const totalRef = useRef(PHASES[0].minutes * 60);

  const phase = PHASES[phaseIndex];

  useEffect(() => {
    totalRef.current = phase.minutes * 60;
    setRemaining(phase.minutes * 60);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [phaseIndex]);

  useEffect(() => {
    if (running) {
      const elapsed0 = totalRef.current - remaining;
      startRef.current = Date.now() - elapsed0 * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
        const r = Math.max(0, totalRef.current - elapsed);
        setRemaining(r);
        if (r <= 0) {
          clearInterval(intervalRef.current);
          setRunning(false);
          const isFocus = phase.label === "Focus";
          onPhaseComplete?.(phase.label, phase.minutes);
          // Auto-advance
          const next = (phaseIndex + 1) % PHASES.length;
          if (next === 0) setRound((r) => r + 1);
          setPhaseIndex(next);
        }
      }, 250);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const skipPhase = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    const next = (phaseIndex + 1) % PHASES.length;
    setPhaseIndex(next);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    const elapsed = Math.round((totalRef.current - remaining) / 60);
    if (elapsed > 0 && phase.label === "Focus") onPhaseComplete?.(phase.label, elapsed);
    setPhaseIndex(0);
    setRound(1);
  };

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = totalRef.current > 0 ? 1 - remaining / totalRef.current : 0;
  const circumference = 2 * Math.PI * 110;

  // Mini phase dots
  const focusPhases = PHASES.filter((p) => p.label === "Focus");

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phase indicator */}
      <div className="flex items-center gap-1.5">
        {PHASES.map((p, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === phaseIndex ? "w-6" : "w-1.5 opacity-30"
            )}
            style={{ backgroundColor: p.color }}
          />
        ))}
      </div>

      <div className="relative w-56 h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="110" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
          <circle
            cx="120" cy="120" r="110" fill="none"
            stroke={phase.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{ color: phase.color }}
          >
            {phase.label}
          </span>
          <span className="text-4xl font-light tracking-tight tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground mt-1">Round {round}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={stop}
          className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent"
        >
          <Square className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => setRunning(!running)}
          className="h-14 w-14 rounded-full flex items-center justify-center shadow-xl transition-all"
          style={{ backgroundColor: phase.color, boxShadow: `0 8px 24px ${phase.color}40` }}
        >
          {running
            ? <Pause className="h-5 w-5 text-white" />
            : <Play className="h-5 w-5 text-white ml-0.5" />}
        </button>
        <button
          onClick={skipPhase}
          className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent"
        >
          <SkipForward className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}