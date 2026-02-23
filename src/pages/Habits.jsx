import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, Flame } from "lucide-react";
import moment from "moment";
import HabitCheckRow from "@/components/today/HabitCheckRow";
import HabitFormSheet from "@/components/forms/HabitFormSheet";
import { cn } from "@/lib/utils";

// Supabase service imports
import { listHabits, createHabit, updateHabit, deleteHabit as deleteHabitService } from "@/services/habits";
import { listHabitLogs, createHabitLog, updateHabitLog } from "@/services/habitLogs";

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [streaks, setStreaks] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const today = moment().format("YYYY-MM-DD");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Since current services are simple list() calls, we fetch and filter in the page
      const [allHabits, allHabitLogs] = await Promise.all([
        listHabits(),
        listHabitLogs(),
      ]);

      const todaysHabitLogs = (allHabitLogs || []).filter((l) => l.date === today);
      const completedLogs = (allHabitLogs || []).filter((l) => l.completed);

      setHabits(allHabits || []);
      setHabitLogs(todaysHabitLogs);

      // Compute streaks (same logic as before)
      const streakMap = {};
      (allHabits || []).forEach((habit) => {
        const logs = completedLogs
          .filter((l) => l.habit_id === habit.id)
          .sort((a, b) => (a.date > b.date ? -1 : 1));

        let streak = 0;
        let checkDate = moment();

        for (let i = 0; i < 365; i++) {
          const d = checkDate.format("YYYY-MM-DD");
          if (logs.some((l) => l.date === d)) {
            streak++;
            checkDate.subtract(1, "day");
          } else {
            break;
          }
        }

        streakMap[habit.id] = streak;
      });

      setStreaks(streakMap);
    } catch (err) {
      console.error("Error loading habits page:", err);
      setErrorMessage(err?.message || "Failed to load habits.");
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleHabit = async (habit, log) => {
    try {
      if (log) {
        await updateHabitLog(log.id, { completed: !log.completed });
      } else {
        await createHabitLog({
          habit_id: habit.id,
          date: today,
          completed: true,
          count_value: 0,
        });
      }
      await loadData();
    } catch (err) {
      console.error("Error toggling habit:", err);
      setErrorMessage(err?.message || "Failed to update habit.");
    }
  };

  const incrementHabit = async (habit, log, delta) => {
    try {
      const newVal = Math.max(0, (log?.count_value || 0) + delta);

      if (log) {
        await updateHabitLog(log.id, {
          count_value: newVal,
          completed: newVal >= (habit.target_count || 1),
        });
      } else {
        const initialVal = Math.max(0, delta);
        await createHabitLog({
          habit_id: habit.id,
          date: today,
          count_value: initialVal,
          completed: initialVal >= (habit.target_count || 1),
        });
      }

      await loadData();
    } catch (err) {
      console.error("Error incrementing habit:", err);
      setErrorMessage(err?.message || "Failed to update habit count.");
    }
  };

  const saveHabit = async (data) => {
    try {
      if (editingHabit) {
        await updateHabit(editingHabit.id, data);
      } else {
        await createHabit(data);
      }

      setShowForm(false);
      setEditingHabit(null);
      await loadData();
    } catch (err) {
      console.error("Error saving habit:", err);
      setErrorMessage(err?.message || "Failed to save habit.");
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      await deleteHabitService(id);
      await loadData();
    } catch (err) {
      console.error("Error deleting habit:", err);
      setErrorMessage(err?.message || "Failed to delete habit.");
    }
  };

  const activeHabits = habits.filter((h) => h.is_active);
  const archivedHabits = habits.filter((h) => !h.is_active); // kept for future use

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
          <h1 className="text-2xl font-bold tracking-tight">Habits</h1>
          <p className="text-sm text-muted-foreground">Build consistency, one day at a time</p>
        </div>
        <button
          onClick={() => {
            setEditingHabit(null);
            setShowForm(true);
          }}
          className="h-10 w-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25"
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

      <div className="px-5 mt-4 space-y-2">
        {activeHabits.map((habit) => {
          const log = habitLogs.find((l) => l.habit_id === habit.id);

          return (
            <div key={habit.id} className="relative group">
              <HabitCheckRow
                habit={habit}
                log={log}
                onToggle={toggleHabit}
                onIncrement={incrementHabit}
              />

              <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {(streaks[habit.id] || 0) > 0 && (
                  <div className="flex items-center gap-1 text-xs text-amber-400 mr-2">
                    <Flame className="h-3 w-3" />
                    {streaks[habit.id]}
                  </div>
                )}

                <button
                  onClick={() => {
                    setEditingHabit(habit);
                    setShowForm(true);
                  }}
                  className="h-6 w-6 rounded-md bg-accent flex items-center justify-center"
                >
                  <Pencil className="h-3 w-3" />
                </button>

                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="h-6 w-6 rounded-md bg-red-500/10 text-red-400 flex items-center justify-center"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}

        {activeHabits.length === 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-16 rounded-2xl border-2 border-dashed border-border flex flex-col items-center gap-3 text-muted-foreground hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Create your first habit</span>
          </button>
        )}
      </div>

      {showForm && (
        <HabitFormSheet
          onSave={saveHabit}
          onClose={() => {
            setShowForm(false);
            setEditingHabit(null);
          }}
          initial={editingHabit}
        />
      )}
    </div>
  );
}