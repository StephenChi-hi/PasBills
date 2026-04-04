"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CURRENCIES, MAJOR_CURRENCIES } from "@/lib/currency/currencies";
import { useCurrency } from "@/lib/currency/currency-context";

export function CurrencySwitcher() {
  const { currentCurrency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currentCurrencyData =
    CURRENCIES[currentCurrency as keyof typeof CURRENCIES];

  // Use static exchange rates from CURRENCIES
  const currentRate = currentCurrencyData?.rateToUSD || 1;

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 hover:from-zinc-200 hover:to-zinc-100 dark:hover:from-zinc-700 dark:hover:to-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md"
      >
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
          {currentCurrencyData?.symbol} {currentCurrency}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[100%] mt-2 left-0 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
          <div className="max-h-96 overflow-y-auto">
            {/* MAJOR CURRENCIES SECTION */}
            <div className="border-b border-zinc-200 dark:border-zinc-700 p-3">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase px-2 mb-2">
                Major Currencies
              </p>
              {MAJOR_CURRENCIES?.map((code) => {
                const currency = CURRENCIES[code as keyof typeof CURRENCIES];
                if (!currency) return null;
                const targetRate = currency.rateToUSD || 1;
                const rate = currentRate / targetRate;
                return (
                  <button
                    key={code}
                    onClick={() => {
                      setCurrency(code);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex justify-between items-center ${
                      currentCurrency === code
                        ? "bg-green-50 dark:bg-green-950"
                        : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {currency.symbol} {code}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {currency.name}
                      </p>
                    </div>
                    {/* <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      1 = {rate.toFixed(2)}
                    </span> */}
                  </button>
                );
              })}
            </div>

            {/* ALL CURRENCIES SECTION */}
            <div className="p-3">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase px-2 mb-2">
                All Currencies
              </p>
              <div className="grid grid-cols-1 gap-1">
                {Object.entries(CURRENCIES)
                  .filter(
                    ([key, value]) =>
                      typeof value === "object" &&
                      key !== currentCurrency &&
                      !MAJOR_CURRENCIES.includes(key),
                  )
                  .map(([code, currency]) => {
                    if (typeof currency === "string") return null;
                    const targetRate = currency.rateToUSD || 1;
                    const rate = currentRate / targetRate;
                    return (
                      <button
                        key={code}
                        onClick={() => {
                          setCurrency(code);
                          setIsOpen(false);
                        }}
                        className="text-left px-3 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex justify-between items-center text-sm"
                      >
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            {currency.symbol} {code}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {currency.country}
                          </p>
                        </div>
                        {/* <span className="text-xs text-zinc-600 dark:text-zinc-400">
                          {rate.toFixed(2)}
                        </span> */}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
