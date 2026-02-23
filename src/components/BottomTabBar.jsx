import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Target, ListTodo, CalendarDays, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "Today", icon: Home, page: "Today" },
  { name: "Habits", icon: Target, page: "Habits" },
  { name: "Tasks", icon: ListTodo, page: "Tasks" },
  { name: "Calendar", icon: CalendarDays, page: "Calendar" },
  { name: "Insights", icon: BarChart3, page: "Analytics" },
  { name: "Settings", icon: Settings, page: "Settings" },
];

export default function BottomTabBar({ currentPage }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 pt-2 pb-6">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.page;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              to={createPageUrl(tab.page)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200",
                isActive
                  ? "text-emerald-500"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}