"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, ChevronDown, Menu, X, Settings, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { navSections } from './Sidebar';
import {Logo } from '@/components/ui/Logo'
export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, initializeAuth } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // إغلاق قائمة البروفايل عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="h-16 bg-white border-b shadow  border-outline/15 flex items-center justify-between px-6 font-sans shrink-0 relative z-30">
      {/* ── BREADCRUMB / MOBILE MENU TOGGLE ── */}
      <motion.div
      
      className="flex items-center shrink gap-3">
        {/* Burger menu button visible only on mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 z-60 rounded-lg text-on-surface-variant right-[40%] shadow shadow-slate-400  hover:bg-slate-400/40 hover:text-white  transition-colors md:hidden"
          aria-label="قائمة التنقل الجوالة"
        >
          {isMobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
        
      </motion.div>
      {/* ── LOGO ── */}
      <div 
        className={clsx(
          "h-16 flex items-center  md:absolute right-0 px-4 shrink-0 transition-all duration-300",
          
        )}
      >
        <Logo size={56} showText={true} orientation="horizontal" className="justify-start pr-1" />
        
      </div>
      {/* ── RIGHT SIDE: SEARCH + NOTIFICATIONS + PROFILE ── */}
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

        {/* Profile + Logout Dropdown */}
        <div ref={profileRef} className="relative flex items-center gap-3 border-r max-[400px]:hidden border-outline/20 pr-4 mr-2">
          <button
            id="topbar-profile-btn"
            onClick={() => setIsProfileMenuOpen((p) => !p)}
            className="flex items-center gap-3 cursor-pointer rounded-xl p-1 hover:bg-surface-container-low transition-colors"
            aria-label="قائمة المستخدم"
            aria-expanded={isProfileMenuOpen}
          >
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm select-none">
              {user?.avatar || 'أ'}
            </div>
            <div className="text-right hidden lg:block select-none">
              <p className="text-sm font-semibold text-on-surface leading-tight">{user?.name || 'مستخدم'}</p>
              <p className="text-xs text-on-surface-variant">{user?.role || '---'}</p>
            </div>
            <ChevronDown
              size={14}
              className={clsx('text-on-surface-variant transition-transform duration-200', isProfileMenuOpen && 'rotate-180')}
            />
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {isProfileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-full left-0 mt-3 w-48 bg-white border border-outline/15 rounded-2xl shadow-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-outline/10">
                  <p className="text-sm font-semibold text-on-surface truncate">{user?.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user?.role}</p>
                </div>
                <button
                  id="topbar-logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>تسجيل الخروج</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* ── MOBILE NAV DROPDOWN (GLASSMORPHISM) ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute top-full right-4 left-4 mt-2 z-50 bg-white/95 dark:bg-surface-container-lowest/95 
                       backdrop-blur-md rounded-2xl shadow-xl border border-outline/15 p-4 md:hidden overflow-y-auto max-h-[calc(100vh-80px)] flex flex-col space-y-4"
          >
            {navSections.map((section) => (
              <div key={section.label} className="space-y-1.5">
                <p className="px-3 text-[10px] font-label font-bold text-on-surface-variant/50 uppercase tracking-wider select-none">
                  {section.label}
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none',
                          isActive
                            ? 'bg-primary/10 text-primary border-r-[3px] border-primary font-bold'
                            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                        )}
                      >
                        <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Mobile Settings Link */}
            <div className="pt-2 border-t border-outline/10">
              <Link 
                href="/settings"
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none',
                  pathname === '/settings'
                    ? 'bg-primary/10 text-primary border-r-[3px] border-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                )}
              >
                <Settings size={18} className="shrink-0" />
                <span>الإعدادات</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
