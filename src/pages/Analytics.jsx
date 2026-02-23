import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";
import { Target, ListTodo, Timer, TrendingUp, Award, Flame, Zap } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";

import { listDailySummaries } from "@/services/dailySummaries";
import { listAchievements } from "@/services/achievements";
import { listHabits } from "@/services/habits";

const VIEWS = [
  { key: "week", label: "7 Days", days: 7 },
  { key: "month", label: "30 Days", days: 30 },
  { key: "quarter", label: "90 Days", days: 90 },
];

export default function Analytics() {
  const [summaries, setSummaries] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [habits, setHabits] = useState([]);
  const [view, setView] = useState("week");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [allSummaries, allAchievements, allHabits] = await Promise.all([
        listDailySummaries(),
        listAchievements(),
        listHabits(),
      ]);

      // Match previous behavior:
      // DailySummary.list("-date", 90)
      const summariesSorted = (allSummaries || [])
        .sort((a, b) => (a.date > b.date ? -1 : 1))
        .slice(0, 90);

      // Achievement.filter({ unlocked: true })
      const unlockedAchievements = (allAchievements || []).filter((a) => a.unlocked === true);

      // Habit.filter({ is_active: true })
      const activeHabits = (allHabits || []).filter((h) => h.is_active === true);

      setSummaries(summariesSorted);
      setAchievements(unlockedAchievements);
      setHabits(activeHabits); // kept for parity/future use
    } catch (err) {
      console.error("Error loading analytics data:", err);
      setErrorMessage(err?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const days = VIEWS.find((v) => v.key === view)?.days || 7;

  const chartData = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = moment().subtract(i, "days").format("YYYY-MM-DD");
    const s = summaries.find((x) => x.date === d);

    chartData.push({
      date: moment(d).format(days <= 7 ? "ddd" : "M/D"),
      completion: s?.completion_rate || 0,
      tasks: s?.tasks_completed_count || 0,
      focus: s?.focus_session_minutes || 0,
    });
  }

  const filteredSums = summaries.filter((s) =>
    moment(s.date).isAfter(moment().subtract(days, "days"))
  );

  const totalTasks = filteredSums.reduce((sum, d) => sum + (d.tasks_completed_count || 0), 0);
  const totalFocus = filteredSums.reduce((sum, d) => sum + (d.focus_session_minutes || 0), 0);

  const avgCompletion =
    filteredSums.length > 0
      ? Math.round(
          filteredSums.reduce((sum, d) => sum + (d.completion_rate || 0), 0) / filteredSums.length
        )
      : 0;

  const bestStreak = (() => {
    let max = 0;
    let cur = 0;

    const sorted = [...summaries].sort((a, b) => (a.date > b.date ? 1 : -1));

    for (const s of sorted) {
      if ((s.completion_rate || 0) > 0) {
        cur++;
        max = Math.max(max, cur);
      } else {
        cur = 0;
      }
    }
    return max;
  })();

  // Overplanning detection
  const overplannedDays = filteredSums.filter(
    (s) => (s.planned_minutes || 0) > 480 && (s.completion_rate || 0) < 50
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
        <p className="text-sm text-muted-foreground">
          Understand your patterns, improve your plan
        </p>
      </div>

      {errorMessage && (
        <div className="px-5 mt-2">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Period selector */}
      <div className="px-5 mt-3 flex gap-2">
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

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 px-5 mt-5">
        <StatCard
          icon={ListTodo}
          label="Tasks Completed"
          value={totalTasks}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <StatCard
          icon={Timer}
          label="Focus Minutes"
          value={totalFocus}
          color="text-violet-400"
          bg="bg-violet-500/10"
        />
        <StatCard
          icon={Target}
          label="Avg Completion"
          value={`${avgCompletion}%`}
          color="text-emerald-400"
          bg="bg-emerald-500/10"
        />
        <StatCard
          icon={Flame}
          label="Best Streak"
          value={`${bestStreak}d`}
          color="text-amber-400"
          bg="bg-amber-500/10"
        />
      </div>

      {/* Drift / pattern insights */}
      {(overplannedDays > 0 || totalFocus === 0) && (
        <div className="px-5 mt-5 space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Patterns
          </h3>

          {overplannedDays > 0 && (
            <div className="flex gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
              <TrendingUp className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Overplanning detected</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {overplannedDays} days with 8h+ planned but under 50% completion. Try capping
                  daily tasks at 3–5.
                </p>
              </div>
            </div>
          )}

          {totalFocus === 0 && totalTasks > 3 && (
            <div className="flex gap-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4">
              <Timer className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">No focus sessions this period</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Focused work sessions correlate with higher task completion. Try the Focus tab.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion Chart */}
      <div className="px-5 mt-5">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Completion Rate
        </h3>
        <div className="bg-card border border-border rounded-2xl p-4 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="completion" stroke="#10B981" fill="url(#cg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Focus Chart */}
      <div className="px-5 mt-4">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Focus Minutes
        </h3>
        <div className="bg-card border border-border rounded-2xl p-4 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="focus" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tasks Chart */}
      <div className="px-5 mt-4">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Tasks Completed
        </h3>
        <div className="bg-card border border-border rounded-2xl p-4 h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "hsl(215, 20%, 65%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-5 mt-6 mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Achievements
        </h3>

        {achievements.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground bg-card border border-border rounded-2xl">
            <Award className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Complete streaks and milestones to earn badges</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              First badge unlocks at 3-day streak
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-2xl p-4 text-center"
              >
                <span className="text-2xl">{a.icon || "🏆"}</span>
                <span className="text-xs font-medium leading-tight">{a.title}</span>
                {a.unlocked_date && (
                  <span className="text-[9px] text-muted-foreground">
                    {moment(a.unlocked_date).format("MMM D")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className={`h-8 w-8 rounded-xl ${bg} flex items-center justify-center mb-2`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}