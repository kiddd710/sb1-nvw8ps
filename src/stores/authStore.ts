import { create } from 'zustand';
import { AuthenticationResult } from '@azure/msal-browser';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  roles: string[];
  setAuth: (authResult: AuthenticationResult | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  roles: [],
  setAuth: (authResult) => {
    if (!authResult) {
      set({ isAuthenticated: false, user: null, roles: [] });
      return;
    }
    
    set({
      isAuthenticated: true,
      user: authResult.account,
      roles: authResult.account?.idTokenClaims?.roles || [],
    });
  },
  clearAuth: () => set({ isAuthenticated: false, user: null, roles: [] }),
}));