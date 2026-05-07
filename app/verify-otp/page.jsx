"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { verifyOtp, resendOtp } from "../../lib/services";

function OtpForm() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveSession } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");
  const purpose = params.get("purpose");
  const endpoint = purpose === "signup" ? "/auth/verify-signup" : "/auth/verify-2fa";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Enter a valid 6-digit OTP");
    setLoading(true);
    try {
      const { data } = await verifyOtp(endpoint, email, otp);
      saveSession(data.accessToken, data.refreshToken, data.user);
      toast.success("Verified successfully!");
      router.push(data.redirectTo || "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(email, purpose);
      toast.success("OTP resent! Check your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-20 left-20 w-80 h-80 rounded-full opacity-20 animate-float" style={{ background: "radial-gradient(circle, #10b981, transparent)" }} />
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full opacity-20 animate-float" style={{ background: "radial-gradient(circle, #7c3aed, transparent)", animationDelay: "2s" }} />

      <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{purpose === "signup" ? "📬" : "🛡️"}</div>
          <h2 className="text-3xl font-bold text-gradient mb-1">
            {purpose === "signup" ? "Verify Email" : "2FA Check"}
          </h2>
          <p className="text-slate-400 text-sm">
            OTP sent to <span className="text-purple-400 font-semibold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="• • • • • •" value={otp} maxLength={6} inputMode="numeric"
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required
            className="input-dark text-center tracking-[0.6em] text-2xl font-bold py-4" />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Verifying..." : "Verify OTP ✅"}
          </button>
        </form>

        <button onClick={handleResend}
          className="w-full mt-3 text-sm text-purple-400 hover:text-purple-300 font-medium transition py-2">
          Didn't get it? Resend OTP 🔄
        </button>
      </div>
    </div>
  );
}

export default function OtpVerify() {
  return (
    <Suspense fallback={null}>
      <OtpForm />
    </Suspense>
  );
}
