import { useCallback, useState } from "react";

export type LoadingStep =
  | "gathering"
  | "analyzing"
  | "patterns"
  | "ideas"
  | "done";

interface UseAIAnalyticsResult {
  loading: boolean;
  error: string | null;
  results: string | null;
  currentStep: LoadingStep;
  analyzeTransactions: (
    transactions: any[],
    accountingSummary: any,
    userId?: string,
  ) => Promise<string>;
}

export function useAIAnalytics(): UseAIAnalyticsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<LoadingStep>("gathering");

  const analyzeTransactions = useCallback(
    async (
      transactions: any[],
      accountingSummary: any,
      userId?: string,
    ): Promise<string> => {
      setLoading(true);
      setError(null);
      setResults(null);

      try {
        // Step 1: Gathering
        setCurrentStep("gathering");
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Step 2: Analyzing
        setCurrentStep("analyzing");
        const response = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactions,
            accountingSummary,
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to analyze transactions");
        }

        // Step 3: Patterns
        setCurrentStep("patterns");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Step 4: Ideas
        setCurrentStep("ideas");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const data = await response.json();
        const analysisResults = data.analysis;

        // Step 5: Done
        setCurrentStep("done");
        await new Promise((resolve) => setTimeout(resolve, 500));

        setResults(analysisResults);
        return analysisResults;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Error analyzing transactions:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    results,
    currentStep,
    analyzeTransactions,
  };
}
