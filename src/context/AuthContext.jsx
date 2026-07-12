import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../services/api/authService';
import { apiErrorMessage } from '../services/api/responseUtils';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem('af_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const persistUser = (nextUser) => {
  localStorage.setItem('af_user', JSON.stringify(nextUser));
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('af_token');
    if (!token || user) return;

    let cancelled = false;
    setIsLoading(true);
    getCurrentUser()
      .then((res) => {
        if (cancelled) return;
        const currentUser = res.data?.user || res.data;
        persistUser(currentUser);
        setUser(currentUser);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem('af_token');
        localStorage.removeItem('af_user');
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      if (data.token) {
        localStorage.setItem('af_token', data.token);
      }
      persistUser(data.user);
      setUser(data.user);
      window.dispatchEvent(new Event('assetflow-auth-changed'));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: apiErrorMessage(err, 'Invalid email or password') };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    setIsLoading(true);
    try {
      const { data } = await registerUser({ name, email, password });
      return { success: true, user: data.user || data };
    } catch (err) {
      return { success: false, error: apiErrorMessage(err, 'Unable to create account') };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('af_token');
    localStorage.removeItem('af_user');
    setUser(null);
    window.dispatchEvent(new Event('assetflow-auth-changed'));
  }, []);

  const updateProfile = useCallback(async (data) => {
    const updated = { ...user, ...data };
    persistUser(updated);
    setUser(updated);
    return updated;
  }, [user]);

  const isAuthenticated = Boolean(user && localStorage.getItem('af_token'));

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, signup, logout, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
