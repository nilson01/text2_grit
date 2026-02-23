import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";

const levelColors = [
  "bg-muted",                          // 0 - no plan (neutral)
  "bg-red-500/40",                      // 1 - 1-39%
  "bg-amber-500/40",                    // 2 - 40-69%
  "bg-emerald-500/40",                  // 3 - 70-99%
  "bg-emerald-500",                     // 4 - 100%
];

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function HeatmapCalendar({ summaries, onDayClick }) {
  const [month, setMonth] = useState(moment().startOf("month"));

  const summaryMap = useMemo(() => {
    const map = {};
    (summaries || []).forEach((s) => {
      map[s.date] = s;
    });
    return map;
  }, [summaries]);

  const weeks = useMemo(() => {
    const start = moment(month).startOf("week");
    const end = moment(month).endOf("month").endOf("week");
    const rows = [];
    let current = moment(start);
    while (current.isSameOrBefore(end)) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(moment(current));
        current.add(1, "day");
      }
      rows.push(week);
    }
    return rows;
  }, [month]);

  const today = moment().format("YYYY-MM-DD");

  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMonth(moment(month).subtract(1, "month"))}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold">
          {month.format("MMMM YYYY")}
        </h3>
        <button
          onClick={() => setMonth(moment(month).add(1, "month"))}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((d, i) => (
          <div
            key={i}
            className="h-8 flex items-center justify-center text-[10px] text-muted-foreground font-medium"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const dateStr = day.format("YYYY-MM-DD");
              const isCurrentMonth = day.month() === month.month();
              const isToday = dateStr === today;
              const summary = summaryMap[dateStr];
              const level = summary?.color_level || 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => onDayClick?.(dateStr)}
                  className={cn(
                    "h-10 rounded-xl flex items-center justify-center text-xs font-medium transition-all",
                    !isCurrentMonth && "opacity-20",
                    isToday && "ring-2 ring-emerald-400 ring-offset-1 ring-offset-background",
                    levelColors[level]
                  )}
                >
                  {day.date()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        <span className="text-[10px] text-muted-foreground mr-1">Less</span>
        {levelColors.map((c, i) => (
          <div key={i} className={cn("h-3 w-3 rounded-sm", c)} />
        ))}
        <span className="text-[10px] text-muted-foreground ml-1">More</span>
      </div>
    </div>
  );
}