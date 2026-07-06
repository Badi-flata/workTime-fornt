"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { AlertTriangle, Home } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Define role-based access controls
const ROLE_ROUTES: Record<string, string[]> = {
  // Routes restricted to admins/managers only
  ADMIN_ONLY: [
    '/dashboard',
    '/employees',
    '/departments',
    '/live-pulse'
  ],
  // Routes restricted to employees only
  EMPLOYEE_ONLY: [
    '/employee-dashboard'
  ]
};

const PUBLIC_ROUTES = ['/login', '/signup'];

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, user, initializeAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    // 1. Initialize auth status from localStorage
    initializeAuth();
    setLoading(false);
  }, [initializeAuth]);

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // 2. Redirect to login if not authenticated and trying to access a protected route
    if (!isAuthenticated) {
      if (!isPublicRoute) {
        router.replace('/login');
      }
      return;
    }

    // 3. Authenticated users redirects:
    const role = user?.role;

    // If visiting login/signup or the root page, redirect to their home page
    if (isPublicRoute || pathname === '/') {
      if (role === 'SUPER_ADMIN' || role === 'MANAGER') {
        router.replace('/dashboard');
      } else if (role === 'EMPLOYEE') {
        router.replace('/employee-dashboard');
      }
      return;
    }

    // 4. Verify access permission for protected pages
    let permission = true;
    if (role === 'EMPLOYEE') {
      if (ROLE_ROUTES.ADMIN_ONLY.some(route => pathname.startsWith(route))) {
        permission = false;
      }
    } else if ( role === 'MANAGER') {
      if (ROLE_ROUTES.EMPLOYEE_ONLY.some(route => pathname.startsWith(route))) {
        permission = false;
      }
    }
    setHasPermission(permission);
  }, [isAuthenticated, user, pathname, loading, router]);

  // Show a premium loading screen during initial loading
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f8f9fa]" dir="rtl">
        <div className="w-12 h-12 border-4 border-[#1b7550] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#1b7550] font-bold font-sans text-sm animate-pulse">جاري التحميل...</p>
      </div>
    );
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // If not authenticated:
  // - Show login/signup directly
  // - Show nothing for other routes as they are redirecting to /login
  if (!isAuthenticated) {
    if (isPublicRoute || pathname === '/') {
      router.replace('/login');
    }
    return null;
  }

  // If authenticated and visiting root or public routes, hide content while redirect is in progress
  // if (pathname === '/' || isPublicRoute) {
  //   return null;
  // }

  // If authenticated but has NO permission, show a beautiful access denied screen
  if (!hasPermission) {
    const defaultHome = user?.role === 'EMPLOYEE' ? '/employee-dashboard' : '/dashboard';
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fcfdfe] p-6 text-center" dir="rtl">
        <div className="w-20 h-20 rounded-full bg-[#fce8e6] flex items-center justify-center mb-6 shadow-sm border border-[#f5c6cb]">
          <AlertTriangle className="text-[#c5221f]" size={40} />
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-[#c5221f] mb-2">غير مصرح بالوصول</h2>
        <p className="text-slate-600 font-sans max-w-sm mb-8 leading-relaxed">
          عذراً، حسابك لا يملك الصلاحيات اللازمة لعرض هذه الصفحة.
        </p>
        <button
          onClick={() => router.replace(defaultHome)}
          className="flex items-center gap-2 px-6 py-3 bg-[#1b7550] hover:bg-[#165f41] text-white rounded-xl font-sans font-bold shadow-md transition-all duration-200"
        >
          <Home size={18} />
          <span>العودة إلى الصفحة الرئيسية</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
