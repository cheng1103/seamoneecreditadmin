'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getMe, login as apiLogin, logout as apiLogout } from '@/lib/api';
import type { Admin } from '@/types';

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    getMe()
      .then((response) => {
        if (!isMounted) return;
        if (response.success && response.data) {
          setAdmin(response.data as Admin);
        } else {
          setAdmin(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAdmin(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    const response = await apiLogin(username, password);
    if (response.success && response.data) {
      const loginData = response.data as { admin: Admin };
      if (loginData.admin) {
        setAdmin(loginData.admin);
      } else {
        // fetch profile as fallback
        const me = await getMe();
        if (me.success && me.data) {
          setAdmin(me.data as Admin);
        }
      }
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    await apiLogout();
    setAdmin(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
