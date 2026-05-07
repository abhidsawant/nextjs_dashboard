"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRequireAdmin } from "../../../../context/AuthContext";
import { getAdminUsers, updateUserRole } from "../../../../lib/services";

function SkeletonRow() {
  return (
    <tr>
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded-lg animate-pulse w-24" style={{ background: "rgba(255,255,255,0.07)" }} />
        </td>
      ))}
    </tr>
  );
}

export default function AdminUsers() {
  const { loading: authLoading } = useRequireAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    getAdminUsers()
      .then(({ data }) => setUsers(data.users))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, [authLoading]);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map((u) => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">👥</span>
        <h2 className="text-xl font-bold text-gradient">All Users</h2>
        {!loading && <span className="text-sm text-slate-500">({users.length})</span>}
      </div>
      <div className="overflow-x-auto rounded-2xl scrollbar-dark" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(124,58,237,0.08)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["User", "Email", "Role", "Verified", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : users.map((u) => (
                <tr key={u._id} className="transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: u.role === "admin" ? "linear-gradient(135deg, #7c3aed, #db2777)" : "linear-gradient(135deg, #2563eb, #06b6d4)" }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-white">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={u.role === "admin"
                        ? { background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }
                        : { background: "rgba(37,99,235,0.2)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.3)" }}>
                      {u.role === "admin" ? "👑 Admin" : "👤 User"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={u.isVerified
                        ? { background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }
                        : { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
                      {u.isVerified ? "✅ Verified" : "❌ Unverified"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleRole(u._id, u.role)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95"
                      style={u.role === "admin"
                        ? { background: "rgba(37,99,235,0.15)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.25)" }
                        : { background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}
                      onMouseEnter={e => e.target.style.opacity = "0.7"}
                      onMouseLeave={e => e.target.style.opacity = "1"}>
                      {u.role === "admin" ? "→ Make User" : "→ Make Admin"}
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
