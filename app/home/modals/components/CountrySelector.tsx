"use client";
import { useState } from "react";
import { CURRENCIES, getFlagUrl } from "@/lib/currency/currencies";

interface CountrySelectorProps {
  selectedCountry: string;
  setSelectedCountry: (code: string) => void;
  availableCountries: string[];
}

export function CountrySelector({
  selectedCountry,
  setSelectedCountry,
  availableCountries,
}: CountrySelectorProps) {
  const [showGrid, setShowGrid] = useState(false);
  const currency = CURRENCIES[selectedCountry as keyof typeof CURRENCIES];

  if (!showGrid) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="w-full sm:w-[400px] mx-auto">
          <div className="p-6 rounded-lg border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 flex flex-col items-center">
            <img
              src={getFlagUrl(currency.countryCode)}
              alt={currency.country}
              className="w-full h-32 object-cover rounded mb-4"
            />
            <div className="text-center">
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                {currency.country}
              </p>
              <p className="text-base font-medium text-zinc-600 dark:text-zinc-300">
                {selectedCountry}
              </p>
            </div>
          </div>
          <div className=" flex justify-between mt-2">
            <p className="font-medium text-zinc-400 dark:text-zinc-400 text-[12px]">
             500 tokens
            </p>{" "}
            <button
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
              onClick={() => setShowGrid(true)}
            >
              Change Country
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show grid selector
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
        {availableCountries.map((countryCode) => {
          const currency = CURRENCIES[countryCode as keyof typeof CURRENCIES];
          return (
            <button
              key={countryCode}
              onClick={() => {
                setSelectedCountry(countryCode);
                setShowGrid(false);
              }}
              className={`p-5 rounded-lg border-2 transition-all text-center ${
                selectedCountry === countryCode
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-purple-300"
              }`}
            >
              <img
                src={getFlagUrl(currency.countryCode)}
                alt={currency.country}
                className="w-full h-16 object-cover rounded mb-3"
              />
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                {countryCode}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {currency.country}
              </p>
            </button>
          );
        })}
      </div>
      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          onClick={() => setShowGrid(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
