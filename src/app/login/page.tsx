'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { API } from '@/services/apiClient';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, initializeAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isAgree, setIsAgree] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.public.loginIn({ password,  email});
      const { token, user } = res.data as {
        token: string;
        user: { id: string; name: string; role: string; imageProfile?: string };
      };

      login(
        {
          id: user.id,
          name: user.name,
          role: user.role,
        },
        token
      );

      router.replace('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr?.response?.data?.message ?? 'رقم الهاتف أو كلمة المرور غير صحيحة'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-background min-h-screen flex flex-col justify-center items-center p-6 md:p-12 relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container antialiased">

      {/* ── Ambient Background Glows ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-fixed/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-secondary-fixed/20 blur-[100px]" />
      </div>

      {/* ── Main Two-Column Card ── */}
      <main className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-0 bg-surface-container-lowest rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.04)] border border-outline-variant/20 z-10 overflow-hidden">

        {/* ── RIGHT PANEL: Branding (RTL: right = visible first) ── */}
        <div className="hidden md:flex flex-col justify-between bg-primary-container p-12 relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 z-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#95d3ba" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Header text */}
          <div className="relative z-10">
            <h2 className="font-heading text-5xl text-on-primary font-bold mb-4 leading-tight">
              مرحباً بك في<br />WORKTIME
            </h2>
            <p className="font-sans text-lg text-primary-fixed-dim max-w-md">
              نظامك المتكامل لإدارة الحضور والانصراف بذكاء ودقة.
            </p>
          </div>

          {/* Feature list */}
          <div className="relative z-10 flex flex-col gap-6 mt-12">
            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                ),
                title: 'تحليلات فورية',
                desc: 'اطلع على تقارير الأداء اليومية لحظة بلحظة.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
                  </svg>
                ),
                title: 'إدارة مرنة',
                desc: 'تحكم في الأقسام والورديات بسهولة تامة.',
              },
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: 'أمان ومصداقية',
                desc: 'سجل حضورك وانصرافك بضمان ودقة عالية.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-tint flex items-center justify-center text-on-primary shadow-sm border border-primary-container shrink-0">
                  {icon}
                </div>
                <div>
                  <h4 className="font-heading text-xl text-on-primary">{title}</h4>
                  <p className="font-sans text-base text-primary-fixed-dim">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="relative z-10 mt-12 text-on-primary/60 font-label text-xs">
            © 2025 WORKTIME Chronicle
          </div>
        </div>

        {/* ── LEFT PANEL: Login Form ── */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-surface-container-lowest">

          {/* Logo */}
          <div className="flex flex-col items-center mb-10 gap-2">
            <Logo size={72} showText={false} />
            <h1 className="font-heading text-3xl text-primary font-bold tracking-tight mt-2">
              تسجيل الدخول
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">

            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="login-phone" className="block font-label text-sm font-semibold text-on-surface tracking-wide">
                البريد الإلكتروني
              </label>
              <div className="relative flex items-center">
                {/* Icon */}
                 <span className="absolute right-4 text-outline pointer-events-none" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  dir="rtl"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl py-3.5 pr-12 pl-4 text-on-surface font-sans text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left placeholder:text-outline/50 shadow-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="login-password" className="block font-label text-sm font-semibold text-on-surface tracking-wide">
                كلمة المرور
              </label>
              <div className="relative flex items-center">
                {/* Lock icon */}
                <span className="absolute right-4 text-outline pointer-events-none" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  dir="ltr"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl py-3.5 pr-12 pl-12 text-on-surface font-sans text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left placeholder:text-outline/50 shadow-sm"
                />
                {/* Toggle visibility */}
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors p-1.5 focus:outline-none rounded-lg"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

          
            <div className="flex flex-wrap items-center  justify-around pt-1">
            {/* agree to terms */}
              <div className='space-y-1'>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="agreement"
                  name="agreement"
                  type="checkbox"
                  checked={isAgree}
                  onChange={() => setIsAgree(!isAgree)}
                  className="h-4 w-4 rounded border-outline-variant  text-primary focus:ring-primary bg-surface cursor-pointer"
                />
                <label htmlFor="agreement" className="text-sm font-label text-on-surface-variant cursor-pointer select-none">
                  موافقة على الشروط
                </label>
              <button type="button" className="text-sm font-label font-bold text-primary hover:text-primary-container transition-colors hover:underline">
                الشروط والاحكام
              </button>
              </div>
              </div>
              {/* remember me - Forgot password */}
              <div className='space-y-1'>
              <div className="flex  flex-wrap items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-sm font-label text-on-surface-variant cursor-pointer select-none">
                  تذكرني
                </label>
              <button type="button" className="text-sm font-label font-medium text-primary hover:text-primary-container transition-colors hover:underline">
                نسيت كلمة المرور؟
              </button>
              </div>
              </div>
            </div>


            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-error/8 border border-error/25 text-sm text-error font-label"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading || isAgree ===false}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-lg shadow-sm font-heading text-lg font-bold text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      width="20" height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                      className="animate-spin"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    جارٍ التحقق...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </div>

           <div className="mx-2 my-2 flex-wrap flex justify-around items-center gap-2">
             <div className='space-y-1'> 
              <label htmlFor="agreement" className="text-[18px] font-medium text-on-surface-variant cursor-pointer select-none">
                   هل لديك حساب؟ 
                </label>
            <button onClick={() => router.push('/login')} type="button" className="text-[15px]  font-medium  text-primary hover:text-primary-container transition-colors hover:underline">
                 تسجيل الدخول
              </button>
              </div>
              <div className='space-y-2'>
              <label htmlFor="agreement" className="text-[18px] font-medium text-on-surface-variant cursor-pointer select-none">
                   هل نسيت كلمة المرور؟ 
                </label>
            <button onClick={() => router.push('/login')} type="button" className="text-[15px]  font-medium  text-secondary hover:text-primary-container transition-colors hover:underline">
                 إعادة تعيين كلمة المرور
              </button>
              </div>
              </div>
          </form>

          {/* Footer note */}
          <div className="mt-8 text-center">
            <p className="font-sans text-base text-on-surface-variant">
              نظام مؤمّن ·{' '}
              <span className="font-medium text-primary">
                بيانات الدخول تُدار من قِبَل مشرف النظام
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
