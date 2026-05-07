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

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "bg-red-500", "bg-yellow-400", "bg-blue-500", "bg-green-500"];

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({ otp: "", newPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const btnClass = "w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Forgot Password</h2>
        <form onSubmit={sendOtp} className="space-y-4">
          <input placeholder="Enter your email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
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
          <input placeholder="Enter 6-digit OTP" maxLength={6} inputMode="numeric"
            onChange={(e) => setForm({ ...form, otp: e.target.value.replace(/\D/g, "") })}
            value={form.otp} required className={inputClass} />

          <div className="relative">
            <input placeholder="New Password (min 8)"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {form.newPassword.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : "bg-gray-200"}`} />
                ))}
              </div>
              <p className={`text-xs font-medium ${["", "text-red-500", "text-yellow-500", "text-blue-500", "text-green-500"][strength]}`}>
                {strengthLabel[strength]}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className={btnClass}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
