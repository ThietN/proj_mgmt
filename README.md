# DC12_PG3_MGMT – Web Management System

A premium, production-ready management dashboard for Senior Delivery Managers built with **Next.js 15**, **TypeScript**, **TailwindCSS**, and **Supabase (PostgreSQL)**.

---

## 🌟 Key Features

| Module | Latest Enhancements |
|---|---|
| 🧠 **Skill Matrix** | Heatmap matrix with **Horizontal Drag-to-Scroll**, **Excel Import/Export**, and **Insight Dashboard** (Gaps, Strengths, Advanced Ratios). |
| 👥 **Resources** | Engineer tracking with **At-Risk Marking System** (Orange highlighting + mitigation notes), real-time allocation metrics, and project assignment. |
| 📊 **Dashboard** | Executive KPI overview with real-time synchronization from Projects & Resources. |
| 🚀 **Hiring** | Candidate pipeline board + Intern progress tracker with automated metrics. |
| 📦 **Delivery** | Project health cards with milestone progress and billable headcount tracking. |
| 😊 **Feedback** | ESAT (Satisfactory) and CSAT (Customer) trend tracking with risk alerts. |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router / Edge Runtime ready)
- **Database**: Supabase (PostgreSQL) with integrated Migration System
- **Styling**: TailwindCSS + Premium Glassmorphism UI
- **Components**: Radix UI + Lucide Icons
- **Data Handling**: `xlsx` for Excel processing, `react-hot-toast` for notifications
- **Charts**: Recharts for dynamic multi-module analytics

---

## 🚀 Getting Started

### 1. Configure Environment
Create a `.env.local` or set Environment Variables in your hosting provider:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
DATABASE_URL=your_direct_postgres_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Migration
This project uses a custom migration system located in `/migrations`.
- **Manual**: Run the SQL scripts in `/migrations` directly in the Supabase SQL Editor.
- **CLI**: Run `npm run migrate` to apply pending changes locally.

### 3. Installation & Start
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Project Structure

```
ProjectMgmt/
├── app/                    # Next.js App Router & API Handlers
├── components/             # Reusable React Components
│   ├── skills/             # Advanced Matrix & Dashboards
│   ├── resources/          # Resource Management & Risk System
│   └── dashboard/          # Analytics & Visualizations
├── lib/                    # Supabase Client & Database Helpers
├── migrations/             # SQL Schema Versioning
├── types/                  # TypeScript Interfaces (Resource, Project, etc.)
└── scripts/                # Database Utilities (Migrate, Seed)
```

---

## 📊 Skill Matrix Workflow
1. **Define Skills**: Add skill columns in the dashboard.
2. **Import Data**: Bulk upload engineer levels via Excel (supports clearing skills via empty cells).
3. **Analyze**: Use the Insight Dashboard to identify critical team gaps and competency ratios.
4. **Maintenance**: Direct UI updates with immediate database persistence.

## ⚠️ Resource Risk Management
- **Mark as At Risk**: Open Actions -> Alert Icon to add mitigation notes.
- **Visual Feedback**: Risk resources are highlighted in **Orange** for immediate executive attention.
- **Resolution**: Mark back to "Normal" once the risk is addressed.

---

## ☁️ Deploying to Cloudflare Pages
1. Install `@opennextjs/cloudflare`.
2. Configure **Build Variables** in Cloudflare Dashboard (ensure `DATABASE_URL` is set for migrations).
3. Build command: `next build && opennextjs-cloudflare build --skipNextBuild`.

---

## License
MIT
