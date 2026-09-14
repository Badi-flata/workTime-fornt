import { create } from 'zustand';
import { globalCache } from '@/utils/cacheManager';

interface AuthUser {
  id: string;
  profileId: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  isInitialized: boolean;
  logUp: (user: AuthUser, token: string, refreshToken: string) => void;
  login: (user: AuthUser, token: string, refreshToken: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

// دالة مساعدة لفك تشفير JWT بأمان تام مع دعم نصوص الـ UTF-8 واللغة العربية وصيغة Base64URL
function parseJwtPayload(token: string): { exp?: number; [key: string]: any } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  isInitialized: false,

  logUp: (user, token, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true, isInitialized: true });
  },

  login: (user, token, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true, isInitialized: true });
  },

  setTokens: (token, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    }
    set((state) => ({
      token,
      refreshToken: refreshToken || state.refreshToken,
      isAuthenticated: true,
      isInitialized: true,
    }));
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    globalCache.clear();
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isInitialized: true });
  },

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          // التحقق من صلاحية الـ Token بشكل آمن يدعم الرموز العربية والـ Base64URL
          const payload = parseJwtPayload(token);
          let isTokenExpired = false;
          if (payload && payload.exp && payload.exp * 1000 < Date.now()) {
            isTokenExpired = true;
          }

          // إذا كان منتهياً ولا يوجد refreshToken صالح
          if (isTokenExpired && !refreshToken) {
            localStorage.clear();
            globalCache.clear();
            set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isInitialized: true });
            return;
          }

          const user = JSON.parse(userStr) as AuthUser;
          set({
            user,
            token,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            isInitialized: true,
          });
        } catch {
          // في حال حدوث خطأ غير متوقع لا نقوم بمسح البيانات فوراً إن كان التوكن موجوداً
          try {
            const user = JSON.parse(userStr) as AuthUser;
            set({
              user,
              token,
              refreshToken: refreshToken || null,
              isAuthenticated: true,
              isInitialized: true,
            });
          } catch {
            localStorage.clear();
            globalCache.clear();
            set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isInitialized: true });
          }
        }
      } else {
        // لا يوجد token
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isInitialized: true });
      }
    }
  }
}));

