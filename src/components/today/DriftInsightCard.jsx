import { AlertTriangle, TrendingDown, Layers, Clock, CheckCircle2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Generates a supportive drift analysis comparing planned vs actual execution.
 * Returns an object with: type, headline, body, level ("good"|"ok"|"attention")
 */
export function computeDriftInsight({ tasks, focusSessions, timeBlocks = [] }) {
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const completionRate = totalTasks > 0 ? completed / totalTasks : null;
  const plannedMinutes = tasks.reduce((s, t) => s + (t.estimated_minutes || 0), 0);
  const focusMinutes = focusSessions.reduce((s, f) => s + (f.duration_minutes || 0), 0);
  const blocksPlanned = timeBlocks.length;
  const blocksCompleted = timeBlocks.filter((b) => b.completed).length;

  if (totalTasks === 0) {
    return {
      type: "no_plan",
      icon: "neutral",
      headline: "No plan today — that's okay.",
      body: "Rest and unplanned days are valid. You can start a plan anytime.",
      level: "neutral",
    };
  }

  // Overplanning: planned > 8 hours worth of tasks
  if (plannedMinutes > 480 && completionRate !== null && completionRate < 0.5) {
    return {
      type: "overplanning",
      icon: "layers",
      headline: "You may have overplanned today.",
      body: `You planned ~${Math.round(plannedMinutes / 60)}h of work but completed ${Math.round((completionRate || 0) * 100)}%. It's okay — try planning 3–4 focused tasks next time.`,
      level: "attention",
    };
  }

  // Fragmentation: many tasks, low focus
  if (totalTasks >= 6 && focusMinutes < 30 && completionRate !== null && completionRate < 0.5) {
    return {
      type: "fragmentation",
      icon: "fragmented",
      headline: "Lots of tasks, little focus time.",
      body: "Context-switching between many tasks can reduce depth. Try grouping similar tasks or adding a focus block.",
      level: "attention",
    };
  }

  // No focus sessions
  if (totalTasks > 2 && focusMinutes === 0 && completionRate !== null && completionRate < 0.6) {
    return {
      type: "no_focus",
      icon: "clock",
      headline: "No focus sessions today.",
      body: "Tasks often get done faster in focused sprints. Even one 25-minute Pomodoro helps.",
      level: "ok",
    };
  }

  // Good day
  if (completionRate !== null && completionRate >= 0.7) {
    return {
      type: "great",
      icon: "good",
      headline: completionRate === 1 ? "Perfect execution today! 🎉" : "Solid day.",
      body: `You completed ${completed} of ${totalTasks} tasks${focusMinutes > 0 ? ` with ${focusMinutes} minutes of focused work` : ""}. Keep the momentum.`,
      level: "good",
    };
  }

  // Moderate completion
  return {
    type: "moderate",
    icon: "ok",
    headline: "You made progress.",
    body: `${completed} of ${totalTasks} tasks done. ${totalTasks - completed} unfinished — consider moving them to tomorrow or re-evaluating.`,
    level: "ok",
  };
}

const levelStyles = {
  neutral: "bg-muted/50 border-border",
  good: "bg-emerald-500/5 border-emerald-500/20",
  ok: "bg-blue-500/5 border-blue-500/20",
  attention: "bg-amber-500/5 border-amber-500/20",
};

const iconMap = {
  neutral: { icon: MessageCircle, color: "text-muted-foreground" },
  good: { icon: CheckCircle2, color: "text-emerald-400" },
  ok: { icon: TrendingDown, color: "text-blue-400" },
  attention: { icon: AlertTriangle, color: "text-amber-400" },
  layers: { icon: Layers, color: "text-amber-400" },
  fragmented: { icon: Layers, color: "text-amber-400" },
  clock: { icon: Clock, color: "text-blue-400" },
};

export default function DriftInsightCard({ tasks = [], focusSessions = [], timeBlocks = [] }) {
  const insight = computeDriftInsight({ tasks, focusSessions, timeBlocks });
  const style = levelStyles[insight.level] || levelStyles.neutral;
  const { icon: Icon, color } = iconMap[insight.icon] || iconMap.neutral;

  return (
    <div className={cn("rounded-2xl border p-4 flex gap-3", style)}>
      <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", color)} />
      <div>
        <p className="text-sm font-semibold">{insight.headline}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.body}</p>
      </div>
    </div>
  );
}