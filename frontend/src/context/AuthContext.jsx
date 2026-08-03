import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Hydrate from localStorage on mount ──────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // ── Persist helper ──────────────────────────────────────────────────────
  const persistAuth = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  // ── Login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    // Backend returns { user: { _id, name, email, role, department }, token }
    const { user: userData, token } = data;
    persistAuth(userData, token);
    return userData;
  }, []);

  // ── Register ────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, role) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    const { user: userData, token } = data;
    persistAuth(userData, token);
    return userData;
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    role: user?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
