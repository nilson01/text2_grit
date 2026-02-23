import { useState, useEffect, useCallback } from "react";
import moment from "moment";
import FocusTimer from "@/components/focus/FocusTimer";
import PomodoroTimer from "@/components/focus/PomodoroTimer";
import { Clock, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";

import { listFocusSessions, createFocusSession } from "@/services/focusSessions";
import { listTasks } from "@/services/tasks";
import { listHabits } from "@/services/habits";

const MODES = [
  { key: "simple", label: "Timer" },
  { key: "pomodoro", label: "Pomodoro" },
];

export default function Focus() {
  const [sessions, setSessions] = useState([]);
  const [mode, setMode] = useState("simple");
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [linkedTaskId, setLinkedTaskId] = useState("");
  const [linkedHabitId, setLinkedHabitId] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const today = moment().format("YYYY-MM-DD");

  const loadFocusData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [allSessions, allTasks, allHabits] = await Promise.all([
        listFocusSessions(),
        listTasks(),
        listHabits(),
      ]);

      // Match previous Base44 filters
      const todaysSessions = (allSessions || []).filter((s) => s.date === today);

      const todaysOpenTasks = (allTasks || []).filter(
        (t) => t.planned_date === today && !t.completed
      );

      const activeDurationHabits = (allHabits || []).filter(
        (h) => h.is_active === true && h.habit_type === "duration"
      );

      setSessions(todaysSessions);
      setTasks(todaysOpenTasks);
      setHabits(activeDurationHabits);
    } catch (err) {
      console.error("Error loading focus page data:", err);
      setErrorMessage(err?.message || "Failed to load focus data.");
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadFocusData();
  }, [loadFocusData]);

  const handleComplete = async (minutes) => {
    try {
      setErrorMessage("");

      await createFocusSession({
        date: today,
        duration_minutes: minutes,
        task_id: linkedTaskId || null,
        habit_id: linkedHabitId || null,
      });

      // Refresh today's sessions after insert
      const allSessions = await listFocusSessions();
      const todaysSessions = (allSessions || []).filter((s) => s.date === today);
      setSessions(todaysSessions);
    } catch (err) {
      console.error("Error creating focus session:", err);
      setErrorMessage(err?.message || "Failed to save focus session.");
    }
  };

  const totalMinutes = sessions.reduce((sum, f) => sum + (f.duration_minutes || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Focus</h1>
          <p className="text-sm text-muted-foreground">Deep work, distraction-free</p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Zap className="h-3.5 w-3.5" />
          <span className="text-sm font-semibold">{totalMinutes}m today</span>
        </div>
      </div>

      {errorMessage && (
        <div className="px-5 mb-3">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Mode selector */}
      <div className="px-5 mb-6 flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
              mode === m.key
                ? "bg-foreground text-background"
                : "bg-card border border-border text-muted-foreground"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Link to task/habit */}
      <div className="px-5 mb-6 space-y-2">
        {tasks.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-2xl">
            <Target className="h-4 w-4 text-blue-400 flex-shrink-0" />
            <select
              value={linkedTaskId}
              onChange={(e) => setLinkedTaskId(e.target.value)}
              className="flex-1 bg-transparent text-xs focus:outline-none"
            >
              <option value="">Link to a task (optional)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {habits.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-2xl">
            <Target className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <select
              value={linkedHabitId}
              onChange={(e) => setLinkedHabitId(e.target.value)}
              className="flex-1 bg-transparent text-xs focus:outline-none"
            >
              <option value="">Link to a habit (optional)</option>
              {habits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-center pb-10">
        {mode === "simple" ? (
          <FocusTimer onComplete={handleComplete} />
        ) : (
          <PomodoroTimer
            onPhaseComplete={(phase, minutes) => {
              if (phase === "Focus") handleComplete(minutes);
            }}
          />
        )}
      </div>

      {/* Today's sessions */}
      <div className="px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Today's Sessions
        </h2>

        {sessions.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No sessions yet today</p>
          </div>
        )}

        <div className="space-y-2">
          {sessions.map((session) => {
            const linkedTask = tasks.find((t) => t.id === session.task_id);

            return (
              <div
                key={session.id}
                className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-2xl"
              >
                <div className="h-8 w-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-violet-400" />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium">{session.duration_minutes} minutes</p>
                  <p className="text-[10px] text-muted-foreground">
                    {moment(session.created_date || session.created_at).format("h:mm A")}
                    {linkedTask ? ` · ${linkedTask.title}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}