import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TimeBlockRow({ block, onToggle }) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 bg-card rounded-2xl border-l-[3px] border border-border transition-all",
      block.completed ? "border-l-emerald-500 opacity-60" : "border-l-violet-400"
    )}>
      <button
        onClick={() => onToggle(block)}
        className={cn(
          "h-6 w-6 rounded-md flex-shrink-0 flex items-center justify-center transition-all",
          block.completed ? "bg-emerald-500 text-white" : "border-2 border-border hover:border-violet-400"
        )}
      >
        {block.completed && <Check className="h-3.5 w-3.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", block.completed && "line-through text-muted-foreground")}>
          {block.title}
        </p>
        {(block.start_time || block.end_time) && (
          <p className="text-[10px] text-muted-foreground">
            {block.start_time}{block.end_time ? ` → ${block.end_time}` : ""}
            {block.category ? ` · ${block.category}` : ""}
          </p>
        )}
      </div>
      {block.estimated_minutes > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {block.estimated_minutes}m
        </div>
      )}
    </div>
  );
}