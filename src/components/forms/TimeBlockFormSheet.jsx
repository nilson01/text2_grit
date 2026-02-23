import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import moment from "moment";

const CATEGORIES = ["Deep Work", "Coding", "Writing", "Admin", "Social", "Learning", "Creative", "Health"];

export default function TimeBlockFormSheet({ onSave, onClose, tasks = [], date }) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [category, setCategory] = useState("");
  const [linkedTaskId, setLinkedTaskId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      date: date || moment().format("YYYY-MM-DD"),
      start_time: startTime,
      end_time: endTime,
      estimated_minutes: estimatedMinutes,
      category,
      task_id: linkedTaskId,
      completed: false,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border-t border-border rounded-t-3xl p-6 pb-10 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">New Focus Block</h3>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Block Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Write project proposal"
              className="bg-accent/50 border-border rounded-xl h-11" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Start</label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="bg-accent/50 border-border rounded-xl h-11" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">End</label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="bg-accent/50 border-border rounded-xl h-11" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Est. Minutes</label>
            <Input type="number" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="bg-accent/50 border-border rounded-xl h-11" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(category === c ? "" : c)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    category === c
                      ? "bg-violet-500/10 text-violet-400 border border-violet-500/30"
                      : "bg-accent/50 border border-border text-muted-foreground"
                  )}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {tasks.length > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Link to Task (optional)</label>
              <select
                value={linkedTaskId}
                onChange={(e) => setLinkedTaskId(e.target.value)}
                className="w-full bg-accent/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none"
              >
                <option value="">No linked task</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          )}

          <Button onClick={handleSave} disabled={!title.trim() || saving}
            className="w-full h-12 rounded-2xl bg-violet-500 hover:bg-violet-600 text-white font-medium">
            {saving ? "Saving..." : "Add Focus Block"}
          </Button>
        </div>
      </div>
    </div>
  );
}