"use client";

import { Bell, Search, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';

// Map route paths to Arabic page titles
const pageTitles: Record<string, string> = {
  '/dashboard': 'لوحة التحكم الرئيسية',
  '/attendance-reports': 'لوحة التحكم بسجلات الحضور',
  '/live-pulse': 'نبض الحضور الحي',
  '/employees': 'دليل الموظفين',
  '/employee-profile': 'الملف الشخصي للموظف',
  '/employee-dashboard': 'لوحة تحكم الموظف الشخصية',
  '/attendance-log': 'سجل الحضور التفصيلي',
  '/clock': 'تسجيل الحضور والانصراف',
  '/departments': 'إدارة الأقسام والورديات',
  '/settings': 'الإعدادات',
};

export function Topbar() {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname || ''] || 'WorkTime';
  const { user, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <header className="h-16 bg-surface-container-lowest border-b border-outline/20 flex items-center justify-between px-6 font-sans shrink-0">
      {/* Breadcrumb / Page Title */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-heading font-semibold text-on-surface">{pageTitle}</h2>
      </div>

      {/* Right Side: Search + Notifications + Profile */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
          <input 
            type="text" 
            placeholder="ابحث عن موظف..." 
            className="w-64 bg-surface-container-low border border-outline/20 rounded-full py-2 pr-9 pl-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 border-r border-outline/20 pr-4 mr-2">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
            {user?.avatar || 'أ'}
          </div>
          <div className="text-right hidden lg:block">
            <p className="text-sm font-semibold text-on-surface leading-tight">{user?.name || 'مستخدم'}</p>
            <p className="text-xs text-on-surface-variant">{user?.role || '---'}</p>
          </div>
          <ChevronDown size={14} className="text-on-surface-variant" />
        </div>
      </div>
    </header>
  );
}
