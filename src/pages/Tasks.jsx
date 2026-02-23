import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import moment from "moment";
import TaskRow from "@/components/today/TaskRow";
import TaskFormSheet from "@/components/forms/TaskFormSheet";
import { cn } from "@/lib/utils";

// Services
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskService,
} from "@/services/tasks";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const today = moment().format("YYYY-MM-DD");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const t = await listTasks();

      // Mimic old Base44 list("-created_date", 200) behavior in frontend
      const sorted = (t || [])
        .sort((a, b) => {
          const aDate = a.created_date || a.created_at || "";
          const bDate = b.created_date || b.created_at || "";
          return aDate < bDate ? 1 : -1;
        })
        .slice(0, 200);

      setTasks(sorted);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setErrorMessage(err?.message || "Failed to load tasks.");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleTask = async (task) => {
    try {
      await updateTask(task.id, {
        completed: !task.completed,
        completed_date: !task.completed ? today : null,
      });
      await loadData();
    } catch (err) {
      console.error("Error toggling task:", err);
      setErrorMessage(err?.message || "Failed to update task.");
    }
  };

  const saveTask = async (data) => {
    try {
      await createTask(data);
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Error saving task:", err);
      setErrorMessage(err?.message || "Failed to save task.");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTaskService(id);
      await loadData();
    } catch (err) {
      console.error("Error deleting task:", err);
      setErrorMessage(err?.message || "Failed to delete task.");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!showCompleted && t.completed) return false;
    if (filter === "today") return t.planned_date === today || t.due_date === today;
    if (filter === "upcoming") return t.due_date && t.due_date > today && !t.completed;
    if (filter === "overdue") return t.due_date && t.due_date < today && !t.completed;
    return true;
  });

  const filters = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "upcoming", label: "Upcoming" },
    { key: "overdue", label: "Overdue" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-5 pt-14 pb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {tasks.filter((t) => !t.completed).length} remaining
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="h-10 w-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {errorMessage && (
        <div className="px-5 mt-2">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-5 mt-2 flex items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              filter === f.key
                ? "bg-foreground text-background"
                : "bg-card border border-border text-muted-foreground"
            )}
          >
            {f.label}
          </button>
        ))}

        <button
          onClick={() => setShowCompleted(!showCompleted)}
          className="ml-auto h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground"
        >
          {showCompleted ? (
            <EyeOff className="h-3.5 w-3.5" />
          ) : (
            <Eye className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="px-5 mt-4 space-y-2">
        {filteredTasks.map((task) => (
          <div key={task.id} className="relative group">
            <TaskRow task={task} onToggle={toggleTask} />
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="absolute right-14 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <p className="text-sm">No tasks to show</p>
          </div>
        )}
      </div>

      {showForm && (
        <TaskFormSheet onSave={saveTask} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}