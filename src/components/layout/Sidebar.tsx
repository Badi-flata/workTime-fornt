"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList,
  UserCircle,
  Building2,
  Settings,
  X,
  Menu,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { useCardUIStore } from '@/store/useCardUIStore';
import { useAuthStore } from '@/store/useAuthStore';

// Navigation items exported for shared use with mobile Topbar menu
export const navSections = [

 {  role: "SUPER_ADMIN",
    screens: [
        {
          label: 'الرئيسية',
          items: [
            { 
              href: '/manager-dashboard', 
              label: 'لوحة التحكم الإدرية', 
              icon: LayoutDashboard,
              screen: 'Manager_Dashboard_Main' 
            },
            { 
              href: '/employee-dashboard', 
              label: 'لوحة التحكم الوظفية', 
              icon: LayoutDashboard,
              screen: 'Employee_Personal_Dashboard' 
            },
            { 
              href: '/attendance-departure-check', 
              label: 'سجلات الحضور والانصراف', 
              icon: ClipboardList,
              screen: 'Attendance_Departure_Check' 
            },
            { 
              href: '/searsh', 
              label: 'البحث الشامل', 
              icon: Users,
              screen: 'Employees_Directory' 
            },
          ]
        },

        {
          label: 'العمليات',
          items: [
            { 
              href: '/departments', 
              label: 'الأقسام والورديات', 
              icon: Building2,
              screen: 'Departments_Shifts_Management' 
            },
            {
              href: '/my-employees-lest',
              label: 'تفاصيل الموظفين',
              icon: Users,
              screen: 'My_Employees'
            },
           
          ]
        },
  ]

},
  { role: "MANAGER",
    screens: [
          {
          label: 'الرئيسية',
          items: [
            { 
              href: '/manager-dashboard', 
              label: 'لوحة التحكم الإدرية', 
              icon: LayoutDashboard,
              screen: 'Manager_Dashboard_Main' 
            },
            
            {
              href: '/my-employees-lest',
              label: 'تفاصيل الموظفين',
              icon: Users,
              screen: 'My_Employees_Lest'
            },
           
          ]
        },

        {
          label: 'العمليات',
          items: [
             { 
              href: '/searsh', 
              label: 'البحث الشامل', 
              icon: Users,
              screen: 'Employees_Directory' 
            },
            
            { 
              href: '/departments', 
              label: 'الأقسام والورديات', 
              icon: Building2,
              screen: 'Departments_Shifts_Management' 
            },
           
          ]
        },
  ],
},
  { role: "EMPLOYEE",
    screens: [
          {
            label: ' العمليات ',
            items: [
              { 
                href: '/employee-dashboard', 
                label: 'لوحة التحكم الوظفية', 
                icon: LayoutDashboard,
                screen: 'Employee_Personal_Dashboard' 
              },
              { 
                href: '/attendance-departure-check', 
                label: 'سجلات الحضور والانصراف', 
                icon: ClipboardList,
                screen: 'Attendance_Departure_Check' 
              },
              { 
                href: '/searsh', 
                label: 'البحث الشامل', 
                icon: Users,
                screen: 'Employees_Directory' 
              },

            ],
            
          },
  ],
},




];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useCardUIStore();
  const {user ,logout} = useAuthStore();
 const userRole = user?.role ? user?.role : "EMPLOYEE"
 const navSrceens = navSections.find((section) => section.role === userRole)?.screens;
 

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
        {navSrceens?.map((section) => (
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
          href='/my-profile' 
          title="الملف الشخصي"
          className={clsx(
            'rounded-lg text-sm font-medium transition-all duration-200 flex items-center select-none',
            isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5',
            pathname === '/my-profile'
              ? 'bg-primary/10 text-primary border-r-[3px] border-primary font-bold'
              : 'text-on-surface-variant hover:bg-surface-container/60 hover:text-on-surface'
          )}
        >
          <UserCircle size={18} className="shrink-0" />
          {!isSidebarCollapsed && <span>الملف الشخصي</span>}
        </Link>
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
        {/* logout */}
          
            {!isSidebarCollapsed  && (
              <div
                className={`${ isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} top-full left-10 mt-2 z-50 w-auto bg-white/95 dark:bg-surface-container-lowest/95 
                       backdrop-blur-md rounded-2xl shadow-xl border border-outline/15 p-4 overflow-y-auto max-md:max-h-[calc(100vh-80px)] flex-1 flex-col space-y-4`}
              >
                {/* logOut */}
                <button onClick={() => {logout(); }} className="pt-2 border-outline/10 flex items-center gap-2">
                  <div className="px-3 text-surface-container-high bg-red-700 rounded-2xl py-3">
                    <LogOut size={20} className="shrink-0" />
                  </div>
                  <span>تسجيل الخروج</span>
                </button>  
              </div>
            )}
         
      </div>
    </aside>
  );
}
