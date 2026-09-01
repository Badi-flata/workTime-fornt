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
  refreshToken: string | null;
  isInitialized: boolean;
  logUp: (user: AuthUser, token: string, refreshToken?: string) => void;
  login: (user: AuthUser, token: string, refreshToken?: string) => void;
  setTokens: (token: string, refreshToken?: string) => void;
  logout: () => void;
  initializeAuth: () => void;
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
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
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
          // التحقق من صلاحية الـ Token
          const payloadBase64 = token.split('.')[1];
          let isTokenExpired = false;
          if (payloadBase64) {
            const payload = JSON.parse(atob(payloadBase64));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              isTokenExpired = true;
            }
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
          // بيانات تالفة في localStorage
          localStorage.clear();
          globalCache.clear();
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isInitialized: true });
        }
      } else {
        // لا يوجد token
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isInitialized: true });
      }
    }
  }
}));

