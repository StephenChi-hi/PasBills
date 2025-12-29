"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { HiEye, HiEyeOff } from "react-icons/hi";

export default function AuthModal() {
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // After successful signup, switch to login mode
        setMode("login");
        setPassword(""); // optional: clear password field
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-lg w-80 shadow-lg">
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
            {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-gray-600">
          {mode === "login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <button
            className="text-blue-600 font-medium hover:underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
