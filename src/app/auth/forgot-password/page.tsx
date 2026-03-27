"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiCheckCircle } from "react-icons/hi";
import { supabase } from "@/util/supabase/client";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        {!submitted ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <HiArrowLeft size={24} />
              </Link>
              <h2 className="text-2xl font-bold">Forgot Password?</h2>
            </div>

            <p className="text-gray-600 text-sm mb-5">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading || !email}
                className="bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-5 text-sm text-center text-gray-600">
              Remember your password?{" "}
              <Link
                href="/"
                className="text-blue-600 font-medium hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <HiCheckCircle size={64} className="text-green-500" />
            <h3 className="text-xl font-bold text-gray-800">
              Check your email!
            </h3>
            <p className="text-gray-600 text-center text-sm">
              We've sent a password reset link to{" "}
              <span className="font-semibold">{email}</span>. Check your inbox
              and follow the link to set a new password.
            </p>
            <p className="text-gray-500 text-xs text-center">
              If you don't see the email, check your spam folder.
            </p>
            <Link
              href="/"
              className="mt-4 bg-blue-600 text-white py-2 px-6 rounded font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
