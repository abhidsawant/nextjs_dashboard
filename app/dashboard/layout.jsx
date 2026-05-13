"use client";
import { useAuth, useRequireAuth } from "../../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const { loading } = useRequireAuth();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  return (
    <div className="min-h-screen">
      <header className="glass-dark sticky top-0 z-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mr-8">
            <span className="text-2xl">⚡</span>
            <span className="text-gradient font-bold text-lg tracking-tight">NexDash</span>
          </div>
          <nav className="flex items-center gap-1 flex-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "gradient-primary text-white shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}>
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
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
              className="text-sm font-medium px-4 py-1.5 rounded-xl transition-all duration-200"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
              onMouseEnter={e => { e.target.style.background = "rgba(239,68,68,0.8)"; e.target.style.color = "white"; }}
              onMouseLeave={e => { e.target.style.background = "rgba(239,68,68,0.1)"; e.target.style.color = "#f87171"; }}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
