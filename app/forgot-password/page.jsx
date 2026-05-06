"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ otp: "", newPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    await api.post("/auth/forgot-password", { email }).catch(() => {});
    setLoading(false);
    setStep(2);
  };

  const resetPass = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, ...form });
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const btnClass = "w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition";

  if (step === 1) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
        <form onSubmit={sendOtp} className="space-y-4">
          <input
            placeholder="Enter your email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required className={inputClass}
          />
          <button type="submit" disabled={loading} className={btnClass}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          <Link href="/login" className="text-blue-500 hover:underline">Back to Login</Link>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Reset Password</h2>
        <p className="text-center text-sm text-gray-500 mb-6">OTP sent to <strong>{email}</strong></p>
        <form onSubmit={resetPass} className="space-y-4">
          <input
            placeholder="Enter OTP" maxLength={6}
            onChange={(e) => setForm({ ...form, otp: e.target.value })} required className={inputClass}
          />
          <input
            placeholder="New Password (min 8)" type="password"
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required className={inputClass}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className={btnClass}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
