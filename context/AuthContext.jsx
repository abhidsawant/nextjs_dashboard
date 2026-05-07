"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from "../lib/auth";
import { getMe, logoutUser } from "../lib/services";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const { data } = await getMe();
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
    await logoutUser(getRefreshToken()).catch(() => {});
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, saveSession, logout, loading, fetchUser }}>
      {children}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
          <div className="p-8 rounded-3xl w-full max-w-sm text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 50px rgba(0,0,0,0.6)" }}>
            <div className="text-5xl mb-3">⏱️</div>
            <h2 className="text-xl font-bold text-gradient mb-2">Session Expired</h2>
            <p className="text-slate-400 text-sm mb-6">You've been inactive for a while. Please log in again.</p>
            <button onClick={handleSessionModalConfirm} className="btn-primary">
              Go to Login 🚀
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// Client-side auth guard — redirects to /login if not authenticated
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading]);

  return { user, loading };
}

// Client-side admin guard — redirects to /dashboard if not admin
export function useRequireAdmin() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    if (!loading && user && user.role !== "admin") router.replace("/dashboard");
  }, [user, loading]);

  return { user, loading };
}
