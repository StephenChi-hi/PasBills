"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  UserPlus,
  AlertCircle,
  CheckCircle,
  Heart,
  BarChart3,
  Lock,
  Zap,
  Rocket,
} from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await signUp(email, password);
      setSuccess(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      // Redirect to signin after 2 seconds
      setTimeout(() => router.push("/auth/signin"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
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
    <div className="min-h-screen bg-gradient-to-br from-black -900 to-green-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Sign Up Form */}
          <div>
            {/* Logo/Header */}
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">PasBills</h1>
              <p className="text-zinc-400">
                Create your account to get started
              </p>
            </div>

            {/* Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-xl">
              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-800 flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-200 font-medium">
                      Account created successfully!
                    </p>
                    <p className="text-xs text-green-200/70">
                      Redirecting to sign in...
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

              {/* Form */}
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

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-zinc-200 mb-2">
                    Password
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
                  className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  {isSubmitting
                    ? "Creating account..."
                    : success
                      ? "Account created!"
                      : "Create Account"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-700"></div>
                <p className="text-sm text-zinc-400">
                  Already have an account?
                </p>
                <div className="flex-1 h-px bg-zinc-700"></div>
              </div>

              {/* Sign In Link */}
              <Link
                href="/auth/signin"
                className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
              >
                Sign In
              </Link>
            </div>

            {/* Footer */}
            <p className="text-center text-zinc-500 text-sm mt-6">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy
            </p>
          </div>

          {/* Right Column - Motivational Content (Hidden on mobile) */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Start Your Financial Transformation
              </h2>
              <p className="text-lg text-zinc-300 mb-8">
                Take the first step toward financial freedom. Understand your
                money, control your spending, and build lasting wealth.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Think Before You Spend
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Awareness is the first step. See exactly where your money
                    goes and make intentional choices
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Unified Dashboard
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    All your personal and business finances in one place - no
                    more scattered tracking
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Take Control
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Move from reactive to proactive. Control your financial
                    destiny with real data
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-900/30 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Watch Your Wealth Grow
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Track multiple income streams and watch your net worth
                    increase over time
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                  <Rocket className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Build Your Future
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Every transaction tracked is a step toward your financial
                    freedom and goals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
