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
  Settings 
} from 'lucide-react';
import clsx from 'clsx';

// Navigation items mapped directly from workTime_screens
const navSections = [
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

  return (
    <aside className="w-[max(29% ,300)]: bg-surface-container-lowest border-l border-outline/20 flex flex-col h-screen font-sans shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-outline/20">
        <h1 className="text-xl font-heading font-bold text-primary tracking-wide">WorkTime</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-xs font-label font-bold text-on-surface-variant/60 uppercase tracking-wider">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary border-r-[3px] border-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    )}
                  >
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-outline/20 space-y-1">
        <Link 
          href="/settings" 
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          )}
        >
          <Settings size={18} />
          <span>الإعدادات</span>
        </Link>
      </div>
    </aside>
  );
}
