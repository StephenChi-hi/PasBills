"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  children: React.ReactNode;
};

export default function SplashScreen({ children }: Props) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const seen =
      typeof window !== "undefined" && sessionStorage.getItem("pb_splash_seen");

    if (seen) {
      setShowSplash(false);
      return;
    }

    const timeout = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("pb_splash_seen", "1");
    }, 1800);

    return () => clearTimeout(timeout);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo2.png"
            alt="PassBills logo"
            width={160}
            height={160}
            priority
          />
          <p className="text-sm tracking-[0.2em] uppercase text-slate-300">
            Loading PassBills
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
