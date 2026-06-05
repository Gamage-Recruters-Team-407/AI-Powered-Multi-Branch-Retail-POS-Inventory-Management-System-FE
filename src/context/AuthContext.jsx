import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const normalizeRole = (role) =>
  String(role || '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/^super_admin$|^superadmin$|^administrator$/, 'admin');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          ...parsed,
          role: normalizeRole(parsed.role),
        });
        setToken(storedToken);
      } catch (error) {
        console.error('Error parsing user data', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    const normalizedUser = {
      ...userData,
      role: normalizeRole(userData?.role),
    };
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setToken(authToken);
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (...roles) => {
    if (!user?.role) return false;
    const allowed = roles.map((r) => normalizeRole(r));
    return allowed.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
