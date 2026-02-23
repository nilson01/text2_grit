import os
from pathlib import Path

ROOT = Path(".").resolve()

# ---- Project tree ----
dirs = [
    "entities",
    "src/api",
    "src/components/calendar",
    "src/components/focus",
    "src/components/forms",
    "src/components/today",
    "src/components/ui",
    "src/hooks",
    "src/lib",
    "src/pages",
    "src/utils",
]

files = {
    # root config/files
    ".gitignore": "node_modules\ndist\n.vscode/\n.env\n",
    "README.md": "# Grit\n\nReact + Vite scaffold for Grit productivity app.\n",
    "index.html": """<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Grit</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
""",
    "package.json": """{
  "name": "grit",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.14",
    "vite": "^5.4.10"
  }
}
""",
    "vite.config.js": """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
""",
    "tailwind.config.js": """export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: { extend: {} },
  plugins: []
}
""",
    "postcss.config.js": """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
""",
    "eslint.config.js": "export default []\n",
    "jsconfig.json": """{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
""",
    "components.json": """{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
""",

    # entities
    "entities/Achievement.js": "export default class Achievement {}\n",
    "entities/DailySummary.js": "export default class DailySummary {}\n",
    "entities/FocusSession.js": "export default class FocusSession {}\n",
    "entities/Habit.js": "export default class Habit {}\n",
    "entities/HabitLog.js": "export default class HabitLog {}\n",
    "entities/Task.js": "export default class Task {}\n",
    "entities/TimeBlock.js": "export default class TimeBlock {}\n",

    # src core app files
    "src/main.jsx": """import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
""",
    "src/App.jsx": """import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout'
import Today from './pages/Today'
import Habits from './pages/Habits'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Focus from './pages/Focus'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import PageNotFound from './lib/PageNotFound'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<Today />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Layout>
  )
}
""",
    "src/Layout.jsx": """import BottomTabBar from './components/BottomTabBar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-4">{children}</main>
      <BottomTabBar />
    </div>
  )
}
""",
    "src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

body { margin: 0; font-family: Inter, system-ui, sans-serif; }
""",
    "src/globals.css": """:root { color-scheme: dark; }\n""",
    "src/pages.config.js": "export default ['today','habits','tasks','calendar','focus','analytics','settings']\n",

    # src/api + lib + hooks + utils
    "src/api/base44Client.js": """export const base44Client = {
  get: async () => ({ ok: true }),
  post: async () => ({ ok: true })
}
export default base44Client
""",
    "src/hooks/use-mobile.jsx": """import { useEffect, useState } from 'react'
export default function useMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isMobile
}
""",
    "src/lib/app-params.js": "export const APP_NAME = 'Grit'\n",
    "src/lib/AuthContext.jsx": """import { createContext, useContext, useMemo } from 'react'
const AuthContext = createContext({ user: null })
export const AuthProvider = ({ children }) => {
  const value = useMemo(() => ({ user: null }), [])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
""",
    "src/lib/NavigationTracker.jsx": "export default function NavigationTracker(){ return null }\n",
    "src/lib/PageNotFound.jsx": "export default function PageNotFound(){ return <div>Page not found</div> }\n",
    "src/lib/query-client.js": "export const queryClient = {}\n",
    "src/lib/utils.js": """export function cn(...parts) { return parts.filter(Boolean).join(' ') }
""",
    "src/utils/index.ts": "export const noop = () => {}\n",

    # pages
    "src/pages/Today.jsx": """import GreetingHeader from '@/components/today/GreetingHeader'
import QuickStats from '@/components/today/QuickStats'
import DriftInsightCard from '@/components/today/DriftInsightCard'
export default function Today(){ return <div className='space-y-4'><GreetingHeader /><QuickStats /><DriftInsightCard /></div> }
""",
    "src/pages/Habits.jsx": "export default function Habits(){ return <div>Habits</div> }\n",
    "src/pages/Tasks.jsx": "export default function Tasks(){ return <div>Tasks</div> }\n",
    "src/pages/Calendar.jsx": "import HeatmapCalendar from '@/components/calendar/HeatmapCalendar'; export default function Calendar(){ return <HeatmapCalendar /> }\n",
    "src/pages/Focus.jsx": "import FocusTimer from '@/components/focus/FocusTimer'; export default function Focus(){ return <FocusTimer /> }\n",
    "src/pages/Analytics.jsx": "export default function Analytics(){ return <div>Analytics</div> }\n",
    "src/pages/Settings.jsx": "export default function Settings(){ return <div>Settings</div> }\n",

    # feature components
    "src/components/BottomTabBar.jsx": """import { Link, useLocation } from 'react-router-dom'
const tabs=[['/today','Today'],['/habits','Habits'],['/tasks','Tasks'],['/calendar','Calendar'],['/focus','Focus']]
export default function BottomTabBar(){ const {pathname}=useLocation(); return <nav className='fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900'><div className='mx-auto flex max-w-4xl justify-around py-2'>{tabs.map(([to,label])=><Link key={to} to={to} className={pathname===to?'text-white':'text-slate-400'}>{label}</Link>)}</div></nav> }
""",
    "src/components/UserNotRegisteredError.jsx": "export default function UserNotRegisteredError(){ return <div>User not registered</div> }\n",

    # calendar components
    "src/components/calendar/DaySummarySheet.jsx": "export default function DaySummarySheet(){ return <div>Day Summary Sheet</div> }\n",
    "src/components/calendar/HeatmapCalendar.jsx": "export default function HeatmapCalendar(){ return <div>Heatmap Calendar</div> }\n",
    "src/components/calendar/WeekView.jsx": "export default function WeekView(){ return <div>Week View</div> }\n",
    "src/components/calendar/YearView.jsx": "export default function YearView(){ return <div>Year View</div> }\n",

    # focus components
    "src/components/focus/FocusTimer.jsx": "export default function FocusTimer(){ return <div>Focus Timer</div> }\n",
    "src/components/focus/PomodoroTimer.jsx": "export default function PomodoroTimer(){ return <div>Pomodoro Timer</div> }\n",

    # forms
    "src/components/forms/HabitFormSheet.jsx": "export default function HabitFormSheet(){ return <div>Habit Form</div> }\n",
    "src/components/forms/TaskFormSheet.jsx": "export default function TaskFormSheet(){ return <div>Task Form</div> }\n",
    "src/components/forms/TimeBlockFormSheet.jsx": "export default function TimeBlockFormSheet(){ return <div>TimeBlock Form</div> }\n",

    # today components
    "src/components/today/DriftInsightCard.jsx": "export default function DriftInsightCard(){ return <div>Drift Insight</div> }\n",
    "src/components/today/GreetingHeader.jsx": "export default function GreetingHeader(){ return <h1 className='text-2xl font-bold'>Grit</h1> }\n",
    "src/components/today/HabitCheckRow.jsx": "export default function HabitCheckRow(){ return <div>Habit Row</div> }\n",
    "src/components/today/QuickStats.jsx": "export default function QuickStats(){ return <div>Quick Stats</div> }\n",
    "src/components/today/TaskRow.jsx": "export default function TaskRow(){ return <div>Task Row</div> }\n",
    "src/components/today/TimeBlockRow.jsx": "export default function TimeBlockRow(){ return <div>TimeBlock Row</div> }\n",
}

# shadcn-style UI file list
ui_files = [
    "accordion","alert-dialog","alert","aspect-ratio","avatar","badge","breadcrumb","button","calendar","card","carousel","chart","checkbox",
    "collapsible","command","context-menu","dialog","drawer","dropdown-menu","form","hover-card","input-otp","input","label","menubar",
    "navigation-menu","pagination","popover","progress","radio-group","resizable","scroll-area","select","separator","sheet","sidebar","skeleton",
    "slider","sonner","switch","table","tabs","textarea","toast","toaster","toggle-group","toggle","tooltip","use-toast"
]

for name in ui_files:
    comp_name = "".join(part.capitalize() for part in name.replace("-", " ").split())
    files[f"src/components/ui/{name}.jsx"] = f"export default function {comp_name}(){{ return null }}\n"

# ---- Create dirs ----
for d in dirs:
    (ROOT / d).mkdir(parents=True, exist_ok=True)

# ---- Write files ----
for rel_path, content in files.items():
    path = ROOT / rel_path
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
      path.write_text(content, encoding="utf-8")
    else:
      # don't overwrite existing files
      print(f"Skipped existing: {rel_path}")

print("✅ Grit scaffold created.")
print("Next steps:")
print("1) npm install")
print("2) npm run dev")