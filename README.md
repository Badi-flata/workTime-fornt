<p align="center">
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="silverRingGrad" x1="50" y1="82" x2="0" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="30%" stopColor="#94a3b8" />
        <stop offset="70%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#ffffff" />
      </linearGradient>
      <linearGradient id="emeraldRingGrad" x1="50" y1="22" x2="100" y2="82" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0f452f" />
        <stop offset="50%" stopColor="#1b7550" />
        <stop offset="100%" stopColor="#2bbb76" />
      </linearGradient>
      <linearGradient id="checkmarkGrad" x1="85" y1="22" x2="36" y2="58" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#105739" />
        <stop offset="100%" stopColor="#3cd18c" />
      </linearGradient>
      <filter id="logoShadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.1" />
      </filter>
    </defs>
    <g filter="url(#logoShadow)">
      <path d="M 50 82 A 30 30 0 0 1 50 22" stroke="url(#silverRingGrad)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 50 22 A 30 30 0 0 1 50 82" stroke="url(#emeraldRingGrad)" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="50" cy="27" r="1.5" fill="#94a3b8" />
      <circle cx="74" cy="52" r="1.5" fill="#1b7550" opacity="0.6" />
      <circle cx="50" cy="77" r="1.5" fill="#64748b" opacity="0.6" />
      <circle cx="26" cy="52" r="1.5" fill="#94a3b8" />
      <path d="M36,44 L50,58 L85,22" fill="none" stroke="url(#checkmarkGrad)" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="58" r="2.5" fill="#136141" />
    </g>
  </svg>
</p>

<h1 align="center">
  <span style="color: #1b7550;">WORK</span><span style="color: #1e1e1e;">TIME</span> — Frontend
</h1>
<p align="center" style="margin-top: -10px; font-weight: bold; color: #64748b;">
  منصة إدارة الحضور الذكية
</p>

<p align="center">
  A modern, RTL-first <strong>Attendance & Workforce Management Dashboard</strong> built with <strong>Next.js 14</strong>, <strong>TypeScript</strong>, <strong>Tailwind CSS v4</strong>, and <strong>Zustand</strong>.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#pages--screens">Pages</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#state-management">State</a> •
  <a href="#api-integration">API</a> •
  <a href="#license">License</a>
</p>

---

## Overview

**WorkTime Frontend** is the client-side application for a comprehensive employee attendance and departure tracking platform. It provides managers with a real-time interactive dashboard to monitor workforce attendance, manage departments and shifts, review employee excuses, and generate detailed periodic reports — all through a polished, Arabic RTL interface with smooth animations and modern design patterns.

---

## Features

### 📊 Manager Dashboard
- **Unified Dashboard Registry** with daily, weekly, and monthly view modes
- Interactive stat cards with hover animations showing present, absent, late, excused, and escaped counts
- Date navigation with custom date picker for historical data browsing
- Real-time data refresh with optimistic UI updates

### 🔴 Live Attendance Pulse
- Real-time monitoring of today's attendance status across all employees
- Live counters and visual indicators for workforce availability

### 📋 Attendance Reports
- Comprehensive attendance report tables with sorting and filtering
- Chronicle-style data tables with clean typography and hairline dividers
- Paginated records with configurable page sizes

### 👥 Employee Directory
- Searchable employee listing with profile cards
- Employee info modal with detailed profile, discipline rate, and attendance history
- Quick actions for adding/removing employees from management

### 🏢 Department & Shift Management
- Full CRUD interface for departments and shifts
- Visual shift cards with grace period configuration
- Department-employee relationship management

### 📈 Detailed Analytics
- **Discipline Rate** visualization with performance tier badges
- **General Evaluation Cards** with summarized statistics
- **Detailed Attendance Modals** with per-employee drill-down
- **Salary Deduction** preview with period-based calculations

### ⏰ Clock In/Out
- Employee self-service attendance interface
- Today's status display with shift timing information
- Excuse submission workflow (`IN` for late arrival, `OUT` for early departure)

### 🎨 Design System
- Custom Material Design 3–inspired color palette (primary: `#003527`, secondary: `#4059aa`)
- RTL-first layout with Arabic language support
- Three-font typography system: **DM Sans** (body), **Oswald** (headings), **Source Sans 3** (labels)
- Smooth micro-animations via Framer Motion
- Card hover pseudo-element effects with cubic-bezier transitions

---

## Tech Stack

| Layer              | Technology                                                           |
| :----------------- | :------------------------------------------------------------------- |
| **Framework**      | [Next.js](https://nextjs.org/) 14 (App Router)                      |
| **Language**       | [TypeScript](https://www.typescriptlang.org/)                        |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/) v4 + Custom CSS layers     |
| **State**          | [Zustand](https://zustand-demo.pmnd.rs/) v5                         |
| **HTTP Client**    | [Axios](https://axios-http.com/) with interceptors                   |
| **Charts**         | [Recharts](https://recharts.org/) v2                                 |
| **Animations**     | [Framer Motion](https://www.framer.com/motion/) v12                  |
| **Icons**          | [Lucide React](https://lucide.dev/)                                  |
| **Forms**          | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Date Handling**  | [date-fns](https://date-fns.org/) v4                                 |
| **Utilities**      | [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) |

---

## Architecture

The project follows Next.js 14 App Router conventions with a clean separation between pages, components, stores, and services:

```
src/
├── app/
│   ├── (main)/                        # Authenticated route group
│   │   ├── layout.tsx                 #   Dashboard shell + global modals
│   │   ├── dashboard/                 #   📊 Manager Dashboard (daily/weekly/monthly)
│   │   ├── attendance-reports/        #   📋 Attendance Reports & Tables
│   │   ├── attendance-log/            #   📝 Detailed Attendance Logs
│   │   ├── live-pulse/                #   🔴 Live Attendance Pulse
│   │   ├── employees/                 #   👥 Employee Directory
│   │   ├── employee-profile/          #   👤 Employee Profile View
│   │   ├── employee-dashboard/        #   📈 Employee Personal Dashboard
│   │   ├── departments/               #   🏢 Department & Shift Management
│   │   └── clock/                     #   ⏰ Clock In/Out Interface
│   ├── globals.css                    # Design system tokens & component styles
│   ├── layout.tsx                     # Root layout (fonts, RTL, metadata)
│   └── page.tsx                       # Landing / redirect
│
├── components/
│   ├── layout/                        # Structural components
│   │   ├── DashboardLayout.tsx        #   Main app shell
│   │   ├── Sidebar.tsx                #   Navigation sidebar
│   │   └── Topbar.tsx                 #   Top navigation bar
│   └── ui/                            # Reusable UI components
│       ├── ChronicleTable.tsx         #   Data table with clean styling
│       ├── DatePicker.tsx             #   Custom date navigation
│       ├── DetailedAttendanceModal.tsx#   Employee attendance drill-down
│       ├── EmployeeInfoModal.tsx      #   Employee profile modal
│       ├── GeneralEvaluationCard.tsx  #   Summary statistics card
│       ├── Logo.tsx                   #   Brand logo component
│       ├── StatCard.tsx               #   Dashboard stat card
│       └── StatisticEmployeesCard.tsx #   Employees statistics panel
│
├── store/                             # Zustand state stores
│   ├── useAuthStore.ts                #   Authentication state & JWT
│   ├── useCardStatsStore.ts           #   Card statistics data
│   ├── useCardUIStore.ts              #   Card/modal UI state
│   ├── useDashboardUIStore.ts         #   Dashboard view mode & navigation
│   ├── useGeneralStatsStore.ts        #   General statistics data
│   └── useRegistryFilterStore.ts      #   Registry filtering & pagination
│
├── services/
│   └── apiClient.ts                   # Axios instance + all API endpoints
│
└── types/
    └── dashboard-registry.types.ts    # TypeScript type definitions
```

---

## Pages & Screens

| Route                    | Screen                          | Description                                        |
| :----------------------- | :------------------------------ | :------------------------------------------------- |
| `/dashboard`             | Manager Dashboard               | Unified daily/weekly/monthly attendance overview    |
| `/attendance-reports`    | Attendance Reports              | Tabular attendance records with filters             |
| `/attendance-log`        | Detailed Attendance Log         | Per-employee detailed attendance history            |
| `/live-pulse`            | Live Attendance Pulse           | Real-time workforce attendance monitoring           |
| `/employees`             | Employee Directory              | Searchable employee listing with quick actions      |
| `/employee-profile`      | Employee Profile                | Individual employee details and settings            |
| `/employee-dashboard`    | Employee Personal Dashboard     | Personal attendance stats and discipline rate       |
| `/departments`           | Departments & Shifts            | Department and shift CRUD management                |
| `/clock`                 | Clock In/Out                    | Employee self-service attendance punch              |

---

## State Management

The application uses **Zustand v5** for lightweight, scalable state management with six purpose-specific stores:

| Store                      | Responsibility                                          |
| :------------------------- | :------------------------------------------------------ |
| `useAuthStore`             | JWT token storage, login/logout, authentication state   |
| `useDashboardUIStore`      | Active tab (daily/weekly/monthly), date anchor, navigation |
| `useCardUIStore`           | Modal visibility, pagination, column toggles, filters   |
| `useCardStatsStore`        | Fetched statistics data for cards and modals            |
| `useGeneralStatsStore`     | General dashboard statistics and summary data           |
| `useRegistryFilterStore`   | Registry table filters, search, sorting, and pagination |

---

## API Integration

All API communication is centralized in [`apiClient.ts`](src/services/apiClient.ts), which provides:

- **Axios instance** with configurable `NEXT_PUBLIC_API_URL` base URL
- **JWT interceptor** that automatically attaches `Bearer` tokens from the auth store
- **Typed API namespace** (`API.public`, `API.employee`, `API.managing`, `API.department`) mapping directly to backend endpoints

### API Namespaces

```typescript
API.public.loginIn(data)            // POST /users/loginIn
API.public.logUp(data)              // POST /users/logUp

API.employee.getProfile()           // GET  /employee/profile
API.employee.getTodayStatus()       // GET  /employee/today-status
API.attendance.checkIn()            // POST /attendance/check-in

API.managing.getDashboardRegistry() // GET  /managing/dashboard-registry
API.managing.getMyEmployees()       // GET  /managing/my-employees
API.managing.approveExcuse(id)      // POST /managing/approve-excuse/:id

API.department.getAll()             // GET  /department
API.department.create(data)         // POST /department
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** (bundled with Node.js)
- **WorkTime Backend** running at `http://localhost:3030` (see [backend README](../nestjs-prisma/README.md))

### 1. Clone the Repository

```bash
git clone https://github.com/Badi-flata/workTime-fornt.git
cd workTime-fornt
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3030
```

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## Available Scripts

| Script          | Description                               |
| :-------------- | :---------------------------------------- |
| `npm run dev`   | Start dev server with hot-reload          |
| `npm run build` | Create optimized production build         |
| `npm run start` | Serve the production build                |
| `npm run lint`  | Run ESLint checks                         |

---

## Design Tokens

The design system is built on custom CSS variables defined in `globals.css`:

| Token                         | Value       | Usage                      |
| :---------------------------- | :---------- | :------------------------- |
| `--color-primary`             | `#003527`   | Primary brand color        |
| `--color-primary-container`   | `#064e3b`   | Primary container fills    |
| `--color-primary-fixed-dim`   | `#95d3ba`   | Dimmed primary accents     |
| `--color-secondary`           | `#4059aa`   | Secondary action color     |
| `--color-error`               | `#ba1a1a`   | Error/destructive states   |
| `--color-surface`             | `#f8f9fa`   | Page background            |
| `--color-on-surface`          | `#191c1d`   | Primary text color         |
| `--font-sans`                 | DM Sans     | Body text                  |
| `--font-heading`              | Oswald      | Headings                   |
| `--font-label`                | Source Sans 3 | Labels and table headers |

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # Reusable UI & layout components
│   ├── store/                 # Zustand state stores
│   ├── services/              # API client & HTTP layer
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── next.config.mjs            # Next.js configuration
├── postcss.config.mjs         # PostCSS + Tailwind v4
├── tsconfig.json              # TypeScript configuration
├── .eslintrc.json             # ESLint configuration
└── package.json               # Dependencies & scripts
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Related

- **Backend API** — [WorkTime Backend (NestJS + Prisma)](../nestjs-prisma/README.md)

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ using <a href="https://nextjs.org/">Next.js</a>
</p>
