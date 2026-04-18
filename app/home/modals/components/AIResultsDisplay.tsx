"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useState } from "react";
import { exportToPDF } from "@/lib/utils/pdf-export";

interface AIResultsDisplayProps {
  results: string;
  onClose: () => void;
}

export function AIResultsDisplay({ results, onClose }: AIResultsDisplayProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPDF(results);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Your Financial Insights
        </h2>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exporting..." : "Download PDF"}
        </button>
      </div>

      <div className="prose dark:prose-invert prose-sm max-w-none">
        <motion.div
          className="bg-white dark:bg-zinc-800 rounded-lg p-6 text-zinc-900 dark:text-zinc-50 space-y-4 overflow-y-auto max-h-[60vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Parse markdown and render */}
          {results.split("\n").map((paragraph, idx) => {
            // Headers
            if (paragraph.startsWith("# ")) {
              return (
                <h1 key={idx} className="text-3xl font-bold mt-6 mb-4">
                  {paragraph.replace("# ", "")}
                </h1>
              );
            }
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={idx} className="text-2xl font-bold mt-5 mb-3">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("### ")) {
              return (
                <h3 key={idx} className="text-xl font-semibold mt-4 mb-2">
                  {paragraph.replace("### ", "")}
                </h3>
              );
            }

            // Lists
            if (paragraph.startsWith("- ")) {
              return (
                <div key={idx} className="ml-4 flex items-start gap-3">
                  <span className="text-purple-600 dark:text-purple-400 mt-1">
                    •
                  </span>
                  <p>{paragraph.replace("- ", "")}</p>
                </div>
              );
            }

            // Bold text
            if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
              return (
                <p key={idx} className="font-semibold text-lg">
                  {paragraph.replace(/\*\*/g, "")}
                </p>
              );
            }

            // Empty lines
            if (paragraph.trim() === "") {
              return <div key={idx} className="h-2" />;
            }

            // Regular paragraphs
            return (
              <p
                key={idx}
                className="text-zinc-700 dark:text-zinc-300 leading-relaxed"
              >
                {paragraph}
              </p>
            );
          })}
        </motion.div>
      </div>

      <motion.div
        className="mt-6 flex gap-3 justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={onClose}
          className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
