"use client";
import { useAuth, useRequireAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const { loading } = useRequireAuth();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <nav className="flex gap-6">
          <Link href="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
          <Link href="/dashboard/products" className="hover:text-blue-400 transition">Products</Link>
          {user?.role === "admin" && (
            <>
              <Link href="/dashboard/admin/users" className="hover:text-blue-400 transition">Manage Users</Link>
              <Link href="/dashboard/admin/products" className="hover:text-blue-400 transition">Manage Products</Link>
            </>
          )}
        </nav>
        <button onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm transition">
          Logout
        </button>
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}
