import { deductTokens } from "@/lib/tokens/token-utils";

interface Transaction {
  id: string;
  date: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  category?: string;
  description: string;
  account?: string;
}

interface AccountingSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  balance: number;
  topExpenseCategories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  topIncomeCategories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
}

async function callGeminiAPI(prompt: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY environment variable is not set");
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API error:", errorData);
    throw new Error("Failed to call Gemini API");
  }

  const data = await response.json();
  const textContent = data.contents?.[0]?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error("No content in Gemini response");
  }

  return textContent;
}

function generateAnalysisPrompt(
  transactions: Transaction[],
  summary: AccountingSummary,
): string {
  return `You are an expert financial advisor. Analyze the following financial data and provide comprehensive financial insights.

FINANCIAL SUMMARY:
- Total Monthly Income: ${summary.totalIncome.toLocaleString()}
- Total Monthly Expenses: ${summary.totalExpenses.toLocaleString()}
- Net Cash Flow: ${summary.netCashFlow.toLocaleString()}
- Current Balance: ${summary.balance.toLocaleString()}

TOP EXPENSE CATEGORIES:
${summary.topExpenseCategories
  .map(
    (cat, idx) =>
      `${idx + 1}. ${cat.name}: ${cat.amount.toLocaleString()} (${cat.percentage.toFixed(1)}%)`,
  )
  .join("\n")}

TOP INCOME SOURCES:
${summary.topIncomeCategories
  .map(
    (cat, idx) =>
      `${idx + 1}. ${cat.name}: ${cat.amount.toLocaleString()} (${cat.percentage.toFixed(1)}%)`,
  )
  .join("\n")}

RECENT TRANSACTIONS (Last 20):
${transactions
  .slice(-20)
  .map(
    (t) =>
      `- ${t.date}: ${t.type.toUpperCase()} - ${t.description} - ${t.amount.toLocaleString()} (${t.category || "N/A"})`,
  )
  .join("\n")}

Please provide a comprehensive financial analysis in the following markdown format:

# Financial Analysis & Insights

## 1. Financial Overview
Provide a brief summary of the person's current financial situation.

## 2. Key Findings
- List 3-4 key observations about their spending patterns and financial health

## 3. Savings Recommendations
- Provide 3-5 specific, actionable recommendations on how they can save money
- Focus on their top expense categories and suggest realistic reduction strategies

## 4. Investment Opportunities (Top 4 Areas)
Based on their top 4 frequent expense categories, suggest investment opportunities:
- For each expense category, explain what investments could benefit them in that area
- Make suggestions practical and relevant to their spending patterns

## 5. Additional Insights & Tips
- Include important financial metrics and observations
- Suggest budget optimization strategies
- Recommend tracking habits to maintain financial health

Use clear formatting, bullet points, and be specific with numbers when possible. Make the advice actionable and personalized to their financial situation.`;
}

export async function analyzeFinancials(
  userId: string,
  transactions: Transaction[],
  accountingSummary: AccountingSummary,
): Promise<string> {
  try {
    console.log("Starting financial analysis for user:", userId);

    // Deduct tokens for AI analysis (500 tokens)
    try {
      await deductTokens(userId, 500, "AI analysis");
      console.log("Tokens deducted successfully");
    } catch (tokenError) {
      const errorMsg =
        tokenError instanceof Error
          ? tokenError.message
          : "Failed to deduct tokens";
      throw new Error(`Token deduction failed: ${errorMsg}`);
    }

    const prompt = generateAnalysisPrompt(transactions, accountingSummary);
    const analysis = await callGeminiAPI(prompt);

    return analysis;
  } catch (error) {
    console.error("Error in financial analysis:", error);
    throw error;
  }
}
