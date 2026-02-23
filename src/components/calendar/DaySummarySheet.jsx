import { X, ListTodo, Target, Timer, MessageCircle, AlertTriangle, Layers, Clock, TrendingDown } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";
import { computeDriftInsight } from "@/components/today/DriftInsightCard";

export default function DaySummarySheet({ date, summary, tasks, habitLogs, onClose }) {
  const dateM = moment(date);
  const hasPlan = summary && (summary.tasks_created_count || 0) > 0;

  // Rebuild drift insight from summary data
  const driftData = summary ? {
    tasks: Array.from({ length: summary.tasks_created_count || 0 }, (_, i) => ({
      completed: i < (summary.tasks_completed_count || 0),
      estimated_minutes: 30,
    })),
    focusSessions: Array.from({ length: 1 }, () => ({
      duration_minutes: summary.focus_session_minutes || 0,
    })),
    timeBlocks: [],
  } : { tasks: [], focusSessions: [], timeBlocks: [] };
  const insight = computeDriftInsight(driftData);

  const levelLabel = ["No plan", "1–39%", "40–69%", "70–99%", "100%"];
  const levelColors = [
    "bg-muted text-muted-foreground",
    "bg-red-500/20 text-red-400",
    "bg-amber-500/20 text-amber-400",
    "bg-emerald-500/20 text-emerald-400",
    "bg-emerald-500 text-white",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border-t border-border rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-10 duration-300">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold">{dateM.format("dddd, MMM D")}</h3>
            <p className="text-xs text-muted-foreground">
              {hasPlan ? "Daily summary" : "No plan created — that's okay"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {summary && (
              <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", levelColors[summary.color_level || 0])}>
                {levelLabel[summary.color_level || 0]}
              </span>
            )}
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {hasPlan ? (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard icon={ListTodo} label="Tasks Done"
                value={`${summary.tasks_completed_count}/${summary.tasks_created_count}`}
                color="text-blue-400" />
              <StatCard icon={Target} label="Habits"
                value={`${summary.habits_completed || 0}/${summary.habits_total || 0}`}
                color="text-emerald-400" />
              <StatCard icon={Timer} label="Focus"
                value={`${summary.focus_session_minutes || 0}m`}
                color="text-violet-400" />
            </div>

            {/* Plan vs actual */}
            <div className="bg-accent/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Planned</p>
                <p className="text-xs font-medium">{summary.planned_minutes || 0} min</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Focus time</p>
                <p className="text-xs font-medium">{summary.focus_session_minutes || 0} min</p>
              </div>
              {summary.completion_rate > 0 && (
                <>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Completion</p>
                    <p className="text-xs font-semibold">{Math.round(summary.completion_rate)}%</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${summary.completion_rate}%` }} />
                  </div>
                </>
              )}
            </div>

            {/* Drift narrative */}
            <div className={cn(
              "flex gap-3 rounded-2xl p-4 border",
              insight.level === "good" ? "bg-emerald-500/5 border-emerald-500/20"
                : insight.level === "attention" ? "bg-amber-500/5 border-amber-500/20"
                : "bg-blue-500/5 border-blue-500/20"
            )}>
              <MessageCircle className={cn("h-4 w-4 mt-0.5 flex-shrink-0",
                insight.level === "good" ? "text-emerald-400"
                  : insight.level === "attention" ? "text-amber-400"
                  : "text-blue-400"
              )} />
              <div>
                <p className="text-sm font-semibold">{insight.headline}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{insight.body}</p>
              </div>
            </div>

            {/* AI feedback if stored */}
            {summary.feedback_insight && summary.feedback_insight !== insight.body && (
              <div className="flex gap-3 bg-muted/30 rounded-2xl p-4">
                <MessageCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{summary.feedback_insight}</p>
              </div>
            )}

            {/* Tasks list */}
            {tasks && tasks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tasks</h4>
                <div className="space-y-1.5">
                  {tasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-sm">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${t.completed ? "bg-emerald-500" : "bg-border"}`} />
                      <span className={cn("truncate", t.completed && "line-through text-muted-foreground")}>
                        {t.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <ListTodo className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No plan on this day</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto">
              That's completely fine. Not every day needs a plan. Rest days matter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-accent/50 rounded-xl p-3 text-center">
      <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}