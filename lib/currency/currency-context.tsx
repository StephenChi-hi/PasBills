"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getDefaultCurrencyForCountry } from "./country-to-currency";

interface CurrencyContextType {
  currentCurrency: string;
  setCurrency: (currency: string) => void;
  isDetecting: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "pasbills_currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currentCurrency, setCurrentCurrency] = useState("USD");
  const [isDetecting, setIsDetecting] = useState(true);

  // Detect user's location on mount
  useEffect(() => {
    async function initializeApp() {
      try {
        // Check localStorage first for currency preference
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setCurrentCurrency(stored);
          setIsDetecting(false);
          return;
        }

        // Fetch user's country from IP
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (data.country_code) {
          const defaultCurrency = getDefaultCurrencyForCountry(
            data.country_code,
          );
          setCurrentCurrency(defaultCurrency);
          localStorage.setItem(STORAGE_KEY, defaultCurrency);
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        // Fallback to USD if detection fails
        setCurrentCurrency("USD");
      } finally {
        setIsDetecting(false);
      }
    }

    initializeApp();
  }, []);

  const setCurrency = (currency: string) => {
    setCurrentCurrency(currency);
    localStorage.setItem(STORAGE_KEY, currency);
  };

  return (
    <CurrencyContext.Provider
      value={{ currentCurrency, setCurrency, isDetecting }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
