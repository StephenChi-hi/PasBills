"use client";

import { motion } from "framer-motion";
import { TimeRange, TOKEN_PRICES } from "@/lib/tokens/constants";

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onSelect: (range: TimeRange) => void;
  disabled?: boolean;
}

export function TimeRangeSelector({
  selectedRange,
  onSelect,
  disabled,
}: TimeRangeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
          Select Analysis Period
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {TOKEN_PRICES.map((option) => (
            <motion.button
              key={option.range}
              onClick={() => onSelect(option.range)}
              disabled={disabled}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedRange === option.range
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              whileHover={{ scale: disabled ? 1 : 1.02 }}
              whileTap={{ scale: disabled ? 1 : 0.98 }}
            >
              <div className="flex flex-col items-center">
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                  {option.label}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  {option.tokens} tokens
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-3">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <span className="font-semibold">📊 Note:</span> Different time ranges
          provide different levels of analysis value. Longer periods unlock more
          comprehensive insights into your financial patterns.
        </p>
      </div>
    </div>
  );
}
