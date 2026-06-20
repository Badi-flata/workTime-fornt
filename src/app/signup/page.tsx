'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { API } from '@/services/apiClient';
import { Logo } from '@/components/ui/Logo';
import { Role } from '@/types/dashboard-registry.types';

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated, logUp, initializeAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('الإدارة العامة');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>(Role.MANAGER);
  const [password, setPassword] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isAgree, setIsAgree] = useState(false);

  // ── Label maps ────────────────────────────────────────────────────
  const mapRole: Record<Role, string> = {
   EMPLOYEE : 'موظف', 
   MANAGER : 'مدير', 
  };

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
      const res = await API.public.logUp(
        {
          name,
          department,
          email,
          phone,
          role,
          password,
          jobTitle,
        }
      );
      const { token, user } = res.data as {
        token: string;
        user: { id: string; name: string; role: string;};
      };

      logUp(
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
            © 2026 WORKTIME Chronicle
          </div>
        </div>

        {/* ── LEFT PANEL: Login Form ── */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-surface-container-lowest">

          {/* Logo */}
          <div className="flex flex-col items-center mb-10 gap-2">
            <Logo size={72} showText={false} />
             <div className="mb-10 text-center md:text-right">
                <h1 className="font-headline text-headline-lg text-primary font-bold tracking-tight mb-2">إنشاء حساب مدير</h1>
                <p className="font-body text-body-md text-on-surface-variant">الرجاء إدخال بياناتك لإنشاء حساب إداري جديد.</p>
             </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
             
            <div className="flex lg:scale-[1.2] my-8  mx-5 justify-around items-center w-[min(58%,180px)] bg-surface-container-low border
             border-outline-variant/80 rounded-xl p-1 shadow text-on-surface font-sans text-base outline-none ">
                     {(Object.keys(mapRole) as Role[]).map((tab) => (
                       <button
                         key={tab}
                         onClick={() => setRole(tab)}
                         className={`px-4 py-2 rounded-md font-label font-bold text-sm  focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all  shadow-sm ${
                           role === tab
                             ? 'bg-white text-primary shadow-sm'
                             : 'text-on-surface-variant hover:bg-surface-container-highest'
                         }`}
                       >
                         {mapRole[tab]}
                       </button>
                     ))}
                   </div>

            {/* full Name & Deparmtnt */}
           <div className='grid grid-cols-1 md:grid-cols-2 gap-6'> 
            {/* full Name */}
           <div className="space-y-1">
              <label htmlFor="login-phone" className="block font-label text-sm font-semibold text-on-surface tracking-wide">
               الاسم الكامل
              </label>
              <div className="relative flex items-center">
                {/* Icon */}
                <span className="absolute right-4 text-outline pointer-events-none" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  </svg>
                </span>
                <input
                  id="logUp-name"
                   type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الكامل"
                  dir="rtl"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl py-3.5 pr-12 pl-4 text-on-surface font-sans text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left placeholder:text-outline/50 shadow-sm"
                />
              </div>
            </div>
           {/* department Name */}
            <div className='space-y-1'> 
              <label htmlFor="login-deparmnet" className="block font-label text-sm font-semibold text-on-surface tracking-wide">
              اسم المنشأة / القسم
              </label>
              <div className="relative flex items-center">
                {/* Icon */}
                <span className="absolute right-4 text-outline pointer-events-none" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><path d="M9 16h6"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/>
                  </svg>
                </span>
                <input
                  id="logUp-department"
                  type="text"
                  autoComplete="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="القسام"
                  dir="rtl"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl py-3.5 pr-12 pl-4  font-sans text-on-surface text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left placeholder:text-outline/50 shadow-sm"
                />
              </div>
            </div>
         </div>

         {/* Email */}
         <div className='space-y-1'>
           <label htmlFor="logUp-Email" className="block font-label text-sm font-semibold text-on-surface tracking-wide">
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
                  id="logUp-Email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="البريد الإلكتروني"
                  dir="rtl"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl py-3.5 pr-12 pl-4 text-on-surface font-sans text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left placeholder:text-outline/50 shadow-sm"
                />
              </div>
         </div>

            {/* Phone Field & Roles */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Phone */}
            <div className="space-y-1">
              <label htmlFor="login-phone" className="block font-label text-sm font-semibold text-on-surface tracking-wide">
                رقم الهاتف
              </label>
              <div className="relative flex items-center">
                {/* Icon */}
                <span className="absolute right-4 text-outline pointer-events-none" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <input
                  id="login-phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl py-3.5 pr-12 pl-4 text-on-surface font-sans text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left placeholder:text-outline/50 shadow-sm"
                />
              </div>
              </div>
            {/* Role */}
            <div className="space-y-1">
              <label htmlFor="login-role" className="block font-label text-sm font-semibold text-on-surface tracking-wide">
                الوظيفة
              </label>
              <div className="relative flex items-center">
                {/* Icon */}
                <span className="absolute right-4 focus:text-primary text-outline pointer-events-none" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </span>
                <input
                  id="logUp-rloe"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder='المسمى الوظيفي'
                  dir="rtl"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl py-3.5 pr-12 pl-4 text-on-surface font-sans text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-left placeholder:text-outline/50 shadow-sm"
                />
              </div>
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
              <p className="text-xs text-outline font-label mt-1">يجب أن تحتوي على 8 أحرف على الأقل، أرقام ورموز.</p>
            </div>

            {/* both boxes */}
            <div className="flex flex-wrap items-center flex-row justify-around pt-1">
            {/* agree to terms */}
              <div className='space-y-1'>
              <div className="flex-r items-center gap-2">
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
              </div>
              <button type="button" className="text-sm font-label font-bold text-primary hover:text-primary-container transition-colors hover:underline">
                الشروط والاحكام
              </button>
              </div>
              {/* remember me - Forgot password */}
              <div className='space-y-1'>
              <div className="flex items-center gap-2">
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
              </div>
              <button type="button" className="text-sm font-label font-medium text-primary hover:text-primary-container transition-colors hover:underline">
                نسيت كلمة المرور؟
              </button>
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
                disabled={loading || isAgree === false} 
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

            <div className="pt-2 flex-wrap flex justify-center items-center gap-2">
              <label htmlFor="agreement" className="text-[18px] font-medium text-on-surface-variant cursor-pointer select-none">
                   هل لديك حساب؟ 
                </label>
            <button onClick={() => router.push('/login')} type="button" className="text-sm  font-medium  text-primary hover:text-primary-container transition-colors hover:underline">
                 تسجيل الدخول
              </button>
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
