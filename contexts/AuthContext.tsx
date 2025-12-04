'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import api from '@/lib/apiClient';
import type { User, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, full_name: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  requestMagicLink: (email: string) => Promise<{ message: string; isNewUser: boolean }>;
  verifyMagicLink: (token: string) => Promise<void>;
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

    // handle OAuth callback
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const authSuccess = urlParams.get('auth') === 'success';
      const token = urlParams.get('token');

      if (authSuccess && token) {
        localStorage.setItem('authToken', token);
        // clean URL before redirect
        window.history.replaceState({}, document.title, window.location.pathname);
        // fetch user data then redirect
        checkAuth().then(() => {
          window.location.href = '/dashboard';
        });
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

  const requestMagicLink = useCallback(async (email: string) => {
    return await api.requestMagicLink(email);
  }, []);

  const verifyMagicLink = useCallback(async (token: string) => {
    const data = await api.verifyMagicLink(token);
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    setUser(data.user);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, requestMagicLink, verifyMagicLink, logout }}>
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
