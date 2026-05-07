"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { registerUser } from "../../lib/services";

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

const getStrength = (p) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
};

const strengthLabel = ["", "Weak 😬", "Fair 🤔", "Good 👍", "Strong 💪"];
const strengthColor = ["", "bg-red-500", "bg-yellow-400", "bg-blue-500", "bg-green-500"];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const strength = getStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error("Invalid email format");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (strength < 2) return toast.error("Password is too weak");
    if (form.password !== form.confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password });
      toast.success("OTP sent to your email!");
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}&purpose=signup`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8">
      <div className="absolute top-10 right-20 w-80 h-80 rounded-full opacity-20 animate-float" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
      <div className="absolute bottom-10 left-20 w-80 h-80 rounded-full opacity-20 animate-float" style={{ background: "radial-gradient(circle, #db2777, transparent)", animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full opacity-10 animate-float" style={{ background: "radial-gradient(circle, #06b6d4, transparent)", animationDelay: "3s" }} />

      <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚀</div>
          <h2 className="text-3xl font-bold text-gradient mb-1">Join the Club!</h2>
          <p className="text-slate-400 text-sm">Create your account in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" placeholder="👤  Full Name" onChange={handle} required className="input-dark" />
          <input name="email" placeholder="📧  Email" type="email" onChange={handle} required className="input-dark" />

          <div className="relative">
            <input name="password" placeholder="🔒  Password (min 8)"
              type={showPassword ? "text" : "password"}
              onChange={handle} required className="input-dark pr-12" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition">
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {form.password.length > 0 && (
            <div className="space-y-1 px-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= strength ? strengthColor[strength] : "bg-white/10"}`} />
                ))}
              </div>
              <p className={`text-xs font-medium ${["", "text-red-400", "text-yellow-400", "text-blue-400", "text-green-400"][strength]}`}>
                {strengthLabel[strength]}
              </p>
            </div>
          )}

          <div className="relative">
            <input name="confirm" placeholder="🔐  Confirm Password"
              type={showConfirm ? "text" : "password"}
              onChange={handle} required
              className="input-dark pr-12"
              style={form.confirm && form.password !== form.confirm ? { borderColor: "rgba(239, 68, 68, 0.5)", boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)" } : {}} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition">
              <EyeIcon open={showConfirm} />
            </button>
          </div>
          {form.confirm && form.password !== form.confirm && (
            <p className="text-red-400 text-xs px-1">Passwords do not match ❌</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating account..." : "Create Account 🎉"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition">Sign in ✨</Link>
        </p>
      </div>
    </div>
  );
}
