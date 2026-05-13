"use client";
import { useAuth, useRequireAuth } from "../../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const { loading } = useRequireAuth();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gradient font-semibold text-sm">Loading...</p>
      </div>
    </div>
  );

  const navLinks = [
    { href: "/dashboard", label: "🏠 Dashboard" },
    { href: "/dashboard/products", label: "🛍️ Products" },
    ...(user?.role === "admin" ? [
      { href: "/dashboard/admin/users", label: "👥 Manage Users" },
      { href: "/dashboard/admin/products", label: "📦 Manage Products" },
    ] : []),
  ];

  // Breadcrumb segments
  const noLink = new Set(["admin"]);
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
    clickable: !noLink.has(seg),
  }));

  return (
    <div className="min-h-screen">
      <header className="glass-dark sticky top-0 z-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mr-8">
            <span className="text-2xl">⚡</span>
            <span className="text-gradient font-bold text-lg tracking-tight">NexDash</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                    isActive ? "gradient-primary text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}>
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-70" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-7 h-7 gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-white text-xs font-semibold leading-none">{user?.name}</p>
                <p className={`text-xs capitalize leading-none mt-0.5 ${user?.role === "admin" ? "text-purple-400" : "text-blue-400"}`}>
                  {user?.role}
                </p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="hidden sm:block text-sm font-medium px-4 py-1.5 rounded-xl transition-all duration-200"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              onMouseEnter={e => { e.target.style.background = "rgba(239,68,68,0.8)"; e.target.style.color = "white"; }}
              onMouseLeave={e => { e.target.style.background = "rgba(239,68,68,0.1)"; e.target.style.color = "#f87171"; }}>
              Logout
            </button>

            {/* Hamburger */}
            <button onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl transition"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-slate-300 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t flex flex-col gap-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive ? "gradient-primary text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}>
                  {label}
                </Link>
              );
            })}
            <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-white text-xs font-semibold">{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="text-xs font-medium px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
        <div className="px-6 pt-4 flex items-center gap-1.5 text-xs text-slate-500">
          {breadcrumbs.map((b, i) => (
            <span key={b.href} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-700">/</span>}
              {i === breadcrumbs.length - 1 || !b.clickable
                ? <span className={i === breadcrumbs.length - 1 ? "text-slate-300 font-medium" : "text-slate-500 cursor-default"}>{b.label}</span>
                : <Link href={b.href} className="hover:text-slate-300 transition">{b.label}</Link>
              }
            </span>
          ))}
        </div>
      )}

      <main className="p-6">{children}</main>
    </div>
  );
}
