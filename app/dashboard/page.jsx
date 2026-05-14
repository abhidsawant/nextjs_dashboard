"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { getDashboard, getFavorites } from "../../lib/services";

function useCountUp(target) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (typeof target !== "number" || isNaN(target)) return;
    let start = 0;
    const step = Math.ceil(target / (800 / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

function StatCard({ c }) {
  const numVal = typeof c.value === "number" ? c.value : null;
  const animated = useCountUp(numVal ?? 0);
  const display = numVal !== null ? animated : c.value;

  const inner = (
    <>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
        style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
        {c.emoji}
      </div>
      <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{c.label}</p>
      <p className="text-white font-bold text-lg capitalize mt-0.5">{display}</p>
    </>
  );

  return c.href
    ? <Link href={c.href} className="glass-card rounded-2xl p-5 hover-lift block">{inner}</Link>
    : <div className="glass-card rounded-2xl p-5 hover-lift">{inner}</div>;
}

// Always role-based, never from API menu
const ADMIN_PANEL_LINKS = [
  { href: "/dashboard/admin/users",    emoji: "👥", label: "Users",    sub: "View & update roles", from: "#7c3aed", to: "#db2777" },
  { href: "/dashboard/admin/products", emoji: "📦", label: "Products", sub: "Add, edit & delete",  from: "#2563eb", to: "#06b6d4" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [dbUser, setDbUser] = useState(null);
  const [favCount, setFavCount] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(({ data }) => {
        setDbUser(data.user);
        if (Array.isArray(data.user?.favorites)) {
          setFavCount(data.user.favorites.length);
        } else {
          getFavorites().then(({ data }) => setFavCount(data.count)).catch(() => setFavCount(0));
        }
      })
      .catch(() => {
        getFavorites().then(({ data }) => setFavCount(data.count)).catch(() => setFavCount(0));
      });
  }, []);

  const displayUser = dbUser || user;
  const memberSince = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const cards = [
    { label: "Role",      value: displayUser?.role,                         emoji: displayUser?.role === "admin" ? "👑" : "👤", from: "#7c3aed", to: "#db2777" },
    { label: "Status",    value: dbUser?.isVerified ? "Verified" : "Active", emoji: dbUser?.isVerified ? "✅" : "🟡",            from: "#059669", to: "#0891b2" },
    { label: "Favorites", value: favCount === null ? "..." : favCount,       emoji: "❤️",                                        from: "#db2777", to: "#f97316", href: "/dashboard/products?favorites=1" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 animate-float" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 animate-float" style={{ background: "radial-gradient(circle, #db2777, transparent)", animationDelay: "2s" }} />
        <div className="relative z-10">
          <p className="text-slate-400 text-sm font-medium mb-1">Good to see you back!</p>
          <h1 className="text-4xl font-bold text-gradient mb-2">Hey, {displayUser?.name} 👋</h1>
          <p className="text-slate-500 text-sm">{displayUser?.email}</p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {dbUser?.isVerified !== undefined && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={dbUser.isVerified
                  ? { background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }
                  : { background: "rgba(234,179,8,0.15)",  color: "#fbbf24", border: "1px solid rgba(234,179,8,0.25)" }}>
                {dbUser.isVerified ? "✅ Verified" : "⚠️ Unverified"}
              </span>
            )}
            {memberSince && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}>
                📅 Member since {memberSince}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => <StatCard key={c.label} c={c} />)}
      </div>

      {/* Admin Panel */}
      {displayUser?.role === "admin" && (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">👑</span>
            <h3 className="font-bold text-white text-lg">Admin Panel</h3>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
              Admin Only
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ADMIN_PANEL_LINKS.map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group hover-lift"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${item.from}33, ${item.to}33)`, border: `1px solid ${item.from}44` }}>
                  {item.emoji}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Manage {item.label}</p>
                  <p className="text-slate-500 text-xs">{item.sub}</p>
                </div>
                <span className="ml-auto text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all">→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
