import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityColors = {
  high: "border-l-red-400",
  medium: "border-l-amber-400",
  low: "border-l-blue-400",
};

export default function TaskRow({ task, onToggle }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 bg-card rounded-2xl border border-border border-l-[3px]",
        priorityColors[task.priority] || "border-l-border"
      )}
    >
      <button
        onClick={() => onToggle(task)}
        className={cn(
          "h-6 w-6 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-200",
          task.completed
            ? "bg-emerald-500 text-white"
            : "border-2 border-border hover:border-emerald-400"
        )}
      >
        {task.completed && <Check className="h-3.5 w-3.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate transition-all",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        {task.category && (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {task.category}
          </span>
        )}
      </div>
      {task.estimated_minutes > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {task.estimated_minutes}m
        </div>
      )}
    </div>
  );
}