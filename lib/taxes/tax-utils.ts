import { deductTokens } from "@/lib/tokens/token-utils";

interface TaxCalculationResponse {
  estimatedTax: number;
  taxableIncome: number;
  totalIncome: number;
  totalExpense: number;
  explanation: string;
  year: number;
  country: string;
  taxType: string;
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
          maxOutputTokens: 1024,
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

export async function calculateTax(
  userId: string,
  transactions: any[],
  country: string,
  year: number,
  taxType: string,
): Promise<TaxCalculationResponse> {
  try {
    console.log("Starting tax calculation for user:", userId);

    // Deduct tokens for tax calculation (500 tokens)
    try {
      await deductTokens(userId, 500, "Tax calculation");
      console.log("Tokens deducted successfully");
    } catch (tokenError) {
      const errorMsg =
        tokenError instanceof Error
          ? tokenError.message
          : "Failed to deduct tokens";
      throw new Error(`Token deduction failed: ${errorMsg}`);
    }

    // Group transactions by category
    const groupedByType: { [key: string]: any[] } = {
      income: [],
      expense: [],
    };

    const groupedByCategory: {
      [key: string]: { income: any[]; expense: any[] };
    } = {};

    transactions.forEach((txn) => {
      const type = txn.type === "income" ? "income" : "expense";
      groupedByType[type].push(txn);

      const categoryKey = txn.category_id || "uncategorized";
      if (!groupedByCategory[categoryKey]) {
        groupedByCategory[categoryKey] = { income: [], expense: [] };
      }
      groupedByCategory[categoryKey][type].push(txn);
    });

    // Calculate totals by category
    const incomeByCategory: { [key: string]: number } = {};
    const expenseByCategory: { [key: string]: number } = {};

    Object.entries(groupedByCategory).forEach(([category, items]) => {
      const incomeTotal = items.income.reduce(
        (sum, t) => sum + (t.amount || 0),
        0,
      );
      const expenseTotal = items.expense.reduce(
        (sum, t) => sum + (t.amount || 0),
        0,
      );

      if (incomeTotal > 0) incomeByCategory[category] = incomeTotal;
      if (expenseTotal > 0) expenseByCategory[category] = expenseTotal;
    });

    // Calculate totals
    const totalIncome = groupedByType.income.reduce(
      (sum, t) => sum + (t.amount || 0),
      0,
    );
    const totalExpense = groupedByType.expense.reduce(
      (sum, t) => sum + (t.amount || 0),
      0,
    );
    const taxableIncome = Math.max(0, totalIncome - totalExpense);

    // Prepare prompt for AI tax calculation
    const prompt = `You are a tax expert. Calculate the estimated tax for the following:

Country: ${country}
Tax Year: ${year}
Tax Type: ${taxType}
Taxable Income: ${taxableIncome}

Income Breakdown:
${Object.entries(incomeByCategory)
  .map(([cat, amount]) => `- ${cat || "Uncategorized"}: ${amount}`)
  .join("\n")}

Expense Breakdown:
${Object.entries(expenseByCategory)
  .map(([cat, amount]) => `- ${cat || "Uncategorized"}: ${amount}`)
  .join("\n")}

Please provide:
1. The estimated total tax amount to be paid
2. A brief explanation of how it was calculated based on ${country}'s tax system

Respond in JSON format:
{
  "estimatedTax": <number>,
  "explanation": "<brief explanation>"
}`;

    console.log("Calling Gemini API for tax calculation");
    const aiText = await callGeminiAPI(prompt);

    // Parse AI response
    let aiResult: { estimatedTax: number; explanation: string } = {
      estimatedTax: taxableIncome * 0.15, // Default 15% if parsing fails
      explanation: "Standard estimated tax calculation",
    };

    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResult = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Error parsing AI response:", e);
    }

    return {
      estimatedTax: aiResult.estimatedTax,
      taxableIncome,
      totalIncome,
      totalExpense,
      explanation: aiResult.explanation,
      year,
      country,
      taxType,
    };
  } catch (error) {
    console.error("Error in tax calculation:", error);
    throw error;
  }
}
