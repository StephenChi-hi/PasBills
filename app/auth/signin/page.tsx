"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  LogIn,
  AlertCircle,
  Eye,
  TrendingUp,
  Lightbulb,
  Briefcase,
  Target,
} from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Sign In Form */}
          <div>
            {/* Logo/Header */}
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">PasBills</h1>
              <p className="text-zinc-400">
                Welcome back to your financial dashboard
              </p>
            </div>

            {/* Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-xl">
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
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-zinc-700"></div>
                <p className="text-sm text-zinc-400">Don't have an account?</p>
                <div className="flex-1 h-px bg-zinc-700"></div>
              </div>

              {/* Sign Up Link */}
              <Link
                href="/auth/signup"
                className="block w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-center"
              >
                Create Account
              </Link>
            </div>

            {/* Footer */}
            <p className="text-center text-zinc-500 text-sm mt-6">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>

          {/* Right Column - Motivational Content (Hidden on mobile) */}
          <div className="hidden lg:flex flex-col justify-center space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Take Control of Your Money
              </h2>
              <p className="text-lg text-zinc-300 mb-8">
                Welcome back! Continue managing your finances smarter and build
                wealth with intention.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Real-Time Visibility
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Track every income and expense across personal and business
                    finances instantly
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Smart Decision Making
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Make informed choices by analyzing cash flow dynamics and
                    spending patterns
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Think Before Spending
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Build better financial habits by understanding where your
                    money goes
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-900/30 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Multiple Revenue Streams
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Manage income from various businesses and personal sources
                    in one place
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center">
                  <Target className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Build Wealth Strategically
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Plan ahead with clear financial insights and strategic
                    tracking
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
