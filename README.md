# Grit (Supabase Local Version)

This is the **Supabase-backed local version** of the Grit app (originally generated with Base44, now migrated to run independently).

## About

Grit is a productivity app for planning, focus, habits, and daily review.

This version runs locally using:

- **React + Vite** (frontend)
- **Supabase** (database/backend)

Base44-specific backend dependencies and integrations have been removed.

---

## Prerequisites

Before running the app, make sure you have:

1. **Node.js** installed (recommended: Node 18+)
2. A **Supabase project** created
3. The required Supabase tables created (`tasks`, `habits`, `habit_logs`, `time_blocks`, `focus_sessions`, `daily_summaries`, `achievements`)

---

## Setup

### 1) Clone the repository

```bash
git clone https://github.com/nilson01/test_grit.git
cd test_grit