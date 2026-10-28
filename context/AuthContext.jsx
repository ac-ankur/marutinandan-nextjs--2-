"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth, tokens } from "@/lib/api";

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  googleLogin: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!tokens.access) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const u = await auth.me();
      setUser(u);
      return u;
    } catch (err) {
      // If fetching me fails (e.g. invalid or expired refresh token), clear local tokens
      if (err?.status === 401) {
        tokens.clear();
        setUser(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const u = await auth.login(email, password);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const register = async (input) => {
    setLoading(true);
    try {
      const u = await auth.register(input);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await auth.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    setLoading(true);
    try {
      const res = await auth.googleLogin(credential);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        googleLogin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
