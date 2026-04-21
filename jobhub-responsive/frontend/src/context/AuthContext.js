// context/AuthContext.js — Global auth state
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token     = localStorage.getItem('token');
    const email     = localStorage.getItem('email');
    const role      = localStorage.getItem('role');
    const name      = localStorage.getItem('name');
    const profileId = localStorage.getItem('profileId');

    if (token && email) {
      setUser({ token, email, role, name, profileId });
    }
    setLoading(false);
  }, []);

  const login = (authData) => {
    const { token, email, role, name, profileId } = authData;
    localStorage.setItem('token',     token);
    localStorage.setItem('email',     email);
    localStorage.setItem('role',      role);
    localStorage.setItem('name',      name || email);
    localStorage.setItem('profileId', profileId);
    setUser({ token, email, role, name: name || email, profileId });
  };

  // ✅ FIX: Profile update ke baad header name bhi update ho
  const updateUserName = (newName) => {
    if (!newName) return;
    localStorage.setItem('name', newName);
    setUser(prev => prev ? { ...prev, name: newName } : prev);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const isStudent = () => user?.role === 'STUDENT';
  const isCompany = () => user?.role === 'COMPANY';
  const isAdmin   = () => user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserName, isStudent, isCompany, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
