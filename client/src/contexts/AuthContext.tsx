/**
 * Authentication Context
 * Provides auth state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

// Google Client ID from environment or hardcoded fallback
const GOOGLE_CLIENT_ID = '635566407769-r19abc8s6ce3ohbek2d7bmb1hcudonpa.apps.googleusercontent.com';

export interface User {
  id: string;
  email: string;
  name?: string;
  oauth_provider?: string;
  created_at: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, phone?: string) => Promise<void>;
  googleLogin: (googleToken: string) => Promise<void>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Token invalid, clear it
        handleLogout();
      }
    } catch (e) {
      console.error('Failed to fetch user:', e);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || 'Login failed');
    }

    const data = await res.json();
    localStorage.setItem('auth_token', data.access_token);
    setToken(data.access_token);
    await fetchUser(data.access_token);
  };

  const signup = async (email: string, password: string, name?: string, phone?: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, phone_number: phone || undefined })
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || 'Signup failed');
    }

    const data = await res.json();
    localStorage.setItem('auth_token', data.access_token);
    setToken(data.access_token);
    await fetchUser(data.access_token);
  };

  const googleLogin = async (googleToken: string) => {
    const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleToken })
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || 'Google login failed');
    }

    const data = await res.json();
    localStorage.setItem('auth_token', data.access_token);
    setToken(data.access_token);
    await fetchUser(data.access_token);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('pulsar_profile_complete');
    localStorage.removeItem('pulsar_user_id');
    setToken(null);
    setUser(null);
  };

  const logout = () => {
    handleLogout();
  };

  const getAuthHeaders = (): Record<string, string> => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        googleLogin,
        logout,
        getAuthHeaders
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { GOOGLE_CLIENT_ID };
