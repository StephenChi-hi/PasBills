"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CalculateTaxButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        <Calculator className="h-4 w-4" />
        Calculate Tax
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg max-w-sm mx-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                Coming Soon
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Calculate Tax feature is currently under development. We'll
                notify you when it's ready!
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
