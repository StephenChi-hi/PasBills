"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">PasBills</h1>
          <p className="text-zinc-400">Reset your password</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-xl">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-800 flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-200 font-medium">
                  Reset email sent!
                </p>
                <p className="text-xs text-green-200/70">
                  Check your inbox for a password reset link
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-800 flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Description */}
          <p className="text-zinc-400 text-sm mb-6">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          {/* Form */}
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-zinc-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-zinc-300 font-medium mb-2">Check your email</p>
              <p className="text-zinc-400 text-sm mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Try another email
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="my-6 h-px bg-zinc-700"></div>

          {/* Back to Sign In */}
          <Link
            href="/auth/signin"
            className="flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-sm mt-6">
          Need help? Contact our support team
        </p>
      </div>
    </div>
  );
}
