import { useState, useEffect, useCallback } from "react";
import HeatmapCalendar from "@/components/calendar/HeatmapCalendar";
import WeekView from "@/components/calendar/WeekView";
import YearView from "@/components/calendar/YearView";
import DaySummarySheet from "@/components/calendar/DaySummarySheet";
import { cn } from "@/lib/utils";

import { listDailySummaries } from "@/services/dailySummaries";
import { listTasks } from "@/services/tasks";

const VIEWS = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "year", label: "Year" },
];

export default function Calendar() {
  const [summaries, setSummaries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [view, setView] = useState("month");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const allSummaries = await listDailySummaries();

      // Match previous behavior: list("-date", 400)
      const sortedLimited = (allSummaries || [])
        .sort((a, b) => (a.date > b.date ? -1 : 1))
        .slice(0, 400);

      setSummaries(sortedLimited);
    } catch (err) {
      console.error("Error loading calendar summaries:", err);
      setErrorMessage(err?.message || "Failed to load calendar data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  const handleDayClick = async (dateStr) => {
    try {
      setErrorMessage("");

      const summary = summaries.find((s) => s.date === dateStr) || null;

      // Current service only has listTasks(), so filter locally
      const allTasks = await listTasks();
      const tasksForDay = (allTasks || []).filter((t) => t.planned_date === dateStr);

      setSelectedDate(dateStr);
      setSelectedSummary(summary);
      setSelectedTasks(tasksForDay);
    } catch (err) {
      console.error("Error loading day details:", err);
      setErrorMessage(err?.message || "Failed to load selected day details.");
    }
  };

  // Stats (same logic as before)
  const planDays = summaries.filter((s) => (s.tasks_created_count || 0) > 0).length;
  const greatDays = summaries.filter((s) => (s.color_level || 0) >= 3).length;
  const noPlanDays = summaries.filter((s) => (s.tasks_created_count || 0) === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Tap any day to review it — no-plan days are gray, not failures
        </p>
      </div>

      {errorMessage && (
        <div className="px-5 mb-3">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {errorMessage}
          </div>
        </div>
      )}

      {/* View switcher */}
      <div className="px-5 mb-4 flex gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              view === v.key
                ? "bg-foreground text-background"
                : "bg-card border border-border text-muted-foreground"
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "month" && <HeatmapCalendar summaries={summaries} onDayClick={handleDayClick} />}
      {view === "week" && <WeekView summaries={summaries} onDayClick={handleDayClick} />}
      {view === "year" && <YearView summaries={summaries} onDayClick={handleDayClick} />}

      {/* Summary strip */}
      {view === "month" && (
        <div className="px-5 mt-5">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-card border border-border rounded-2xl p-3 text-center">
              <p className="text-base font-bold text-emerald-400">{greatDays}</p>
              <p className="text-[10px] text-muted-foreground">Great days</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-3 text-center">
              <p className="text-base font-bold text-blue-400">{planDays}</p>
              <p className="text-[10px] text-muted-foreground">Planned</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-3 text-center">
              <p className="text-base font-bold text-muted-foreground">{noPlanDays}</p>
              <p className="text-[10px] text-muted-foreground">Rest days</p>
            </div>
          </div>
        </div>
      )}

      {selectedDate && (
        <DaySummarySheet
          date={selectedDate}
          summary={selectedSummary}
          tasks={selectedTasks}
          onClose={() => {
            setSelectedDate(null);
            setSelectedSummary(null);
            setSelectedTasks([]);
          }}
        />
      )}
    </div>
  );
}