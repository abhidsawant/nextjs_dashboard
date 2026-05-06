"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "../lib/api";
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from "../lib/auth";  // ← ADD getRefreshToken

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // restore session on page reload
  useEffect(() => {
    if (!getAccessToken()) { setLoading(false); return; }
    api.get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (accessToken, refreshToken, userData) => {
    setTokens(accessToken, refreshToken, userData.role);
    setUser(userData);
  };

  const logout = async () => {
    await api.post("/auth/logout", { refreshToken: getRefreshToken() }).catch(() => {});
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, saveSession, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
