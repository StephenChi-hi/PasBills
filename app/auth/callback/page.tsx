"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    // Exchange code for session
    const handleCallback = async () => {
      try {
        const hash = window.location.hash;
        if (hash.includes("access_token")) {
          // Token is in the hash, Supabase auth is handled by the client
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            router.push("/");
          }, 1000);
        } else {
          setError("Invalid callback URL. No access token found.");
          setTimeout(() => {
            router.push("/auth/signin");
          }, 2000);
        }
      } catch (err) {
        setError("Failed to process callback");
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-white mb-2">
          Processing login...
        </h1>
        <p className="text-zinc-400">
          Please wait while we confirm your account
        </p>
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}
