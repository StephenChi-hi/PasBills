"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { HiEye, HiEyeOff, HiArrowLeft, HiCheckCircle } from "react-icons/hi";
import { supabase } from "@/util/supabase/client";

export default function AuthModal() {
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else if (mode === "signup") {
        await signUp(email, password);
        // After successful signup, switch to login mode
        setMode("login");
        setPassword(""); // optional: clear password field
        setError(null);
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
          throw error;
        }

        setForgotSubmitted(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        {mode === "forgot" && !forgotSubmitted ? (
          <>
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => {
                  setMode("login");
                  setEmail("");
                  setError(null);
                  setForgotSubmitted(false);
                }}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <HiArrowLeft size={24} />
              </button>
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
              <button
                onClick={() => {
                  setMode("login");
                  setEmail("");
                  setError(null);
                }}
                className="text-blue-600 font-medium hover:underline"
              >
                Back to Login
              </button>
            </p>
          </>
        ) : mode === "forgot" && forgotSubmitted ? (
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
            <button
              onClick={() => {
                setMode("login");
                setEmail("");
                setError(null);
                setForgotSubmitted(false);
              }}
              className="mt-4 bg-blue-600 text-white py-2 px-6 rounded font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-5 text-center">
              {mode === "login" ? "Login" : "Sign Up"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Email"
                className="border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition-colors"
              >
                {loading
                  ? "Loading..."
                  : mode === "login"
                    ? "Login"
                    : "Sign Up"}
              </button>

              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setEmail("");
                    setPassword("");
                    setError(null);
                  }}
                  className="text-sm text-blue-600 hover:underline text-center"
                >
                  Forgot your password?
                </button>
              )}
            </form>

            <p className="mt-5 text-sm text-center text-gray-600">
              {mode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}{" "}
              <button
                className="text-blue-600 font-medium hover:underline"
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setPassword("");
                  setError(null);
                }}
              >
                {mode === "login" ? "Sign Up" : "Login"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
