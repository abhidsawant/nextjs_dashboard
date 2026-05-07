"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { forgotPassword, resetPassword } from "../../lib/services";

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

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ otp: "", newPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const strength = getStrength(form.newPassword);

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Invalid email format");
    setLoading(true);
    await forgotPassword(email).catch(() => {});
    setLoading(false);
    toast.success("OTP sent to your email!");
    setStep(2);
  };

  const resetPass = async (e) => {
    e.preventDefault();
    if (form.otp.length !== 6) return toast.error("OTP must be 6 digits");
    if (form.newPassword.length < 8) return toast.error("Password must be at least 8 characters");
    if (strength < 2) return toast.error("Password is too weak");
    setLoading(true);
    try {
      await resetPassword(email, form.otp, form.newPassword);
      toast.success("Password reset successful!");
      router.push("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-20 left-20 w-80 h-80 rounded-full opacity-20 animate-float" style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }} />
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20 animate-float" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", animationDelay: "2s" }} />

      <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h2 className="text-3xl font-bold text-gradient mb-1">Forgot Password?</h2>
          <p className="text-slate-400 text-sm">No worries, we got you covered!</p>
        </div>
        <form onSubmit={sendOtp} className="space-y-4">
          <input placeholder="📧  Enter your email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required className="input-dark" />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Sending..." : "Send OTP 📨"}
          </button>
        </form>
        <p className="text-center text-sm text-slate-400 mt-4">
          <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition">← Back to Login</Link>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-20 right-20 w-80 h-80 rounded-full opacity-20 animate-float" style={{ background: "radial-gradient(circle, #db2777, transparent)" }} />
      <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full opacity-20 animate-float" style={{ background: "radial-gradient(circle, #2563eb, transparent)", animationDelay: "1.5s" }} />

      <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h2 className="text-3xl font-bold text-gradient mb-1">Reset Password</h2>
          <p className="text-slate-400 text-sm">OTP sent to <span className="text-purple-400 font-semibold">{email}</span></p>
        </div>
        <form onSubmit={resetPass} className="space-y-4">
          <input placeholder="🔢  Enter 6-digit OTP" maxLength={6} inputMode="numeric"
            onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "") })}
            value={form.otp} required
            className="input-dark text-center tracking-[0.4em] text-lg font-bold" />

          <div className="relative">
            <input placeholder="🔒  New Password (min 8)"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required
              className="input-dark pr-12" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-400 transition">
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {form.newPassword.length > 0 && (
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

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Resetting..." : "Reset Password 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
