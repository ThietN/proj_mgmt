# DC12_PG3_MGMT – Web Management System

A clean, production-ready management dashboard for Senior Delivery Managers built with **Next.js 14**, **TypeScript**, **TailwindCSS**, and **JSON file storage**.

---

## Features

| Module | Description |
|---|---|
| 📊 Dashboard | Executive KPI overview with 5 charts |
| 👥 Resources | Engineer tracking, allocation, risk flags |
| 🚀 Hiring | Pipeline board + intern progress tracker |
| 🧠 Skills | Capability matrix heatmap + gap detection |
| 📦 Delivery | Project health cards with milestone progress |
| 😊 ESAT | Employee satisfaction trend + team comparison |
| ⭐ CSAT | Customer satisfaction scores + risk alerts |
| 💡 Innovations | Internal initiative tracker with impact scores |

---

## Tech Stack

- **Frontend + Backend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + custom CSS variables
- **Charts**: Recharts
- **Storage**: JSON files in `/data` folder
- **Hosting**: Vercel-ready

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
ProjectMgmt/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Executive Dashboard
│   ├── resources/page.tsx  # Resource Management
│   ├── hiring/page.tsx     # Hiring & Interns
│   ├── skills/page.tsx     # Skills Matrix
│   ├── delivery/page.tsx   # Delivery Tracking
│   ├── esat/page.tsx       # ESAT
│   ├── csat/page.tsx       # CSAT
│   ├── innovations/page.tsx# Innovation Initiatives
│   └── api/                # API Routes (GET + POST)
│       ├── resources/
│       ├── projects/
│       ├── hiring/
│       ├── skills/
│       ├── esat/
│       ├── csat/
│       └── innovations/
├── components/             # React Components
│   ├── layout/             # Sidebar, Topbar
│   ├── ui/                 # KpiCard, StatusBadge
│   ├── dashboard/          # DashboardCharts
│   ├── resources/          # ResourcesClient
│   ├── hiring/             # HiringClient
│   ├── skills/             # SkillsClient
│   ├── delivery/           # DeliveryClient
│   ├── esat/               # ESATClient
│   ├── csat/               # CSATClient
│   └── innovations/        # InnovationsClient
├── data/                   # JSON data files
│   ├── resources.json      # 12 employees
│   ├── projects.json       # 6 projects
│   ├── hiring.json         # 8 candidates/interns
│   ├── skills.json         # Skill matrix
│   ├── esat.json           # ESAT records
│   ├── csat.json           # CSAT records
│   └── innovations.json    # Innovation initiatives
├── lib/
│   ├── data.ts             # JSON read/write utilities
│   └── utils.ts            # cn() utility
└── types/index.ts          # TypeScript interfaces
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/resources` | List all resources |
| POST | `/api/resources` | Add a resource |
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Add a project |
| GET | `/api/hiring` | List candidates/interns |
| POST | `/api/hiring` | Add a candidate |
| GET | `/api/skills` | Skill matrix entries |
| POST | `/api/skills` | Add skill entry |
| GET | `/api/esat` | ESAT records |
| POST | `/api/esat` | Add ESAT record |
| GET | `/api/csat` | CSAT records |
| POST | `/api/csat` | Add CSAT record |
| GET | `/api/innovations` | Innovation initiatives |
| POST | `/api/innovations` | Add initiative |

---

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repository
4. Framework: **Next.js** (auto-detected)
5. Click **Deploy**

> ⚠️ Note: JSON file writes are not persistent on Vercel's serverless functions. For production writes, upgrade to **Vercel KV** or **Vercel Blob** storage. For a read-only dashboard (common use case), JSON files work perfectly.

---

## Customizing Data

Edit the JSON files in `/data/`:

```json
// data/resources.json
[
  {
    "employee_id": "E013",
    "name": "Your Engineer Name",
    "role": "Senior Engineer",
    "team": "Your Team",
    "grade": "L4",
    "skills": ["React", "Node.js"],
    "english_level": "B2",
    "status": "Billable",
    "allocation_percentage": 100,
    "join_date": "2024-06-01",
    "risk_flag": null
  }
]
```

---

## License

MIT
