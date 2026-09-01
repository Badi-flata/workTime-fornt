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
   
    '/my-employee-lest',
    '/departments',
    '/manager-dashboard'
  ],
  // Routes restricted to employees only
  EMPLOYEE_ONLY: [
    '/employee-dashboard',
    "/attendance-departuer-check",
  ]
};

const PUBLIC_ROUTES = ['/login', '/signup', "/my-profile", "/search"];

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isInitialized, user, initializeAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    // 1. Initialize auth status from localStorage on mount
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isInitialized) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // 2. Redirect to login if not authenticated and trying to access a protected route
    if (!isAuthenticated) {
      if (pathname.startsWith("/signup")) {
        router.replace(pathname);
      } else if (!isPublicRoute && pathname !== '/') {
        router.replace('/login');
      }
      return;
    }

    // 3. Authenticated users redirects:
    const role = user?.role;

    // If visiting login/signup or the root page, redirect to their home page
    if (isAuthenticated && (isPublicRoute || pathname === '/')) {
      if (role === 'SUPER_ADMIN' || role === 'MANAGER') {
        router.replace('/manager-dashboard');
      } else if (role === 'EMPLOYEE') {
        router.replace('/employee-dashboard');
      }
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
  }, [isAuthenticated, isInitialized, user, pathname, router]);

  // Show a premium loading screen during initial loading
   if (!isInitialized) {
     return (
       <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface-container-lowest" dir="rtl">
      <div className="relative flex flex-col items-center space-y-4">
        {/* Animated Logo */}
        <div className="w-24 h-24 relative">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="silverRingGrad" x1="50" y1="82" x2="0" y2="22" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#cbd5e1" />
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
            </defs>
            
            {/* Outer Ring & Clock Ticks - spinning smoothly */}
            <g className="animate-[spin_4s_linear_infinite]" style={{ transformOrigin: '50px 50px' }}>
              <path
                d="M 50 82 A 30 30 0 0 1 50 22"
                stroke="url(#silverRingGrad)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <path
                d="M 50 22 A 30 30 0 0 1 50 82"
                stroke="url(#emeraldRingGrad)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx="50" cy="27" r="2" fill="#94a3b8" />
              <circle cx="74" cy="52" r="2" fill="#1b7550" />
              <circle cx="50" cy="77" r="2" fill="#64748b" />
              <circle cx="26" cy="52" r="2" fill="#94a3b8" />
            </g>
            
            {/* Checkmark & Center Pin - pulsing softly in place */}
            <g className="animate-[pulse_2s_ease-in-out_infinite]" style={{ transformOrigin: '50px 50px' }}>
              <path
                d="M36,44 L50,58 L85,22"
                fill="none"
                stroke="url(#checkmarkGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="50" cy="58" r="3" fill="#136141" />
            </g>
          </svg>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-heading font-extrabold text-[#1b7550] tracking-wider">
            WORK<span className="text-[#1e1e1e]">TIME</span>
          </h2>
          <p className="text-xs font-sans font-bold text-slate-500 mt-1 animate-pulse">
            جاري التحميل والتوجيه...
          </p>
        </div>
      </div>
    </div>
    );
   }

  // If not authenticated:
  // - Show login/signup directly
  // - Show nothing for other routes as they are redirecting to /login
  if (!isAuthenticated) {
    if (pathname.endsWith("/login") || pathname.endsWith('/') || pathname.endsWith("/signup")  ) {
    return <>{children}</>
    }
    return null;
  }

 

  // If authenticated but has NO permission, show a beautiful access denied screen
  if (isAuthenticated&&!hasPermission  ) {
    const defaultHome = isAuthenticated && user?.role === 'EMPLOYEE' ? '/employee-dashboard' : '/dashboard';
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
  } else if (!isAuthenticated || (!hasPermission && !isAuthenticated) ) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#fcfdfe] p-6 text-center" dir="rtl">
        <div className="w-20 h-20 rounded-full bg-[#fce8e6] flex items-center justify-center mb-6 shadow-sm border border-[#f5c6cb]">
          <AlertTriangle className="text-[#c5221f]" size={40} />
        </div>
        <h2 className="text-2xl font-heading font-extrabold text-[#c5221f] mb-2">غير مصرح بالوصول</h2>
        <p className="text-slate-600 font-sans max-w-sm mb-8 leading-relaxed">
          عذراً، يرجى تسجيل الدخول أولاً للوصول إلى أي صفحة.
        </p>
        <button
          onClick={() => router.replace('/login')}
          className="flex items-center gap-2 px-6 py-3 bg-[#1b7550] hover:bg-[#165f41] text-white rounded-xl font-sans font-bold shadow-md transition-all duration-200"
        >
          <Home size={18} />
          <span>الذهاب إلى صفحة تسجيل الدخول</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
