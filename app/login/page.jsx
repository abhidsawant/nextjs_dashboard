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
      toast.success(data.message || "Login successful!");
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Dark blobs */}
      <div className="absolute top-20 left-20 w-80 h-80 rounded-full opacity-20 animate-float" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20 animate-float" style={{ background: "radial-gradient(circle, #db2777, transparent)", animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 animate-float" style={{ background: "radial-gradient(circle, #2563eb, transparent)", animationDelay: "3s" }} />

      <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✨</div>
          <h2 className="text-3xl font-bold text-gradient mb-1">Welcome Back!</h2>
          <p className="text-slate-400 text-sm">Sign in to continue your journey</p>
        </div>

        {sessionExpired && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm text-center" style={{ background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", color: "#fbbf24" }}>
            ⏱ Session expired. Please log in again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" placeholder="📧  Email" type="email" onChange={handle} required className="input-dark" />
          <div className="relative">
            <input name="password" placeholder="🔒  Password"
              type={showPassword ? "text" : "password"}
              onChange={handle} required
              className="input-dark pr-12" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition">
              <EyeIcon open={showPassword} />
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Signing in..." : "Sign In 🚀"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-4">
          <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300 font-medium transition">Forgot Password?</Link>
        </p>
        <p className="text-center text-sm text-slate-400 mt-2">
          No account?{" "}
          <Link href="/register" className="text-pink-400 hover:text-pink-300 font-medium transition">Create one ✨</Link>
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
