"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const { isLoading } = useAuth();

  useEffect(() => {
    // Hide splash screen once auth is done loading
    if (!isLoading) {
      setIsVisible(false);
      return;
    }
  }, [isLoading]);

  // Safety timeout - hide splash after 3 seconds regardless
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      console.log("Splash screen timeout - hiding anyway");
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-zinc-950 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24  mb-6 animate-pulse">
          <img src="/images/icon512_rounded.png" alt="" />{" "}
        </div>
        <h1 className="text-2xl font-bold text-white">PasBills</h1>
        <p className="text-slate-400 text-sm mt-2">Financial Dashboard</p>
      </div>
    </div>
  );
}
