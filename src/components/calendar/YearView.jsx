import moment from "moment";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const levelColors = [
  "bg-muted/40",
  "bg-red-500/50",
  "bg-amber-500/50",
  "bg-emerald-500/50",
  "bg-emerald-500",
];

export default function YearView({ summaries, onDayClick }) {
  const [year, setYear] = useState(moment().year());

  const summaryMap = useMemo(() => {
    const m = {};
    (summaries || []).forEach((s) => { m[s.date] = s; });
    return m;
  }, [summaries]);

  const today = moment().format("YYYY-MM-DD");

  // Build week columns (GitHub-style)
  const weeks = useMemo(() => {
    const start = moment({ year }).startOf("year").startOf("week");
    const end = moment({ year }).endOf("year").endOf("week");
    const result = [];
    let cur = moment(start);
    while (cur.isSameOrBefore(end)) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        week.push(moment(cur));
        cur.add(1, "day");
      }
      result.push(week);
    }
    return result;
  }, [year]);

  // Month labels
  const monthLabels = useMemo(() => {
    const labels = [];
    for (let m = 0; m < 12; m++) {
      const firstDay = moment({ year, month: m, day: 1 });
      const weekIdx = Math.floor(firstDay.diff(moment({ year }).startOf("year").startOf("week"), "weeks"));
      labels.push({ label: firstDay.format("MMM"), weekIdx });
    }
    return labels;
  }, [year]);

  const totalActive = Object.values(summaryMap).filter(
    (s) => s.date.startsWith(year) && (s.color_level || 0) > 0
  ).length;
  const perfect = Object.values(summaryMap).filter(
    (s) => s.date.startsWith(year) && s.color_level === 4
  ).length;

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setYear(y => y - 1)}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">{year}</span>
        <button onClick={() => setYear(y => y + 1)}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Month labels */}
      <div className="relative ml-6 mb-1 overflow-hidden">
        <div className="flex" style={{ gap: "2px" }}>
          {weeks.map((_, wi) => {
            const monthLabel = monthLabels.find((m) => m.weekIdx === wi);
            return (
              <div key={wi} style={{ width: 10, flexShrink: 0 }}>
                {monthLabel && (
                  <span className="text-[8px] text-muted-foreground whitespace-nowrap">{monthLabel.label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Day-of-week labels + grid */}
      <div className="flex gap-1">
        {/* DOW labels */}
        <div className="flex flex-col gap-0.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="h-[10px] w-5 flex items-center justify-end">
              {i % 2 === 1 && <span className="text-[7px] text-muted-foreground">{d}</span>}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="flex gap-0.5 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day) => {
                const dateStr = day.format("YYYY-MM-DD");
                const s = summaryMap[dateStr];
                const level = s?.color_level || 0;
                const inYear = day.year() === year;
                const isToday = dateStr === today;
                return (
                  <button
                    key={dateStr}
                    onClick={() => inYear && onDayClick?.(dateStr)}
                    title={dateStr}
                    className={cn(
                      "h-[10px] w-[10px] rounded-sm transition-all",
                      inYear ? levelColors[level] : "opacity-0 pointer-events-none",
                      isToday && "ring-1 ring-emerald-400"
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Year stats */}
      <div className="mt-4 flex gap-3">
        <div className="flex-1 bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-400">{totalActive}</p>
          <p className="text-[10px] text-muted-foreground">Active days</p>
        </div>
        <div className="flex-1 bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-emerald-500">{perfect}</p>
          <p className="text-[10px] text-muted-foreground">Perfect days</p>
        </div>
        <div className="flex-1 bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{365 - totalActive}</p>
          <p className="text-[10px] text-muted-foreground">Rest days</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        <span className="text-[9px] text-muted-foreground mr-1">Less</span>
        {levelColors.map((c, i) => (
          <div key={i} className={cn("h-2.5 w-2.5 rounded-sm", c)} />
        ))}
        <span className="text-[9px] text-muted-foreground ml-1">More</span>
      </div>
    </div>
  );
}