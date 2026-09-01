import { create } from 'zustand';
import { globalCache } from '@/utils/cacheManager';

interface AuthUser {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  logUp: (user: AuthUser, token: string) => void;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  logUp: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    globalCache.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          // التحقق من صلاحية الـ Token وعدم انتهائه
          const payloadBase64 = token.split('.')[1];
          if (payloadBase64) {
            const payload = JSON.parse(atob(payloadBase64));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              globalCache.clear();
              set({ user: null, token: null, isAuthenticated: false });
              return;
            }
          }

          const user = JSON.parse(userStr) as AuthUser;
          set({ user, token, isAuthenticated: true });
        } catch {
          // بيانات تالفة في localStorage - تنظيف وإعادة التوجيه لتسجيل الدخول
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          globalCache.clear();
          set({ user: null, token: null, isAuthenticated: false });
        }
      } else {
        // لا يوجد token - يجب تسجيل الدخول أولاً
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  }
}));

