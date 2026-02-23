import { Target, ListTodo, Timer, TrendingUp } from "lucide-react";

export default function QuickStats({ habits, tasks, focusMinutes, streak }) {
  const stats = [
    {
      label: "Habits",
      value: habits,
      icon: Target,
      color: "bg-emerald-500/10 text-emerald-400",
    },
    {
      label: "Tasks",
      value: tasks,
      icon: ListTodo,
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      label: "Focus",
      value: `${focusMinutes}m`,
      icon: Timer,
      color: "bg-violet-500/10 text-violet-400",
    },
    {
      label: "Streak",
      value: streak,
      icon: TrendingUp,
      color: "bg-amber-500/10 text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 px-5 py-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-card border border-border"
        >
          <div className={`p-1.5 rounded-lg ${s.color}`}>
            <s.icon className="h-3.5 w-3.5" />
          </div>
          <span className="text-base font-semibold">{s.value}</span>
          <span className="text-[10px] text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  );
}