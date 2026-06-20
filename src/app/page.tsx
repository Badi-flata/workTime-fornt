'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, initializeAuth } = useAuthStore();


  useEffect(() => {
    if (typeof window !== 'undefined') {
    initializeAuth();
    console.log(isAuthenticated);
  }
    
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/singup');
    }
   }, [isAuthenticated, router , initializeAuth]);
  
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-lg font-semibold text-foreground">جاري التحويل...</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {isAuthenticated ? "جاري التحويل إلى لوحة التحكم" : "جاري التحويل إلى تسجيل الدخول"}
        </p>
      </div>
    </div>
  );

}
