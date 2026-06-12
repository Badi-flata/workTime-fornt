"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList,
  UserCircle,
  Clock,
  Activity,
  Building2,
  Settings,
  X,
  Menu
} from 'lucide-react';
import clsx from 'clsx';
import { useCardUIStore } from '@/store/useCardUIStore';

// Navigation items exported for shared use with mobile Topbar menu
export const navSections = [
  {
    label: 'الرئيسية',
    items: [
      { 
        href: '/dashboard', 
        label: 'لوحة التحكم الرئيسية', 
        icon: LayoutDashboard,
        screen: 'Manager_Dashboard_Main' 
      },
      { 
        href: '/attendance-reports', 
        label: 'سجلات الحضور', 
        icon: ClipboardList,
        screen: 'Attendance_Reports_Dashboard_Main' 
      },
      { 
        href: '/live-pulse', 
        label: 'نبض الحضور الحي', 
        icon: Activity,
        screen: 'Live_Attendance_Pulse' 
      },
    ]
  },
  {
    label: 'الموظفين',
    items: [
      { 
        href: '/employees', 
        label: 'دليل الموظفين', 
        icon: Users,
        screen: 'Employees_Directory' 
      },
      { 
        href: '/employee-profile', 
        label: 'الملف الشخصي', 
        icon: UserCircle,
        screen: 'Employee_Profile' 
      },
      { 
        href: '/employee-dashboard', 
        label: 'لوحة تحكم الموظف', 
        icon: LayoutDashboard,
        screen: 'Employee_Personal_Dashboard' 
      },
      {
        href: '/attendance-log',
        label: 'سجل الحضور التفصيلي',
        icon: ClipboardList,
        screen: 'Detailed_Attendance_Log'
      },
    ]
  },
  {
    label: 'العمليات',
    items: [
      { 
        href: '/clock', 
        label: 'تسجيل الحضور والانصراف', 
        icon: Clock,
        screen: 'Clock_In_Out_Screen' 
      },
      { 
        href: '/departments', 
        label: 'الأقسام والورديات', 
        icon: Building2,
        screen: 'Departments_Shifts_Management' 
      },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useCardUIStore();

  return (
    <aside 
      className={clsx(
        "h-full bg-white border-l shadow-2xl shadow-amber-50  border-outline/15  flex-col font-sans shrink-0 transition-all duration-300 ease-in-out hidden md:flex",
        // Fluid sizing using Tailwind arbitrary properties with clamp() and max()
        isSidebarCollapsed ? "w-[80px]" : "w-[clamp(280px,18vw,320px)]"
      )}
    >
      {/* ── HEADER & COLLAPSE BUTTON ── */}
     

      {/* ── NAVIGATION SECTIONS ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {
        !isSidebarCollapsed ? (
          <>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg relative right-[40%] shadow shadow-slate-400  hover:bg-slate-400/40 hover:text-white text-on-surface-variant transition-colors"
              title="تقليص القائمة"
            >
             <X size={30} /> 
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1.5 relative left-[-10%] rounded-lg shadow shadow-slate-400 justify-self-center hover:bg-primary/45 hover:text-white text-on-surface-variant transition-colors"
            title="توسيع القائمة"
          >
            <Menu size={30} />
          </button>
        )}
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3 mb-1 text-[11px] font-label font-bold text-on-surface-variant/50 uppercase tracking-wider select-none">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={clsx(
                      'rounded-lg text-sm font-medium transition-all duration-200 flex items-center select-none',
                      isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                      isActive
                        ? 'bg-primary/10 text-primary border-r-[3px] border-primary font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface'
                    )}
                  >
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                    {!isSidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── FOOTER & SETTINGS ── */}
      <div className="p-3 border-t  border-outline/15 shrink-0">
        <Link 
          href="/settings" 
          title="الإعدادات"
          className={clsx(
            'rounded-lg text-sm font-medium transition-all duration-200 flex items-center select-none',
            isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary border-r-[3px] border-primary font-bold'
              : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface'
          )}
        >
          <Settings size={18} className="shrink-0" />
          {!isSidebarCollapsed && <span>الإعدادات</span>}
        </Link>
      </div>
    </aside>
  );
}
