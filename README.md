# e-Yantra Robotics Competition (eYRC) Team Progress Platform

A real, clean, functional, cloud-deployable team progress and project management platform built specifically for student robotics teams competing in the **e-Yantra Robotics Competition (eYRC)**.

---

## 🌟 Key Principles & Highlights

1. **Zero Fake Data Architecture**:
   - Initial database begins clean with only essential system configuration and the official e-Yantra portal link.
   - Shows clean, helpful empty states (`"No tasks added yet"`, `"No upcoming meetings"`, etc.) with direct `[+ Add ...]` actions.
   - No fake tasks, fake deadlines, fake lectures, or dummy metrics.
2. **Real Backend & Persistent Database**:
   - Built on Next.js 14/15 App Router (TypeScript) with Prisma ORM.
   - Zero-config local development with SQLite (`dev.db`).
   - Production PostgreSQL ready with dedicated schemas for **Supabase**, **Neon**, **Railway**, and **Vercel Postgres**.
3. **Role-Based Access Control (RBAC)**:
   - **Admin**: Add/manage team members, assign tasks, schedule classes & meetings, configure GitHub API tokens, update stage settings, and export database backups.
   - **Team Member**: View workspace, update assigned tasks, add notes & resources, convert meeting action items, and track self-study progress.
4. **14 Dedicated Workspace Modules**:
   - **Dashboard**: Real-time calculated metrics, upcoming timeline, live activity audit feed, quick action triggers.
   - **Class Schedule**: Official e-Yantra sessions, workshops, time, Google Meet/YouTube live links, and recordings.
   - **Team Meetings**: Internal agendas, meeting notes, decisions, and **1-Click Convert Action Items to Tasks**.
   - **Task Board**: Interactive Kanban and List table views with multi-filters (assignee, priority, status, category), deadlines, and relational links (related lectures, notes, hardware, git repos).
   - **Lectures Library**: Slide links, recordings, notes, and completion tracking.
   - **Notes System**: Searchable Markdown documentation with code blocks, tags, categories, and file attachments.
   - **Self Study**: Individual & team learning roadmaps with status tracking.
   - **Git Repository Integration**: Live GitHub REST API integration for repository statistics, commits, branches, issues, PRs, and contributors.
   - **Tech Stack**: Tracking robotics frameworks (ROS 2, Gazebo, FreeRTOS, OpenCV) with documentation links.
   - **Hardware Inventory**: Component catalog, categories, quantities, conditions, lab locations, and datasheets.
   - **Themes**: Official e-Yantra theme specifications vs. Team feasibility evaluations and strategy.
   - **Resources**: Centralized bookmarks for papers, tutorials, PDFs, and uploaded files.
   - **e-Yantra Hub**: Direct portal launch link (`https://portal.e-yantra.org`), stage progression tracker, and rules repository.
   - **Settings / Admin**: Member management, roles, GitHub tokens, competition stage settings, and JSON database export.
5. **Global Search (`⌘K` / `Ctrl+K`)**: Instant search across tasks, notes, meetings, lectures, hardware, tech stack, and themes.

---

## 🛠️ Tech Stack & Architecture

```
e-Yantra Platform
├── Frontend: React 18/19, Next.js App Router, Tailwind CSS, Lucide Icons
├── Backend: Next.js API Routes & Server Engine
├── Database ORM: Prisma ORM
│   ├── Local Development: SQLite (file:./dev.db)
│   └── Cloud Deployment: PostgreSQL (Supabase / Neon / Railway)
├── Authentication: Session-based HTTP-only JWT cookies with bcrypt password hashing
├── Storage: Multi-format file uploader (/public/uploads or cloud bucket adapter)
└── Integrations: Official e-Yantra Portal, GitHub REST API
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm** or **pnpm**

### 2. Clone & Install Dependencies
```bash
git clone <repository-url>
cd e-Yantra

# Install dependencies
npm install
```

### 3. Initialize Database & Seed Safe Config
```bash
# Push Prisma schema to SQLite
npx prisma db push

# Seed initial system configuration (zero fake data)
node prisma/seed.js
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
On initial setup, visit `/signup` to register your primary **Workspace Admin** account.

---

## ☁️ Cloud Deployment (Vercel + Supabase PostgreSQL)

### 1. Setup Supabase PostgreSQL
1. Create a project at [supabase.com](https://supabase.com).
2. Copy your Connection String from **Project Settings → Database → Connection string (URI)**.
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
   ```

### 2. Configure Prisma for PostgreSQL
To switch from SQLite to PostgreSQL for cloud deployment, set `provider = "postgresql"` in `prisma/schema.prisma` or use `prisma/schema.postgresql.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Push schema to your cloud database:
```bash
DATABASE_URL="postgresql://..." npx prisma db push
DATABASE_URL="postgresql://..." node prisma/seed.js
```

### 3. Deploy to Vercel
1. Push this repository to GitHub.
2. Import project in [vercel.com](https://vercel.com).
3. Add Environment Variables:
   - `DATABASE_URL`: `postgresql://...`
   - `JWT_SECRET`: A long secure random string
   - `NEXT_PUBLIC_APP_URL`: `https://your-app.vercel.app`
   - `NEXT_PUBLIC_EYANTRA_PORTAL_URL`: `https://portal.e-yantra.org`
   - `GITHUB_API_TOKEN`: (Optional) GitHub personal access token for high API rate limits
4. Click **Deploy**.

---

## 📁 Directory Structure

```
c:\e-Yantra
├── prisma/
│   ├── schema.prisma              # SQLite development schema
│   ├── schema.postgresql.prisma   # PostgreSQL cloud production schema
│   └── seed.js                    # Zero-fake-data system config seeder
├── public/
│   └── uploads/                   # Uploaded attachments & datasheets
├── src/
│   ├── app/
│   │   ├── api/                   # RESTful API endpoints with RBAC
│   │   │   ├── auth/              # login, register, logout, me
│   │   │   ├── tasks/             # CRUD, filters, relations
│   │   │   ├── classes/           # schedule, recordings
│   │   │   ├── meetings/          # agendas, minutes, convert action items
│   │   │   ├── lectures/          # slides, completion tracking
│   │   │   ├── notes/             # markdown documentation
│   │   │   ├── self-study/        # individual learning roadmaps
│   │   │   ├── git/               # live GitHub API integration
│   │   │   ├── tech-stack/        # robotics tools & libraries
│   │   │   ├── hardware/          # inventory & location tracking
│   │   │   ├── themes/            # official info vs team strategy
│   │   │   ├── resources/         # bookmarks & documents
│   │   │   ├── settings/          # team members & credentials
│   │   │   ├── search/            # global search across all tables
│   │   │   ├── upload/            # multipart file storage
│   │   │   ├── export/            # JSON database backup exporter
│   │   │   └── dashboard/         # live calculated metrics & timeline
│   │   ├── dashboard/             # Main dashboard page
│   │   ├── classes/               # Class schedule view
│   │   ├── meetings/              # Team meetings view
│   │   ├── tasks/                 # Task Kanban & List views
│   │   ├── lectures/              # Lectures library
│   │   ├── notes/                 # Team notes system
│   │   ├── self-study/            # Self-study tracker
│   │   ├── git/                   # Live Git repository view
│   │   ├── tech-stack/            # Tech stack catalog
│   │   ├── hardware/              # Hardware inventory
│   │   ├── themes/                # e-Yantra themes
│   │   ├── resources/             # Resource library
│   │   ├── e-yantra/              # Official e-Yantra hub
│   │   ├── settings/              # Workspace & Admin settings
│   │   ├── login/                 # Login page
│   │   ├── signup/                # Admin setup & member sign up
│   │   ├── globals.css            # Design tokens & styling
│   │   └── layout.tsx             # Root layout with AuthProvider & AppShell
│   ├── components/
│   │   ├── layout/                # Sidebar, Header, AppShell
│   │   └── ui/                    # Modal, EmptyState, SearchModal, QuickActionModal
│   ├── context/
│   │   └── AuthContext.tsx        # Authentication React context
│   └── lib/
│       ├── prisma.ts              # Prisma singleton client
│       ├── auth.ts                # Session JWT & RBAC guards
│       ├── activity.ts            # Audit logger
│       ├── github.ts              # Live GitHub API client
│       ├── utils.ts               # Date helpers & cn class merge
│       └── types.ts               # TypeScript types
├── .env.example
├── next.config.mjs
├── tailwind.config.js
└── package.json
```

---

## 🔒 Security & Data Integrity

- **Password Hashing**: Stored with `bcryptjs` (salt rounds: 10).
- **Session Protection**: HTTP-only, secure, SameSite cookies.
- **Server-Side RBAC**: Role verification enforced directly in backend API routes (cannot be bypassed by modifying client-side code).
- **Data Export & Backups**: One-click complete JSON backup download from `/settings` for team archiving.

---

## 📄 License
This project is open-source under the MIT License. Developed for student teams participating in the **e-Yantra Robotics Competition (eYRC)** by IIT Bombay.
