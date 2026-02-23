import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import moment from "moment";

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { value: "medium", label: "Medium", color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { value: "high", label: "High", color: "bg-red-500/10 text-red-400 border-red-500/30" },
];

const CATEGORIES = ["Work", "Personal", "Health", "Learning", "Admin", "Creative"];

export default function TaskFormSheet({ onSave, onClose, initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [priority, setPriority] = useState(initial?.priority || "medium");
  const [category, setCategory] = useState(initial?.category || "");
  const [dueDate, setDueDate] = useState(initial?.due_date || "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(initial?.estimated_minutes || 30);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      notes: notes.trim(),
      priority,
      category,
      due_date: dueDate,
      estimated_minutes: estimatedMinutes,
      planned_date: dueDate || moment().format("YYYY-MM-DD"),
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border-t border-border rounded-t-3xl p-6 pb-10 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">{initial ? "Edit Task" : "New Task"}</h3>
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
              placeholder="What needs to be done?"
              className="bg-accent/50 border-border rounded-xl h-11"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add details..."
              rows={2}
              className="w-full bg-accent/50 border border-border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-medium border transition-all",
                    priority === p.value ? p.color : "bg-accent/50 border-border text-muted-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(category === c ? "" : c)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    category === c
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-accent/50 border border-border text-muted-foreground"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-accent/50 border-border rounded-xl h-11"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Est. Minutes</label>
              <Input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="bg-accent/50 border-border rounded-xl h-11"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
          >
            {saving ? "Saving..." : initial ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </div>
    </div>
  );
}