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

const LIMIT = 10;

export default function AdminUsers() {
  const { loading: authLoading } = useRequireAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [confirmRole, setConfirmRole] = useState(null); // { userId, currentRole }

  useEffect(() => {
    if (authLoading) return;
    getAdminUsers()
      .then(({ data }) => setUsers(data.users))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, [authLoading]);

  const filtered = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const pages = Math.max(1, Math.ceil(filtered.length / LIMIT));
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const confirmToggleRole = (userId, currentRole) => setConfirmRole({ userId, currentRole });

  const doToggleRole = async () => {
    const { userId, currentRole } = confirmRole;
    const newRole = currentRole === "admin" ? "user" : "admin";
    setConfirmRole(null);
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
        {!loading && <span className="text-sm text-slate-500">({filtered.length} of {users.length})</span>}
        <input value={search} onChange={handleSearch}
          placeholder="🔍  Search users..."
          className="input-dark ml-auto" style={{ width: "220px" }} />
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
              : paginated.length === 0
                ? <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>No users match your search</p>
                  </td></tr>
                : paginated.map((u) => (
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
                      <button onClick={() => confirmToggleRole(u._id, u.role)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95"
                        style={u.role === "admin"
                          ? { background: "rgba(37,99,235,0.15)", color: "#60a5fa", border: "1px solid rgba(37,99,235,0.25)" }
                          : { background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}>
                        {u.role === "admin" ? "→ Make User" : "→ Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)" }}>
            ← Prev
          </button>
          {[...Array(pages)].map((_, i) => {
            const p = i + 1;
            return (
              <button key={p} onClick={() => setPage(p)}
                className="w-9 h-9 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={p === page
                  ? { background: "linear-gradient(135deg, #7c3aed, #db2777)", color: "white" }
                  : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-30"
            style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)" }}>
            Next →
          </button>
        </div>
      )}

      {/* Confirm Role Change Modal */}
      {confirmRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="glass-card rounded-3xl p-6 w-full max-w-sm mx-4 space-y-4">
            <div className="text-center">
              <div className="text-5xl mb-3">{confirmRole.currentRole === "admin" ? "👤" : "👑"}</div>
              <h3 className="text-white font-bold text-lg">Change Role?</h3>
              <p className="text-slate-400 text-sm mt-1">
                Make this user a <span className="text-white font-semibold">{confirmRole.currentRole === "admin" ? "User" : "Admin"}</span>?
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRole(null)} className="flex-1 py-2 rounded-xl text-sm font-semibold transition active:scale-95"
                style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
                Cancel
              </button>
              <button onClick={doToggleRole} className="flex-1 py-2 rounded-xl text-sm font-semibold transition active:scale-95"
                style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.35)" }}>
                Yes, Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
