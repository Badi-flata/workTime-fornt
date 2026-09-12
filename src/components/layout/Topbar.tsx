"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, ChevronDown, Menu, X, Settings, LogOut, ChevronUp, ArrowLeft, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useDirectoryStore } from '@/store/useDirectoryStore';
import { EmployeeInfoCardModal } from '@/components/ui/EmployeeInfoCardModal';
import { navSections } from './Sidebar';
import { Logo } from '@/components/ui/Logo';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, initializeAuth } = useAuthStore();
  const { quickResults, isQuickLoading,setSearchQuery, quickSearchTopBar, openEmployeeCard } = useDirectoryStore();
  
  
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, [initializeAuth]);

  // Close mobile menu & search popover when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Close search and profile popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchTerm(val);
    setSearchQuery(val);
    if (val.trim()) {
      setIsSearchOpen(true);
      quickSearchTopBar(val);
    } else {
      setIsSearchOpen(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleNavigateToDirectory = () => {
    setIsSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };


  const userRole = user?.role ? user?.role : "EMPLOYEE"
  const navItem = navSections.find((section) => section.role === userRole)?.screens;

  return (
    <header className="h-16 bg-white border-b shadow border-outline/15 flex items-center justify-between px-6 font-sans shrink-0 relative z-30">
      {/* ── BREADCRUMB / MOBILE MENU TOGGLE ── */}
      <motion.div className="flex items-center shrink gap-3">
        {/* Burger menu button visible only on mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 z-60 rounded-lg text-on-surface-variant right-[40%] shadow shadow-slate-400 hover:bg-slate-400/40 hover:text-white transition-colors md:hidden"
          aria-label="قائمة التنقل الجوالة"
        >
          {isMobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </motion.div>

      {/* ── LOGO ── */}
      <div className={clsx("h-16 flex items-center md:absolute right-0 px-4 shrink-0 transition-all duration-300")}>
        <Logo size={56} showText={true} orientation="horizontal" className="justify-start pr-1" />
      </div>

      {/* ── RIGHT SIDE: SEARCH + NOTIFICATIONS + PROFILE ── */}
      <div className="flex items-center gap-4">
        {/* Instant Search Bar */}
        <div ref={searchContainerRef} className="relative hidden md:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.trim() && setIsSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="ابحث عن موظف أو مدير..." 
            className="w-72 bg-surface-container-low border border-outline/20 rounded-full py-2 pr-9 pl-4 text-sm font-sans focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />

          {/* Quick Search Results Popover */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-2 right-0 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-outline/15 p-2 z-50 overflow-hidden"
              >
                <div className="p-2 border-b border-outline/10 text-xs font-label font-bold text-on-surface-variant flex justify-between items-center">
                  <span>نتائج البحث السريع</span>
                  {isQuickLoading && <span className="text-[10px] text-primary animate-pulse">جاري البحث...</span>}
                </div>

                <div className="max-h-64 overflow-y-auto py-1 divide-y divide-outline/5">
                  {quickResults.length > 0 ? (
                    quickResults.map((u) => {
                      const isEmployee = u.role === 'EMPLOYEE';
                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            setIsSearchOpen(false);
                            openEmployeeCard(u);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors group"
                        >
                          <UserAvatar
                            src={u.imageProfile}
                            name={u.fullName}
                            size={36}
                          />
                          <div className="flex-1 min-w-0 text-right">
                            <p className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                              {u.fullName}
                            </p>
                            <p className="text-[11px] text-on-surface-variant truncate">
                              {u.jobTitle || (isEmployee ? 'موظف' : 'مدير')}
                            </p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-label font-semibold ${
                            isEmployee ? 'bg-emerald-100 text-emerald-800' : 'bg-primary text-white'
                          }`}>
                            {isEmployee ? 'موظف' : 'مدير'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-on-surface-variant/70">
                      {isQuickLoading ? 'جاري استرجاع النتائج...' : 'لا توجد نتائج مطابقة.'}
                    </div>
                  )}
                </div>

                <div className="p-1 pt-2 border-t border-outline/10">
                  <button
                    onClick={handleNavigateToDirectory}
                    className="w-full py-2 px-3 rounded-xl bg-surface-container hover:bg-primary hover:text-white text-xs font-label font-bold text-primary transition-all flex items-center justify-center gap-2"
                  >
                    <span>عرض كافة النتائج في الدليل الشامل</span>
                    <ArrowLeft size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

       

        {/* Profile */}
        <div ref={profileContainerRef} className="relative flex items-center gap-3 border-r max-[400px]:hidden border-outline/20 pr-4 mr-2">
          <div 
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <UserAvatar
              src={user?.avatar}
              name={user?.name}
              size={36}
            />
            <div className="text-right hidden lg:block select-none">
              <p className="text-sm font-semibold text-on-surface leading-tight">{user?.name || 'مستخدم'}</p>
              <p className="text-[10px] text-primary font-bold mt-0.5">{user?.role === 'SUPER_ADMIN' ? 'مسؤول النظام' : user?.role === 'MANAGER' ? 'مدير' : 'موظف'}</p>
            </div>
          </div>
          {isProfileOpen ? (
            <ChevronUp
              onClick={() => setIsProfileOpen((prev) => !prev)} 
              size={20} 
              className="text-on-surface-variant relative hover:bg-on-surface-variant rounded-full hover:text-surface transition-all cursor-pointer"
            />
          ) : (
            <ChevronDown
              onClick={() => setIsProfileOpen((prev) => !prev)} 
              size={20} 
              className="text-on-surface-variant relative hover:bg-on-surface-variant rounded-full hover:text-surface transition-all cursor-pointer"
            />
          )}

          {/* Profile Dropdown Popover Card */}
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-outline-variant/30 p-4 z-50 text-right overflow-hidden flex flex-col gap-4 animate-none"
              >
                {/* User Card Info */}
                <div className="flex items-center gap-3.5 pb-3 border-b border-outline-variant/15">
                  <UserAvatar
                    src={user?.avatar}
                    name={user?.name}
                    size={48}
                    className="border border-primary/10 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-on-surface truncate leading-snug">{user?.name || 'مستخدم النظام'}</p>
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {user?.role === 'SUPER_ADMIN' ? 'مسؤول نظام' : user?.role === 'MANAGER' ? 'مدير' : 'موظف'}
                    </span>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="flex flex-col gap-1 text-xs">
                  <Link
                    href="/my-profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all font-medium"
                  >
                    <User size={15} className="text-primary" />
                    <span>عرض الملف الشخصي</span>
                  </Link>
                  
                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all font-medium"
                  >
                    <Settings size={15} className="text-primary" />
                    <span>إعدادات الحساب</span>
                  </Link>
                </div>

                {/* Danger zone actions */}
                <div className="pt-2 border-t border-outline-variant/15 flex flex-col">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      router.push('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-error hover:bg-error/5 transition-all text-xs font-bold cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
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
            {navItem?.map((section) => (
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
                href="/my-profile"
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none',
                  pathname?.startsWith('/my-profile')
                    ? 'bg-primary/10 text-primary border-r-[3px] border-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                )}
              >
                <User size={18} className="shrink-0" />
                <span>الملف الشخصي</span>
              </Link>

              <Link 
                href="/settings"
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 select-none',
                  pathname?.startsWith('/settings')
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

      {/* Integrated Modal Mount */}
      <EmployeeInfoCardModal />
    </header>
  );
}
