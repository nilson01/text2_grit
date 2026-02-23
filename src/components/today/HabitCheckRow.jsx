import { Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HabitCheckRow({ habit, log, onToggle, onIncrement }) {
  const isYesNo = habit.habit_type === "yes_no";
  const isCount = habit.habit_type === "count";
  const completed = log?.completed;
  const countVal = log?.count_value || 0;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl border border-border">
      <div
        className="h-8 w-8 rounded-xl flex items-center justify-center text-sm"
        style={{ backgroundColor: habit.color + "20", color: habit.color }}
      >
        {habit.icon || "✦"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {habit.is_avoid ? `Avoid: ${habit.title}` : habit.title}
        </p>
        {isCount && (
          <p className="text-xs text-muted-foreground">
            {countVal} / {habit.target_count}
          </p>
        )}
      </div>
      {isYesNo && (
        <button
          onClick={() => onToggle(habit, log)}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200",
            completed
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
              : "border-2 border-border hover:border-emerald-400"
          )}
        >
          {completed && <Check className="h-4 w-4" />}
        </button>
      )}
      {isCount && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onIncrement(habit, log, -1)}
            className="h-7 w-7 rounded-full border border-border flex items-center justify-center hover:bg-accent"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-sm font-semibold w-6 text-center">{countVal}</span>
          <button
            onClick={() => onIncrement(habit, log, 1)}
            className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}