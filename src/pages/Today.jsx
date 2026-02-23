import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Timer, Layers } from "lucide-react";
import moment from "moment";

import GreetingHeader from "@/components/today/GreetingHeader";
import QuickStats from "@/components/today/QuickStats";
import HabitCheckRow from "@/components/today/HabitCheckRow";
import TaskRow from "@/components/today/TaskRow";
import TimeBlockRow from "@/components/today/TimeBlockRow";
import DriftInsightCard from "@/components/today/DriftInsightCard";
import HabitFormSheet from "@/components/forms/HabitFormSheet";
import TaskFormSheet from "@/components/forms/TaskFormSheet";
import TimeBlockFormSheet from "@/components/forms/TimeBlockFormSheet";

// Services
import { listHabits, createHabit } from "@/services/habits";
import { listTasks, createTask, updateTask } from "@/services/tasks";
import { listTimeBlocks, createTimeBlock, updateTimeBlock } from "@/services/timeBlocks";
import { listFocusSessions } from "@/services/focusSessions";
import { listHabitLogs, createHabitLog, updateHabitLog } from "@/services/habitLogs";
import { listDailySummaries } from "@/services/dailySummaries";

export default function Today() {
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timeBlocks, setTimeBlocks] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const today = moment().format("YYYY-MM-DD");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [allHabits, allHabitLogs, allTasks, allTimeBlocks, allFocusSessions] = await Promise.all([
        listHabits(),
        listHabitLogs(),
        listTasks(),
        listTimeBlocks(),
        listFocusSessions(),
      ]);

      // Filter in frontend (simple + works with current service functions)
      const activeHabits = (allHabits || []).filter((h) => h.is_active === true);
      const todaysHabitLogs = (allHabitLogs || []).filter((hl) => hl.date === today);
      const todaysTasks = (allTasks || []).filter((t) => t.planned_date === today);
      const todaysTimeBlocks = (allTimeBlocks || []).filter((tb) => tb.date === today);
      const todaysFocusSessions = (allFocusSessions || []).filter((fs) => fs.date === today);

      setHabits(activeHabits);
      setHabitLogs(todaysHabitLogs);
      setTasks(todaysTasks);
      setTimeBlocks(todaysTimeBlocks);
      setFocusSessions(todaysFocusSessions);
    } catch (err) {
      console.error("Error loading Today page data:", err);
      setErrorMessage(err?.message || "Failed to load today's data.");
    } finally {
      setLoading(false);
    }
  }, [today]);

  const loadStreak = useCallback(async () => {
    try {
      const summaries = await listDailySummaries();

      const sorted = (summaries || [])
        .sort((a, b) => (a.date > b.date ? -1 : 1))
        .slice(0, 30);

      let s = 0;
      for (const sum of sorted) {
        if ((sum.completion_rate || 0) > 0) s++;
        else break;
      }
      setStreak(s);
    } catch (err) {
      console.error("Error loading streak:", err);
      // Non-blocking; keep streak at 0
      setStreak(0);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

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
      await loadStreak();
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
      await loadStreak();
    } catch (err) {
      console.error("Error incrementing habit:", err);
      setErrorMessage(err?.message || "Failed to update habit count.");
    }
  };

  const toggleTask = async (task) => {
    try {
      await updateTask(task.id, {
        completed: !task.completed,
        completed_date: !task.completed ? today : null,
      });

      await loadData();
      await loadStreak();
    } catch (err) {
      console.error("Error toggling task:", err);
      setErrorMessage(err?.message || "Failed to update task.");
    }
  };

  const toggleBlock = async (block) => {
    try {
      await updateTimeBlock(block.id, { completed: !block.completed });
      await loadData();
    } catch (err) {
      console.error("Error toggling time block:", err);
      setErrorMessage(err?.message || "Failed to update focus block.");
    }
  };

  const saveHabit = async (data) => {
    try {
      await createHabit(data);
      setShowHabitForm(false);
      await loadData();
    } catch (err) {
      console.error("Error saving habit:", err);
      setErrorMessage(err?.message || "Failed to save habit.");
    }
  };

  const saveTask = async (data) => {
    try {
      await createTask({ ...data, planned_date: today });
      setShowTaskForm(false);
      await loadData();
    } catch (err) {
      console.error("Error saving task:", err);
      setErrorMessage(err?.message || "Failed to save task.");
    }
  };

  const saveBlock = async (data) => {
    try {
      await createTimeBlock(data);
      setShowBlockForm(false);
      await loadData();
    } catch (err) {
      console.error("Error saving time block:", err);
      setErrorMessage(err?.message || "Failed to save focus block.");
    }
  };

  const completedHabits = habitLogs.filter((l) => l.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalFocusMin = focusSessions.reduce((sum, f) => sum + (f.duration_minutes || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <GreetingHeader />

      {errorMessage && (
        <div className="px-5 mt-3">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {errorMessage}
          </div>
        </div>
      )}

      <QuickStats
        habits={`${completedHabits}/${habits.length}`}
        tasks={`${completedTasks}/${tasks.length}`}
        focusMinutes={totalFocusMin}
        streak={streak}
      />

      {/* Drift Insight */}
      {(tasks.length > 0 || focusSessions.length > 0) && (
        <div className="px-5 mt-4">
          <DriftInsightCard tasks={tasks} focusSessions={focusSessions} timeBlocks={timeBlocks} />
        </div>
      )}

      {/* Habits Section */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Today's Habits
          </h2>
          <button
            onClick={() => setShowHabitForm(true)}
            className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {habits.length === 0 && (
            <button
              onClick={() => setShowHabitForm(true)}
              className="w-full py-7 rounded-2xl border-2 border-dashed border-border flex flex-col items-center gap-2 text-muted-foreground hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-medium">Add your first habit</span>
            </button>
          )}

          {habits.map((habit) => {
            const log = habitLogs.find((l) => l.habit_id === habit.id);
            return (
              <HabitCheckRow
                key={habit.id}
                habit={habit}
                log={log}
                onToggle={toggleHabit}
                onIncrement={incrementHabit}
              />
            );
          })}
        </div>
      </div>

      {/* Focus Blocks */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Focus Blocks
          </h2>
          <button
            onClick={() => setShowBlockForm(true)}
            className="h-7 w-7 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {timeBlocks.length === 0 && (
            <button
              onClick={() => setShowBlockForm(true)}
              className="w-full py-6 rounded-2xl border-2 border-dashed border-border flex flex-col items-center gap-2 text-muted-foreground hover:border-violet-500/30 hover:text-violet-400 transition-all"
            >
              <Layers className="h-4 w-4" />
              <span className="text-xs font-medium">Plan a focus block</span>
            </button>
          )}

          {timeBlocks.map((block) => (
            <TimeBlockRow key={block.id} block={block} onToggle={toggleBlock} />
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Today's Tasks
          </h2>
          <button
            onClick={() => setShowTaskForm(true)}
            className="h-7 w-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {tasks.length === 0 && (
            <button
              onClick={() => setShowTaskForm(true)}
              className="w-full py-7 rounded-2xl border-2 border-dashed border-border flex flex-col items-center gap-2 text-muted-foreground hover:border-blue-500/30 hover:text-blue-400 transition-all"
            >
              <Plus className="h-5 w-5" />
              <span className="text-xs font-medium">Plan your first task</span>
            </button>
          )}

          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </div>
      </div>

      {/* Focus Quick Access */}
      <div className="px-5 mt-6 mb-4">
        <Link
          to={createPageUrl("Focus")}
          className="flex items-center gap-4 px-5 py-4 bg-gradient-to-r from-violet-500/10 to-emerald-500/10 border border-border rounded-2xl hover:border-emerald-500/30 transition-all"
        >
          <div className="h-10 w-10 rounded-2xl bg-violet-500/20 flex items-center justify-center">
            <Timer className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Start a Focus Session</p>
            <p className="text-xs text-muted-foreground">
              {totalFocusMin > 0 ? `${totalFocusMin} minutes focused today` : "Deep work time"}
            </p>
          </div>
        </Link>
      </div>

      {showHabitForm && (
        <HabitFormSheet onSave={saveHabit} onClose={() => setShowHabitForm(false)} />
      )}

      {showTaskForm && (
        <TaskFormSheet onSave={saveTask} onClose={() => setShowTaskForm(false)} />
      )}

      {showBlockForm && (
        <TimeBlockFormSheet
          onSave={saveBlock}
          onClose={() => setShowBlockForm(false)}
          tasks={tasks}
          date={today}
        />
      )}
    </div>
  );
}