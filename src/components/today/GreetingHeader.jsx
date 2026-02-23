import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

export default function GreetingHeader() {
  const [name, setName] = useState("");

  useEffect(() => {
    // Local/guest mode fallback
    // We can later replace this with a profile service or localStorage value
    // setName("Nilson");
    setName(localStorage.getItem("grit_user_name") || "Nilson");
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="px-5 pt-14 pb-2">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-emerald-400" />
        <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
          Grit
        </span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">
        {greeting}{name ? `, ${name}` : ""}
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}