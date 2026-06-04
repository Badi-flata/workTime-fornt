import { create } from 'zustand';

interface AuthUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ user: null, isAuthenticated: false });
  },

  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          // Ensure we don't declare unused variables if we don't use them
          // Temporary mock fallback if parse fails, or just default user 
          set({ 
            user: JSON.parse(userStr), 
            isAuthenticated: true 
          });
        } catch {
          // If no real token, use a default user for development preview
          set({ 
            user: { id: 'admin-1', name: 'أحمد الإداري', role: 'مدير النظام', avatar: 'أ' }, 
            isAuthenticated: true 
          });
        }
      } else {
        // Mock user for UI preview
        set({ 
          user: { id: 'admin-1', name: 'أحمد الإداري', role: 'مدير النظام', avatar: 'أ' }, 
          isAuthenticated: true 
        });
      }
    }
  }
}));
