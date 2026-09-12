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
  منصة إدارة الحضور والانضباط الذكية
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
  <a href="#release-history">Release History</a> •
  <a href="#license">License</a>
</p>

---

## Overview

**WorkTime Frontend** is the client-side application for a comprehensive employee attendance, departure tracking, and workforce intelligence platform.

It empowers organization managers with a real-time interactive dashboard to monitor team attendance, manage departments and custom shifts, review employee excuses, customize deduction rules, and run live interactive demo shifts — all through a polished, Arabic RTL interface with smooth micro-animations and robust design tokens.

---

## Features

### 📊 Manager Dashboard & Unified Registry
- **Unified Dashboard Registry** supporting daily, weekly, and monthly view modes.
- Interactive stat cards with animated hover depth showing present, absent, late, excused, and escaped metrics.
- Date navigation with custom date-range selection and active shift prioritization.
- Live workforce attendance pulse with instant optimistic UI feedback.

### ⏱️ Interactive 10-Minute Demo Shift Simulation
- **Isolated Live Simulation Engine**: Experience the full attendance cycle in an accelerated 10-minute shift (1-min prep, 7-min work, and grace periods).
- **Dynamic Countdown Timer (`ShiftCountdown`)**: Real-time visual progress ring with dynamic status messages (Shift Not Started, Normal In, Late In, Work Time, Normal Out, Grace Out).
- **Simulation Actions & Automatic Process**: Live check-in/out triggers, auto check-out automation, and simulated excuse submission.

### 🏢 Department & Shift Management with Operational Rules
- Full CRUD interface for departments and shifts with manager-specific scoping.
- **Operational Rules Configuration**: Set monthly working days (`monthlyWorkingDays`), weekend days array, and custom penalty amounts for late, early leave, and absent statuses.
- Shift timing configuration with arrival grace period (`gracePeriodMinIn`) and departure grace period (`gracePeriodMinOut`).

### ⚙️ Manager Automation & Deduction Controls (`/settings`)
- Granular toggles for auto check-out, late deductions, early leave deductions, and absent deductions.
- Option to combine multiple daily deductions into a single end-of-shift deduction or apply prioritized deductions.

### 👥 Team Directory & Employee Management (`/my-employees-list`)
- Dedicated managed team list for managers with search, department filtering, and pagination.
- **Employee Profile Card Modal**: Detailed drill-down showing discipline rate, salary, contact info, assigned shift, and full attendance history.
- Department transfer actions for reassigning subordinates across teams and shifts.

### 📈 Employee Personal Dashboard (`/employee-dashboard`)
- Responsive bento-grid layout showing personal attendance records, monthly working days progress, and salary deductions.
- **Discipline Rate Gauge**: Visual tier badges (Excellent ≥ 95%, Good ≥ 85%, Fair ≥ 70%).
- Quick access to excuse submission and shift timetable.

### 👤 Profile & Avatar Management (`/my-profile`)
- Profile picture uploads and avatar synchronization with backend storage.
- Personal information management and password change.

### 🔒 Enterprise Security & Silent Auth
- **Silent Refresh with Request Queueing**: Automatically refreshes expired access tokens in the background without user disruption.
- **Role-Based Auth Guard (`AuthGuard`)**: Seamless client-side route protection for `SUPER_ADMIN`, `MANAGER`, and `EMPLOYEE`.

### 🎨 RTL Design System
- Material Design 3–inspired color system (primary: `#003527`, secondary: `#4059aa`).
- Native RTL layout with Arabic language support.
- Three-tier typography: **DM Sans**, **Oswald**, and **Source Sans 3**.
- Smooth micro-animations powered by Framer Motion.

---

## Tech Stack

| Layer              | Technology                                                           |
| :----------------- | :------------------------------------------------------------------- |
| **Framework**      | [Next.js](https://nextjs.org/) 14 (App Router)                      |
| **Language**       | [TypeScript](https://www.typescriptlang.org/)                        |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/) v4 + Custom CSS Layers    |
| **State**          | [Zustand](https://zustand-demo.pmnd.rs/) v5                         |
| **HTTP Client**    | [Axios](https://axios-http.com/) with interceptors & request queue   |
| **Animations**     | [Framer Motion](https://www.framer.com/motion/) v12                  |
| **Icons**          | [Lucide React](https://lucide.dev/)                                  |
| **Forms**          | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Date Handling**  | [date-fns](https://date-fns.org/) + `date-fns-tz`                   |
| **Utilities**      | [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) |

---

## Architecture

```
src/
├── app/
│   ├── (main)/                               # Protected application shell
│   │   ├── layout.tsx                        #   Dashboard shell with Topbar & Sidebar
│   │   ├── manager-dashboard/                #   📊 Manager Dashboard (Registry, Metrics, Live Pulse)
│   │   ├── attendance-departure-check/       #   ⏱️ Clock In/Out & 10-Minute Demo Simulation
│   │   ├── departments/                      #   🏢 Department & Shift Management + Operational Rules
│   │   ├── my-employees-list/                #   👥 Managed Team Directory & Profile Modals
│   │   ├── employee-dashboard/               #   📈 Employee Personal Dashboard (Bento Grid)
│   │   ├── my-profile/                       #   👤 User Profile & Avatar Management
│   │   ├── search/                           #   🔍 Global Workforce Search
│   │   └── settings/                         #   ⚙️ Manager Automation & Deduction Preferences
│   ├── login/                                # 🔑 Authentication (Sign In)
│   ├── signup/                               # 📝 User Registration (Sign Up)
│   ├── globals.css                           # Design system tokens & component utility layers
│   └── layout.tsx                            # Root HTML layout with RTL metadata & fonts
│
├── components/
│   ├── layout/                               # Structural layouts & global shells
│   │   ├── Sidebar.tsx                       #   Responsive navigation sidebar with role-aware links
│   │   ├── Topbar.tsx                        #   Header bar with notifications, profile dropdown & theme
│   │   ├── AuthGuard.tsx                     #   Role-based route protection & auth state hydration
│   │   └── AutomaticProcess.tsx              #   Background simulation controller
│   └── ui/                                   # Reusable UI components
│       ├── ChronicleTable.tsx                #   Data table with clean typography & hairline dividers
│       ├── ShiftCountdown.tsx                #   Real-time shift simulation ring & countdown
│       ├── EmployeeInfoCardModal.tsx         #   Detailed employee drill-down modal
│       ├── StatistcEmployeesCard.tsx         #   Employee statistics card panel
│       ├── EmployeesLest.tsx                 #   Subordinate selection list component
│       └── UserAvatar.tsx                    #   Image avatar with fallback initial monogram
│
├── store/                                    # Zustand state stores
│   ├── useAuthStore.ts                       #   Authentication tokens, user info & refresh lifecycle
│   ├── useCheckAttendStore.ts                #   Clock in/out state & interactive demo shift engine
│   ├── useDeptShiftStore.ts                  #   Departments, shifts & operational rules state
│   ├── useDirectoryStore.ts                  #   Global employee search & directory listings
│   ├── useEmployeeRecordStore.ts             #   Employee detailed attendance records
│   ├── useProfileStore.ts                    #   Profile editing & avatar upload state
│   ├── useSettingStore.ts                    #   Manager automation toggles & deduction controls
│   └── useCardUIStore.ts                     #   Card & modal view states
│
├── services/
│   ├── apiClient.ts                          # Axios client with silent refresh queue & typed APIs
│   └── errorHandler.ts                       # Standardized user-friendly error alerts
│
├── utils/
│   ├── shiftTimingEngine.ts                  # Real-time shift math, stage calculation & countdowns
│   └── imageUrl.ts                           # Avatar URL resolver (local / uploads / absolute)
│
└── types/                                    # TypeScript interfaces & DTO models
```

---

## Pages & Screens

| Route                           | Screen                          | Description                                                        |
| :------------------------------ | :------------------------------ | :----------------------------------------------------------------- |
| `/manager-dashboard`            | Manager Dashboard               | Unified daily/weekly/monthly registry, metrics & live status       |
| `/attendance-departure-check`   | Attendance & Departure Check    | Clock in/out with isolated 10-minute interactive demo simulation  |
| `/departments`                  | Departments & Shifts            | Department CRUD, shifts, and operational penalty rules             |
| `/my-employees-list`            | Team Directory                  | Managed subordinates list, profile inspection & department transfer|
| `/employee-dashboard`           | Employee Dashboard              | Personal attendance stats, discipline percentage & bento grid      |
| `/my-profile`                   | User Profile                    | Profile details management & avatar image upload                   |
| `/search`                       | Search Directory                | Workforce search with live filtering                               |
| `/settings`                     | Manager Settings                | Automation toggles (Auto checkout, combined deductions)            |
| `/login`                        | Sign In                         | Secure authentication with JWT & refresh token storage             |
| `/signup`                       | Sign Up                         | New account registration with role selection                       |

---

## State Management

The application utilizes **Zustand v5** with focused, decoupled stores:

| Store                     | Responsibility                                                     |
| :------------------------ | :----------------------------------------------------------------- |
| `useAuthStore`            | Authentication tokens, user credentials, role detection & refresh  |
| `useCheckAttendStore`     | Active attendance status, demo shift lifecycle & clock in/out state|
| `useDeptShiftStore`       | Department listing, active shifts, working days & penalty settings |
| `useDirectoryStore`       | Search queries, directory results & pagination                     |
| `useEmployeeRecordStore`  | Selected employee detailed records and attendance drill-down       |
| `useProfileStore`         | Profile update mutations, avatar preview & upload state            |
| `useSettingStore`         | Manager automation preferences & deduction combinations            |
| `useCardUIStore`          | UI modals, card visibility, and navigation tabs                    |

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** package manager
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

### 3. Configure Environment Variables

Copy the example configuration:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3030
```

### 4. Start Development Server

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
| `npm run dev`   | Start development server with hot-reload  |
| `npm run build` | Create optimized production bundle        |
| `npm run start` | Serve production build locally            |
| `npm run lint`  | Run ESLint checks across project          |

---

## Release History

### 🚀 v4.0.0 — Unified System Release & Interactive Simulation Engine
- **Interactive Shift Simulation Engine**: Integrated `shiftTimingEngine.ts`, `ShiftCountdown.tsx`, and `AutomaticProcess.tsx` for live 10-minute demo shift testing.
- **Department Operational Rules UI**: Added working days configuration, custom weekends, and status penalty inputs in `/departments`.
- **Manager Automation Settings**: New `/settings` page with granular deduction switches and end-of-shift combination toggles.
- **Standardized Route Restructuring**: Renamed misspelled directories to `/my-employees-list` and `/search` with updated navigation links.
- **Profile Media Presentation**: Added `UserAvatar` and updated modal cards (`EmployeeInfoCardModal`, `StatistcEmployeesCard`, `ChronicleTable`).
- **Silent Refresh & Request Queue**: Enhanced `apiClient.ts` with transparent token refreshing and request retries.

### 📦 v3.5.0 — Client Optimization & Bento Grid Architecture
- **Responsive Bento Grid**: Redesigned `/employee-dashboard` into an interactive bento-grid layout with live evaluations.
- **Role-Based Navigation**: Dynamic sidebar navigation adapting seamlessly between `SUPER_ADMIN`, `MANAGER`, and `EMPLOYEE`.
- **Search Directory**: Searchable directory page with live filtering and employee modal inspection.
- **UI Architecture & Theme**: Standardized Tailwind CSS layers and color tokens.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<p align="center">
  Built with ❤️ using <a href="https://nextjs.org/">Next.js</a>
</p>
