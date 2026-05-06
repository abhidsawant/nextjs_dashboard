"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "../lib/api";
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from "../lib/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      clearTokens();
      setUser(null);
    }
  };

  useEffect(() => {
    if (!getAccessToken()) { setLoading(false); return; }
    fetchUser().finally(() => setLoading(false));
  }, []);

  // listen for session expiry event fired from api.js
  useEffect(() => {
    const handleExpiry = () => setShowSessionModal(true);
    window.addEventListener("session:expired", handleExpiry);
    return () => window.removeEventListener("session:expired", handleExpiry);
  }, []);

  const handleSessionModalConfirm = () => {
    setShowSessionModal(false);
    setUser(null);
    router.push("/login?reason=session_expired");
  };

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
    <AuthContext.Provider value={{ user, saveSession, logout, loading, fetchUser }}>
      {children}

      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">⏱</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Session Expired</h2>
            <p className="text-gray-500 text-sm mb-6">
              You have been inactive for a while. Please log in again to continue.
            </p>
            <button
              onClick={handleSessionModalConfirm}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
