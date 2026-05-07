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
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
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
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        All Users {!loading && `(${users.length})`}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>{["Name", "Email", "Role", "Verified", "Action"].map((h) => (
              <th key={h} className="px-4 py-3">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.isVerified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.isVerified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleRole(u._id, u.role)}
                      className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xs hover:bg-gray-700 transition">
                      Make {u.role === "admin" ? "User" : "Admin"}
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
