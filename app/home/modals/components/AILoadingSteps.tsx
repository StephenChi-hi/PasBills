"use client";

import { motion } from "framer-motion";
import { Check, Loader } from "lucide-react";

type LoadingStep = "gathering" | "analyzing" | "patterns" | "ideas" | "done";

interface AILoadingStepsProps {
  currentStep: LoadingStep;
}

const steps: { id: LoadingStep; label: string; icon?: string }[] = [
  { id: "gathering", label: "Gathering your transactions" },
  { id: "analyzing", label: "Analyzing financial data" },
  { id: "patterns", label: "Generating patterns" },
  { id: "ideas", label: "Putting together ideas" },
  { id: "done", label: "Done!" },
];

export function AILoadingSteps({ currentStep }: AILoadingStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Analyzing Your Finances
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Our AI is preparing your financial insights...
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full">
              {index < currentIndex ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-green-500 rounded-full p-2"
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              ) : index === currentIndex ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="bg-purple-500 rounded-full p-2"
                >
                  <Loader className="w-5 h-5 text-white" />
                </motion.div>
              ) : (
                <div className="bg-zinc-200 dark:bg-zinc-700 rounded-full p-2">
                  <div className="w-5 h-5 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <motion.p
                className={`font-medium transition-colors ${
                  index <= currentIndex
                    ? "text-zinc-900 dark:text-zinc-50"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {step.label}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-500"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
