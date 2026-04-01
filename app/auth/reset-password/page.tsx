"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const router = useRouter();
  const { updatePassword, isLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check if there's a token in the URL
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      setHasToken(true);
    } else {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, []);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pwd)) return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(pwd)) return "Password must contain a number";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePassword(password);
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      // Redirect to dashboard after 2 seconds
      setTimeout(() => router.push("/"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
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
          <p className="text-zinc-400">Set your new password</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-xl">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-800 flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-200 font-medium">
                  Password updated!
                </p>
                <p className="text-xs text-green-200/70">
                  Redirecting to dashboard...
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

          {hasToken && !success ? (
            <>
              {/* Description */}
              <p className="text-zinc-400 text-sm mb-6">
                Enter a new password for your account. Make sure it's strong and
                unique.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-zinc-400 mt-1">
                    Minimum 8 characters, 1 uppercase letter, 1 number
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {isSubmitting
                    ? "Updating password..."
                    : success
                      ? "Password updated!"
                      : "Update Password"}
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
