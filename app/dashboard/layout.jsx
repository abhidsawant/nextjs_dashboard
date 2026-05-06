"use client";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <nav className="flex gap-6">
          <Link href="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
          {user?.role === "admin" && (
            <Link href="/dashboard/admin/users" className="hover:text-blue-400 transition">Manage Users</Link>
          )}
        </nav>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm transition"
        >
          Logout
        </button>
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}
