"use client";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {user?.name} 👋</h1>
      <div className="space-y-2 text-gray-600">
        <p><span className="font-medium">Email:</span> {user?.email}</p>
        <p><span className="font-medium">Role:</span>{" "}
          <span className={`capitalize px-2 py-0.5 rounded text-sm font-medium ${user?.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
            {user?.role}
          </span>
        </p>
      </div>
      {user?.role === "admin" && (
        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <h3 className="font-semibold text-purple-800 mb-2">Admin Panel</h3>
          <Link href="/dashboard/admin/users" className="text-purple-600 hover:underline text-sm">
            Manage Users →
          </Link>
        </div>
      )}
    </div>
  );
}
