'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, initializeAuth } = useAuthStore();


  useEffect(() => {
    initializeAuth();
    console.log(isAuthenticated);
  }, [initializeAuth, isAuthenticated]);
  
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
   }, [isAuthenticated, router]);
  
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
            {isAuthenticated ? "جاري التحويل إلى لوحة التحكم..." : "جاري التحويل إلى تسجيل الدخول..."}
          </p>
        </div>
      </div>
    </div>
  );

}
