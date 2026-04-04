"use client";

import { useEffect } from "react";

export function PWAClient() {
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    }

    // Handle install prompt
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt = event;
      console.log("Install prompt available");
    };

    const handleAppInstalled = () => {
      console.log("App installed");
      deferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Set theme color on load and prevent white flash
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const themeColor = prefersDark ? "#1f2937" : "#ffffff";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", themeColor);

    // Cleanup: Remove event listeners on unmount
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}
