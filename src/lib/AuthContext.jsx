// src/lib/AuthContext.jsx
import React, { createContext, useContext } from 'react';

const AuthContext = createContext({
  user: { id: 'local-user', full_name: 'Nilson' },
  isAuthenticated: true,
  isLoadingAuth: false,
  logout: () => {},
});

export function AuthProvider({ children }) {
  const auth = {
    user: { id: 'local-user', full_name: 'Nilson' },
    isAuthenticated: true,
    isLoadingAuth: false,
    logout: () => { /* no-op */ },
  };
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
