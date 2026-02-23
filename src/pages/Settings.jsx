import { useState, useEffect } from "react";
import {
  Bell,
  Shield,
  Download,
  User,
  Palette,
  Lock,
  FileJson,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";

import { listHabits } from "@/services/habits";
import { listHabitLogs } from "@/services/habitLogs";
import { listTasks } from "@/services/tasks";
import { listFocusSessions } from "@/services/focusSessions";
import { listDailySummaries } from "@/services/dailySummaries";

const ACCENT_COLORS = [
  { name: "Emerald", value: "#10B981" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Cyan", value: "#06B6D4" },
];

const SETTINGS_STORAGE_KEY = "grit_local_settings";
const LOCAL_USER_STORAGE_KEY = "grit_local_user";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState("22:00");
  const [quietHoursEnd, setQuietHoursEnd] = useState("08:00");
  const [accentColor, setAccentColor] = useState("#10B981");
  const [exportLoading, setExportLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Local/guest profile (replaces base44.auth.me())
    const defaultUser = {
      id: "local-user",
      full_name: "Nilson",
      email: "local@grit.app",
    };

    try {
      const storedUser = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
      const parsedUser = storedUser ? JSON.parse(storedUser) : defaultUser;
      setUser(parsedUser);

      // Ensure user exists in localStorage for future edits if needed
      if (!storedUser) {
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(defaultUser));
      }

      // Load local settings
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);

        if (typeof parsed.notifications === "boolean") {
          setNotifications(parsed.notifications);
        }
        if (parsed.quiet_hours_start) setQuietHoursStart(parsed.quiet_hours_start);
        if (parsed.quiet_hours_end) setQuietHoursEnd(parsed.quiet_hours_end);
        if (parsed.accent_color) setAccentColor(parsed.accent_color);
      }
    } catch (err) {
      console.error("Error loading local settings:", err);
      setErrorMessage("Failed to load local settings. Using defaults.");
      setUser(defaultUser);
    }
  }, []);

  const saveSettings = async () => {
    try {
      setErrorMessage("");

      // Local/guest settings persistence (replaces base44.auth.updateMe())
      const settingsPayload = {
        notifications,
        quiet_hours_start: quietHoursStart,
        quiet_hours_end: quietHoursEnd,
        accent_color: accentColor,
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsPayload));

      // Optional: update local user object so UI reflects settings-like profile fields if needed
      if (user) {
        const updatedUser = {
          ...user,
          notifications,
          quiet_hours_start: quietHoursStart,
          quiet_hours_end: quietHoursEnd,
          accent_color: accentColor,
        };
        localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setErrorMessage(err?.message || "Failed to save settings.");
    }
  };

  const exportData = async () => {
    try {
      setExportLoading(true);
      setErrorMessage("");

      const [habits, habitLogs, tasks, focusSessions, summaries] = await Promise.all([
        listHabits(),
        listHabitLogs(),
        listTasks(),
        listFocusSessions(),
        listDailySummaries(),
      ]);

      // mimic old limits/sorting behavior roughly
      const exportObj = {
        exported_at: moment().toISOString(),
        version: "1.0",
        source: "supabase-local-migration",
        settings: {
          notifications,
          quiet_hours_start: quietHoursStart,
          quiet_hours_end: quietHoursEnd,
          accent_color: accentColor,
        },
        user: user || null,
        data: {
          habits: habits || [],
          habitLogs: [...(habitLogs || [])]
            .sort((a, b) => (a.date > b.date ? -1 : 1))
            .slice(0, 500),
          tasks: [...(tasks || [])]
            .sort((a, b) => {
              const da = a.created_date || a.created_at || "";
              const db = b.created_date || b.created_at || "";
              return da > db ? -1 : 1;
            })
            .slice(0, 500),
          focusSessions: [...(focusSessions || [])]
            .sort((a, b) => (a.date > b.date ? -1 : 1))
            .slice(0, 500),
          dailySummaries: [...(summaries || [])]
            .sort((a, b) => (a.date > b.date ? -1 : 1))
            .slice(0, 365),
        },
      };

      const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `grit-export-${moment().format("YYYY-MM-DD")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting data:", err);
      setErrorMessage(err?.message || "Failed to export data.");
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div>
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Preferences & privacy</p>
      </div>

      {errorMessage && (
        <div className="px-5 mb-2">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Profile */}
      {user && (
        <Section title="Profile">
          <div className="flex items-center gap-4 px-4 py-3 bg-card rounded-2xl border border-border">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <User className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">{user.full_name || "Grit User"}</p>
              <p className="text-xs text-muted-foreground">{user.email || "local@grit.app"}</p>
            </div>
          </div>
        </Section>
      )}

      {/* Notifications */}
      <Section title="Notifications">
        <SettingRow
          icon={Bell}
          label="Enable Notifications"
          description="Get reminders for habits & tasks"
          right={<Toggle value={notifications} onChange={setNotifications} />}
        />

        {notifications && (
          <div className="px-4 py-3 bg-card rounded-2xl border border-border space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quiet Hours
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-1">From</label>
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="w-full bg-accent/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-1">To</label>
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="w-full bg-accent/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="px-4 py-3 bg-card rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium">Accent Color</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setAccentColor(c.value)}
                title={c.name}
                className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center transition-all",
                  accentColor === c.value && "ring-2 ring-offset-2 ring-offset-background ring-white"
                )}
                style={{ backgroundColor: c.value }}
              >
                {accentColor === c.value && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Security">
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          <div className="px-4 py-3">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Privacy-First Design</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your app data lives in your Supabase project. This local build does not depend on
                  Base44 services anymore.
                </p>
              </div>
            </div>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-start gap-3">
              <Lock className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Data Ownership</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You own your data entirely. Export it anytime as JSON below.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Data */}
      <Section title="Data Management">
        <button
          onClick={exportData}
          disabled={exportLoading}
          className="w-full flex items-center gap-3 px-4 py-3 bg-card rounded-2xl border border-border hover:bg-accent/50 transition-all disabled:opacity-70"
        >
          <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <FileJson className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-medium">Export All Data</p>
            <p className="text-xs text-muted-foreground">Download as JSON file</p>
          </div>
          {exportLoading ? (
            <div className="h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </Section>

      {/* About */}
      <Section title="About">
        <div className="px-4 py-3 bg-card rounded-2xl border border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <div>
              <p className="text-sm font-semibold">Grit</p>
              <p className="text-xs text-muted-foreground">
                Version 1.0 · Privacy-forward productivity
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            Grit helps you understand why plans fail, not just whether they did. Plan → Do → Review
            → Improve.
          </p>
        </div>
      </Section>

      {/* Save */}
      <div className="px-5 mb-8">
        <button
          onClick={saveSettings}
          className={cn(
            "w-full h-12 rounded-2xl font-medium text-sm transition-all",
            saved
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
          )}
        >
          {saved ? "✓ Saved" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="px-5 mt-5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, description, right }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card rounded-2xl border border-border">
      <div className="h-8 w-8 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {right}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        "h-6 w-11 rounded-full transition-colors p-0.5 flex items-center flex-shrink-0",
        value ? "bg-emerald-500 justify-end" : "bg-border justify-start"
      )}
    >
      <div className="h-5 w-5 rounded-full bg-white shadow transition-all" />
    </button>
  );
}