# YantraHub - e-Yantra Robotics Competition (eYRC) Team Workspace

A modern, polished, cloud-deployable team progress and project management platform built specifically for student robotics teams competing in the **e-Yantra Robotics Competition (eYRC)**.

Live Deployment: **[https://yantrahub.vercel.app](https://yantrahub.vercel.app)**

---

## 🌟 Core Features & Enhancements

### 1. Zero Fake Data Guarantee
- Workspace begins clean with only safe system configuration (official portal link & stage settings).
- All statistics, metrics, and progress percentages are dynamically computed from live PostgreSQL database records.
- Helpful, interactive empty states with direct `[+ Add ...]` actions across all sections.

### 2. Persistent Cloud Database & Safe Backup Engine
- **Cloud Database**: Powered by PostgreSQL with Prisma ORM (compatible with Supabase, Neon, Railway, and Vercel Postgres).
- **Manual Backups**: "Backup Now" triggers a complete snapshot, displaying live progress (`Creating backup...` → `Backup successful ✓`).
- **Automated Backups**: Scheduled backup endpoint (`/api/backup/auto`) for Vercel Cron or periodic automated snapshots.
- **Backup History**: Dedicated interface tracking Date, Time, Type (Manual / Automatic / Safety), Status, and Size.
- **Safe Restoration**:
  - Validates backup integrity before execution.
  - Automatically takes a `SAFETY_PRE_RESTORE` snapshot of the current state before applying changes.
  - Requires explicit typed confirmation (`RESTORE`) to prevent accidental data loss.

### 3. Multi-Format Data Portability & Export
Export team data anytime to share with mentors or archive:
- **Full JSON Archive**: Complete relational database snapshot (`/api/export?format=json`).
- **CSV Data Exports**:
  - `Tasks (CSV)`: Title, Priority, Status, Assignee, Category, Due Date
  - `Hardware Inventory (CSV)`: Component, Category, Quantity, Status, Location, Datasheet
  - `Meetings (CSV)`: Title, Date, Time, Agenda, Decisions, Action Items
  - `Class Schedules (CSV)`: Subject, Instructor, Date, Time, Meeting & Recording Links
  - `Notes & Docs (CSV)`: Title, Category, Tags, Content, Author
  - `Resources (CSV)`: Title, Category, URL, Bookmarks, Added By

### 4. Light & Dark Mode
- Theme selector supporting **Light**, **Dark**, and **System Preference**.
- Accessible toggle located in the top navigation header and Settings.
- Persisted in local storage with smooth color transitions (`transition-colors duration-200`).

### 5. Professional Frontend Polish & Micro-Interactions
- **Toast Notifications**: Floating real-time feedback for saves, updates, backups, restores, and exports.
- **Loading Skeletons**: Replaced blank spinners with shimmer card skeletons during data fetches.
- **Micro-Interactions**: Animated progress bars (0 to value), subtle hover elevations (`interactive-card`), button click feedback, and task completion indicators.
- **Accessibility**: Full compliance with `@media (prefers-reduced-motion: reduce)` to respect OS motion preferences.

---

## 🛠️ Architecture Overview

```
Frontend (Next.js 14/15 App Router + Tailwind CSS + Lucide Icons)
   │
   ▼
Serverless API Route Handlers (Next.js REST API with RBAC & Session JWT)
   │
   ▼
Database Layer (Prisma ORM Client)
   │
   ▼
Persistent Cloud PostgreSQL (Supabase / Neon / Vercel Postgres)
   │
   ├── Application Tables (Users, Tasks, Meetings, Classes, Hardware, Notes, etc.)
   └── Backup Table (BackupRecord versioned snapshots with checksum & auto-safety)
```

---

## 🚀 Environment Variables (`.env.example`)

```env
# Database Configuration (PostgreSQL connection string)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/[DB_NAME]?sslmode=require"

# Application URL & Auth Secret
NEXT_PUBLIC_APP_URL="https://yantrahub.vercel.app"
NEXTAUTH_URL="https://yantrahub.vercel.app"
JWT_SECRET="generate-a-secure-random-64-character-jwt-secret-key"

# Official e-Yantra Portal URL
NEXT_PUBLIC_EYANTRA_PORTAL_URL="https://portal.e-yantra.org"

# GitHub API Token (Optional - for rate limits & private repositories)
GITHUB_API_TOKEN=""

# Automated Cron Secret (Optional - for securing /api/backup/auto)
CRON_SECRET=""
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Push schema to database
npx prisma db push

# 3. Seed initial safe configuration (zero fake data)
node prisma/seed.js

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view your workspace.

---

## 📄 License
This project is open-source under the MIT License. Developed for student teams participating in the **e-Yantra Robotics Competition (eYRC)** by IIT Bombay.
