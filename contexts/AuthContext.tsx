'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import api from '@/lib/apiClient';
import type { User, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, full_name: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.getCurrentUser();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Handle OAuth callback
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const authSuccess = urlParams.get('auth') === 'success';
      const token = urlParams.get('token');

      if (authSuccess && token) {
        localStorage.setItem('authToken', token);
        window.history.replaceState({}, document.title, window.location.pathname);
        checkAuth();
      } else {
        checkAuth();
      }
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, full_name: string) => {
    const data = await api.signup(email, password, full_name);
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    setUser(data.user);
    return data;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    localStorage.removeItem('authToken');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
