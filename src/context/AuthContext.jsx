import { createContext, useContext, useState, useCallback } from 'react';

/**
 * AuthContext
 * -----------
 * Provides authentication state across the application.
 * Backend team: replace the mock login/logout with real API calls.
 *
 * Expected POST /api/auth/login  → { token, user }
 * Expected POST /api/auth/logout → 204
 * Expected GET  /api/auth/me     → { user }
 */

const AuthContext = createContext(null);

// Mock user — backend team will replace with JWT/session
const MOCK_USER = {
  id: 'emp-001',
  name: 'Akshaya',
  email: 'akshayavinothkumar@gmail.com',
  role: 'Asset Manager',
  department: 'IT Operations',
  avatar: null,
  employeeId: 'EMP-001',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Persist login state across page reloads (localStorage mock)
    try {
      const stored = localStorage.getItem('af_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * login(email, password)
   * Backend: POST /api/auth/login { email, password }
   * Returns: { token: string, user: User }
   */
  const login = useCallback(async (email, _password) => {
    setIsLoading(true);
    try {
      // TODO: replace with → const { data } = await axios.post('/api/auth/login', { email, password });
      await new Promise((r) => setTimeout(r, 800)); // simulate network
      const loggedInUser = { ...MOCK_USER, email };
      localStorage.setItem('af_user', JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * logout()
   * Backend: POST /api/auth/logout
   */
  const logout = useCallback(async () => {
    // TODO: await axios.post('/api/auth/logout');
    localStorage.removeItem('af_user');
    setUser(null);
  }, []);

  /**
   * updateProfile(data)
   * Backend: PUT /api/auth/me { name, ... }
   */
  const updateProfile = useCallback(async (data) => {
    // TODO: const { data: updated } = await axios.put('/api/auth/me', data);
    const updated = { ...user, ...data };
    localStorage.setItem('af_user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, [user]);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
