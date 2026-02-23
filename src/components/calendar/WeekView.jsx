import moment from "moment";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";

const levelColors = [
  "bg-muted/60",
  "bg-red-500/40",
  "bg-amber-500/40",
  "bg-emerald-500/40",
  "bg-emerald-500",
];

export default function WeekView({ summaries, onDayClick }) {
  const [weekStart, setWeekStart] = useState(moment().startOf("week"));

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, "days"));
  }, [weekStart]);

  const summaryMap = useMemo(() => {
    const m = {};
    (summaries || []).forEach((s) => { m[s.date] = s; });
    return m;
  }, [summaries]);

  const today = moment().format("YYYY-MM-DD");

  // Week aggregates
  const weekSummaries = days.map((d) => summaryMap[d.format("YYYY-MM-DD")]).filter(Boolean);
  const totalTasks = weekSummaries.reduce((s, d) => s + (d.tasks_completed_count || 0), 0);
  const totalFocus = weekSummaries.reduce((s, d) => s + (d.focus_session_minutes || 0), 0);
  const avgCompletion = weekSummaries.length > 0
    ? Math.round(weekSummaries.reduce((s, d) => s + (d.completion_rate || 0), 0) / weekSummaries.length)
    : 0;

  return (
    <div className="px-5">
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setWeekStart(moment(weekStart).subtract(1, "week"))}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">
          {weekStart.format("MMM D")} – {moment(weekStart).endOf("week").format("MMM D, YYYY")}
        </span>
        <button onClick={() => setWeekStart(moment(weekStart).add(1, "week"))}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const dateStr = day.format("YYYY-MM-DD");
          const s = summaryMap[dateStr];
          const level = s?.color_level || 0;
          const isToday = dateStr === today;
          return (
            <button key={dateStr} onClick={() => onDayClick?.(dateStr)}
              className={cn(
                "flex flex-col items-center gap-1 py-3 rounded-2xl transition-all",
                levelColors[level],
                isToday && "ring-2 ring-emerald-400 ring-offset-1 ring-offset-background"
              )}>
              <span className="text-[10px] text-muted-foreground font-medium">
                {day.format("ddd").toUpperCase()}
              </span>
              <span className="text-sm font-semibold">{day.date()}</span>
              {s && (
                <span className="text-[9px] text-muted-foreground">
                  {Math.round(s.completion_rate || 0)}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Week aggregates */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <AggCard label="Tasks Done" value={totalTasks} />
        <AggCard label="Focus min" value={totalFocus} />
        <AggCard label="Avg %" value={`${avgCompletion}%`} />
      </div>

      {/* Insights */}
      <div className="mt-3 space-y-2">
        {avgCompletion >= 70 && (
          <Insight text="Strong week — you hit 70%+ average completion." positive />
        )}
        {totalFocus === 0 && totalTasks > 0 && (
          <Insight text="No focus sessions this week. Try adding one 25-min block tomorrow." />
        )}
        {weekSummaries.filter((s) => (s.tasks_created_count || 0) > 7).length >= 2 && (
          <Insight text="You've been overplanning on some days. Consider limiting to 5 tasks max." />
        )}
      </div>
    </div>
  );
}

function AggCard({ label, value }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-center">
      <p className="text-base font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Insight({ text, positive }) {
  return (
    <div className={cn(
      "flex items-start gap-2 rounded-xl p-3 border",
      positive ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
    )}>
      <span className="text-sm">{positive ? "✨" : "💡"}</span>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}