import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser } from '../services/api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'reservapro_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const found = await loginUser(email, password);
    if (!found) return { ok: false, message: 'Correo o contraseña incorrectos.' };

    const safeUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
    };

    setUser(safeUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    return { ok: true, user: safeUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, isAdmin: user?.role === 'admin' }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
