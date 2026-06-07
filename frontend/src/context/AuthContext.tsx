import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type AuthResponse } from '../api/auth';

interface AuthContextType {
  account: { id: string; email: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<{ id: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authApi
        .me()
        .then(setAccount)
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('accessToken', res.accessToken);
    setAccount(res.account);
    return res;
  };

  const register = async (email: string, password: string) => {
    const res = await authApi.register({ email, password });
    localStorage.setItem('accessToken', res.accessToken);
    setAccount(res.account);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setAccount(null);
  };

  return (
    <AuthContext.Provider
      value={{ account, isAuthenticated: !!account, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
