import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('tilehouse_user'); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });

  const login = (userData, token) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('tilehouse_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('tilehouse_user');
    setUser(null);
  };

  const updateUser = (userData) => {
    localStorage.setItem('tilehouse_user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser, isLoggedIn: !!user }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
