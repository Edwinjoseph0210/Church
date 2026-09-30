import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SafeUser } from '../types';
import { apiRequest, setAuthToken, getAuthToken } from '../services/api';

interface AuthContextType {
  user: SafeUser | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickLoginAs: (role: 'priest' | 'member1' | 'member2' | 'pending' | 'super' | 'admin' | 'youth') => Promise<void>;
  isPriest: boolean;
  isMember: boolean;
  isStaff: boolean;
  isCoordinator: boolean;
  isSuperAdmin: boolean;
  isParishAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ user: SafeUser }>('/auth/me');
      setUser(data.user);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      setAuthToken(null);
      setTokenState(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    const res = await apiRequest<{ token: string; user: SafeUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    setAuthToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  };

  const quickLoginAs = async (role: 'priest' | 'member1' | 'member2' | 'pending' | 'super' | 'admin' | 'youth') => {
    const credentials = {
      priest: { id: 'admin', pw: 'admin123' },
      super: { id: 'admin', pw: 'admin123' },
      admin: { id: 'admin', pw: 'admin123' },
      youth: { id: 'member1', pw: 'member123' },
      member1: { id: 'member1', pw: 'member123' },
      member2: { id: 'member2', pw: 'member123' },
      pending: { id: 'joseph.pc@example.com', pw: 'member123' },
    };

    const target = credentials[role];
    if (target) {
      await login(target.id, target.pw);
    }
  };

  // Strictly TWO user roles: PRIEST (system approver/vicar) and MEMBER (parishioner)
  const isPriest = user?.role === 'PRIEST' || user?.role === 'SUPER_ADMIN' || user?.role === 'PARISH_ADMIN';
  const isMember = user?.role === 'MEMBER' || user?.role === 'PARISH_MEMBER';
  const isStaff = isPriest;
  const isCoordinator = false;
  const isSuperAdmin = isPriest;
  const isParishAdmin = isPriest;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
        quickLoginAs,
        isPriest,
        isMember,
        isStaff,
        isCoordinator,
        isSuperAdmin,
        isParishAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
