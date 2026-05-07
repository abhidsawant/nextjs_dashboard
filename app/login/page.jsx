"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { loginUser } from "../../lib/services";

const EyeIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.163-3.592M6.53 6.533A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.423 5.307M3 3l18 18" />
  </svg>
);

function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const sessionExpired = params.get("reason") === "session_expired";

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error("Invalid email format");
    if (!form.password) return toast.error("Password is required");

    setLoading(true);
    try {
      const { data } = await loginUser(form);
      if (data.next === "verify-signup") {
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}&purpose=signup`);
      } else {
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}&purpose=login`);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Login failed";
      if (status === 423) {
        const time = msg.match(/after (.+)/)?.[1];
        toast.error(`Account locked. Try again after ${time ? new Date(time).toLocaleTimeString() : "15 minutes"}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
        {sessionExpired && (
          <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-lg text-center">
            ⏱ Your session expired due to inactivity. Please log in again.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" placeholder="Email" type="email" onChange={handle} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="relative">
            <input name="password" placeholder="Password"
              type={showPassword ? "text" : "password"}
              onChange={handle} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <EyeIcon open={showPassword} />
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          <Link href="/forgot-password" className="text-blue-500 hover:underline">Forgot Password?</Link>
        </p>
        <p className="text-center text-sm text-gray-600 mt-2">
          No account?{" "}<Link href="/register" className="text-blue-500 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
