import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#06B6D4"];
const ICONS = ["💪", "📖", "🧘", "💧", "🏃", "✍️", "🎯", "🍎", "😴", "🧠"];
const TYPES = [
  { value: "yes_no", label: "Yes / No" },
  { value: "count", label: "Count" },
  { value: "duration", label: "Duration" },
];

export default function HabitFormSheet({ onSave, onClose, initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [icon, setIcon] = useState(initial?.icon || "💪");
  const [color, setColor] = useState(initial?.color || "#10B981");
  const [habitType, setHabitType] = useState(initial?.habit_type || "yes_no");
  const [targetCount, setTargetCount] = useState(initial?.target_count || 8);
  const [targetMinutes, setTargetMinutes] = useState(initial?.target_minutes || 30);
  const [isAvoid, setIsAvoid] = useState(initial?.is_avoid || false);
  const [category, setCategory] = useState(initial?.category || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      icon,
      color,
      habit_type: habitType,
      target_count: targetCount,
      target_minutes: targetMinutes,
      is_avoid: isAvoid,
      category: category.trim(),
      is_active: true,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border-t border-border rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">{initial ? "Edit Habit" : "New Habit"}</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 30 minutes"
              className="bg-accent/50 border-border rounded-xl h-11"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={cn(
                    "h-10 w-10 rounded-xl text-lg flex items-center justify-center transition-all",
                    icon === i ? "bg-emerald-500/10 ring-2 ring-emerald-500" : "bg-accent/50"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    color === c && "ring-2 ring-offset-2 ring-offset-background ring-white"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</label>
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setHabitType(t.value)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-medium transition-all",
                    habitType === t.value
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-accent/50 border border-border text-muted-foreground"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {habitType === "count" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Count</label>
              <Input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="bg-accent/50 border-border rounded-xl h-11"
              />
            </div>
          )}

          {habitType === "duration" && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Minutes</label>
              <Input
                type="number"
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
                className="bg-accent/50 border-border rounded-xl h-11"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category (optional)</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Health, Learning"
              className="bg-accent/50 border-border rounded-xl h-11"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={cn(
                "h-6 w-10 rounded-full transition-colors p-0.5 flex items-center",
                isAvoid ? "bg-emerald-500 justify-end" : "bg-border justify-start"
              )}
              onClick={() => setIsAvoid(!isAvoid)}
            >
              <div className="h-5 w-5 rounded-full bg-white shadow transition-transform" />
            </div>
            <span className="text-sm">This is something I want to avoid</span>
          </label>

          <Button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
          >
            {saving ? "Saving..." : initial ? "Update Habit" : "Create Habit"}
          </Button>
        </div>
      </div>
    </div>
  );
}