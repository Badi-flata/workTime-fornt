'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { API } from '@/services/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, initializeAuth } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // إذا كان مسجلاً بالفعل، انتقل للداشبورد
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
      const res = await API.public.loginIn({ phone, password });
      const { token, user } = res.data as {
        token: string;
        user: { id: string; name: string; role: string; imageProfile?: string };
      };

      login(
        {
          id: user.id,
          name: user.name,
          role: user.role,
          avatar: user.name?.charAt(0) ?? '؟',
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
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* خلفية زخرفية */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-5rem',
          right: '-5rem',
          width: '28rem',
          height: '28rem',
          borderRadius: '9999px',
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--color-secondary) 8%, transparent), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* بطاقة تسجيل الدخول */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: '1.5rem',
          backgroundColor: 'var(--color-surface-container-lowest)',
          borderRadius: '1.5rem',
          boxShadow:
            '0 4px 6px -1px rgba(0,0,0,.06), 0 20px 60px -10px color-mix(in srgb, var(--color-primary) 12%, transparent)',
          padding: '2.5rem',
          border: '0.5px solid color-mix(in srgb, var(--color-outline) 25%, transparent)',
          position: 'relative',
        }}
      >
        {/* الشعار */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '1rem',
              backgroundColor: 'var(--color-primary)',
              marginBottom: '1rem',
              boxShadow: '0 4px 14px color-mix(in srgb, var(--color-primary) 35%, transparent)',
            }}
          >
            {/* أيقونة ساعة بسيطة */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="#95d3ba" strokeWidth="1.5" />
              <path d="M12 7v5l3 3" stroke="#95d3ba" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1
            className="font-heading"
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              margin: 0,
              letterSpacing: '0.01em',
            }}
          >
            WorkTime
          </h1>
          <p
            className="font-label"
            style={{
              marginTop: '0.25rem',
              fontSize: '0.875rem',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            منصة إدارة الحضور والانصراف
          </p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleSubmit} noValidate>
          {/* حقل رقم الهاتف */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="login-phone"
              className="font-label"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-on-surface-variant)',
                marginBottom: '0.5rem',
                letterSpacing: '0.03em',
              }}
            >
              رقم الهاتف
            </label>
            <input
              id="login-phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              dir="ltr"
              className="chronicle-input"
              style={{ textAlign: 'left' }}
            />
          </div>

          {/* حقل كلمة المرور */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label
              htmlFor="login-password"
              className="font-label"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-on-surface-variant)',
                marginBottom: '0.5rem',
                letterSpacing: '0.03em',
              }}
            >
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="chronicle-input"
                style={{ textAlign: 'left', paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: 'var(--color-on-surface-variant)',
                  opacity: 0.6,
                  lineHeight: 1,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div
              role="alert"
              style={{
                marginBottom: '1.25rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.625rem',
                backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
                border: '0.5px solid color-mix(in srgb, var(--color-error) 30%, transparent)',
                fontSize: '0.875rem',
                color: 'var(--color-error)',
                fontFamily: 'var(--font-label)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* زر الدخول */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8125rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              backgroundColor: loading
                ? 'color-mix(in srgb, var(--color-primary) 60%, transparent)'
                : 'var(--color-primary)',
              color: 'var(--color-primary-fixed-dim)',
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: loading
                ? 'none'
                : '0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow =
                  '0 6px 20px color-mix(in srgb, var(--color-primary) 40%, transparent)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 14px color-mix(in srgb, var(--color-primary) 30%, transparent)';
            }}
          >
            {loading ? (
              <>
                <svg
                  width="18" height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                  style={{ animation: 'spin 0.8s linear infinite' }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                جارٍ التحقق...
              </>
            ) : (
              'تسجيل الدخول'
            )}
          </button>
        </form>

        {/* ملاحظة أسفل البطاقة */}
        <p
          className="font-label"
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--color-on-surface-variant)',
            opacity: 0.7,
          }}
        >
          نظام مؤمّن · بيانات الدخول تُدار من قِبَل مشرف النظام
        </p>
      </div>

      {/* CSS للأنيميشن */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
