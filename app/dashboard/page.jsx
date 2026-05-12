"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { getFavorites } from "../../lib/services";

export default function Dashboard() {
  const { user } = useAuth();
  const [favCount, setFavCount] = useState(null);

  useEffect(() => {
    getFavorites()
      .then(({ data }) => setFavCount(data.count))
      .catch(() => setFavCount(0));
  }, []);

  const cards = [
    { label: "Role", value: user?.role, emoji: user?.role === "admin" ? "👑" : "👤", from: "#7c3aed", to: "#db2777" },
    { label: "Status", value: "Active", emoji: "✅", from: "#059669", to: "#0891b2" },
    { label: "Favorites", value: favCount === null ? "..." : favCount, emoji: "❤️", from: "#db2777", to: "#f97316", href: "/dashboard/products?favorites=1" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 animate-float" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 animate-float" style={{ background: "radial-gradient(circle, #db2777, transparent)", animationDelay: "2s" }} />
        <div className="relative z-10">
          <p className="text-slate-400 text-sm font-medium mb-1">Good to see you back!</p>
          <h1 className="text-4xl font-bold text-gradient mb-2">Hey, {user?.name} 👋</h1>
          <p className="text-slate-500 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => {
          const inner = (
            <>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}>
                {c.emoji}
              </div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{c.label}</p>
              <p className="text-white font-bold text-lg capitalize mt-0.5">{c.value}</p>
            </>
          );
          return c.href ? (
            <Link key={c.label} href={c.href} className="glass-card rounded-2xl p-5 hover-lift block">{inner}</Link>
          ) : (
            <div key={c.label} className="glass-card rounded-2xl p-5 hover-lift">{inner}</div>
          );
        })}
      </div>

      {/* Admin Panel */}
      {user?.role === "admin" && (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">👑</span>
            <h3 className="font-bold text-white text-lg">Admin Panel</h3>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(124,58,237,0.2)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)" }}>
              Admin Only
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: "/dashboard/admin/users", emoji: "👥", label: "Manage Users", sub: "View & update roles", from: "#7c3aed", to: "#db2777" },
              { href: "/dashboard/admin/products", emoji: "📦", label: "Manage Products", sub: "Add, edit & delete", from: "#2563eb", to: "#06b6d4" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group hover-lift"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${item.from}33, ${item.to}33)`, border: `1px solid ${item.from}44` }}>
                  {item.emoji}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{item.label}</p>
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
