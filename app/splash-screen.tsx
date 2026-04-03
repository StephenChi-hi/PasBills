"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide splash screen after page is hydrated and ready
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 animate-pulse">
          <span className="text-4xl">💰</span>
        </div>
        <h1 className="text-2xl font-bold text-white">PasBills</h1>
        <p className="text-slate-400 text-sm mt-2">Financial Dashboard</p>
      </div>
    </div>
  );
}
