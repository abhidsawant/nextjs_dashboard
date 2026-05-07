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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          {purpose === "signup" ? "Verify Your Email" : "Two-Factor Authentication"}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">OTP sent to <strong>{email}</strong></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Enter 6-digit OTP" value={otp} maxLength={6} inputMode="numeric"
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
        <button onClick={handleResend} className="w-full mt-3 text-sm text-blue-500 hover:underline">
          Resend OTP
        </button>
      </div>
    </div>
  );
}

export default function OtpVerify() {
  return (
    <Suspense fallback={<p className="text-center mt-10">Loading...</p>}>
      <OtpForm />
    </Suspense>
  );
}
