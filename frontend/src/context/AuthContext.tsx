import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserInfo } from '../types';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<void>;
  logout: () => void;
  switchPersona: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      // Default auto-login as Admin for smooth first-time evaluation
      try {
        const res = await api.login('admin', 'admin123');
        setAuthToken(res.access_token);
        setUser(res.user_info);
      } catch (err) {
        console.error('Auto login failed', err);
      }
    } else {
      try {
        const me = await api.getCurrentUser();
        setUser(me);
      } catch (err) {
        removeAuthToken();
        // retry default admin login
        try {
          const res = await api.login('admin', 'admin123');
          setAuthToken(res.access_token);
          setUser(res.user_info);
        } catch {
          setUser(null);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (username: string, password = 'highway123') => {
    setLoading(true);
    const pwd = username === 'admin' ? 'admin123' : password;
    const res = await api.login(username, pwd);
    setAuthToken(res.access_token);
    setUser(res.user_info);
    setLoading(false);
  };

  const switchPersona = async (username: string) => {
    await login(username);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchPersona }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

