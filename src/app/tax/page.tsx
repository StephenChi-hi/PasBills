"use client";

import React, { useMemo, useState } from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";

interface TaxResult {
  annualGross: number;
  taxableIncome: number;
  annualTax: number;
  monthlyTax: number;
}

const bands = [
  { upper: 300_000, rate: 0.07 },
  { upper: 600_000, rate: 0.11 },
  { upper: 1_100_000, rate: 0.15 },
  { upper: 1_600_000, rate: 0.19 },
  { upper: 3_200_000, rate: 0.21 },
  { upper: Infinity, rate: 0.24 },
];

function computeTax(annualGross: number): TaxResult {
  if (!annualGross || annualGross <= 0) {
    return { annualGross: 0, taxableIncome: 0, annualTax: 0, monthlyTax: 0 };
  }

  const cra = Math.max(200_000, 0.01 * annualGross) + 0.2 * annualGross;
  const taxable = Math.max(0, annualGross - cra);

  let remaining = taxable;
  let tax = 0;
  let lower = 0;

  for (const band of bands) {
    if (remaining <= 0) break;
    const bandAmount = Math.min(remaining, band.upper - lower);
    tax += bandAmount * band.rate;
    remaining -= bandAmount;
    lower = band.upper;
  }

  return {
    annualGross,
    taxableIncome: taxable,
    annualTax: tax,
    monthlyTax: tax / 12,
  };
}

const NigeriaTaxPage: React.FC = () => {
  const [monthlyIncome, setMonthlyIncome] = useState("0");

  const result = useMemo(() => {
    const annualGross = Number(monthlyIncome || "0") * 12;
    return computeTax(annualGross);
  }, [monthlyIncome]);

  return (
    <main className="w-full py-6 space-y-6">
      <section className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
        <Paragraph2 className="text-xl font-bold text-gray-900">
          Nigeria PAYE Tax Calculator
        </Paragraph2>
        <Paragraph1 className="text-xs text-gray-500">
          Estimate your monthly PAYE on Nigerian taxable income. This is a
          simplified calculator and not legal advice.
        </Paragraph1>

        <div className="space-y-2">
          <Paragraph1 className="text-xs font-medium text-gray-700">
            Monthly taxable income (₦)
          </Paragraph1>
          <input
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <Paragraph1 className="text-xs text-gray-500 mb-1">
            Annual Gross
          </Paragraph1>
          <Paragraph2 className="text-xl font-bold text-gray-900">
            ₦
            {result.annualGross.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </Paragraph2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <Paragraph1 className="text-xs text-gray-500 mb-1">
            Taxable Income
          </Paragraph1>
          <Paragraph2 className="text-xl font-bold text-gray-900">
            ₦
            {result.taxableIncome.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </Paragraph2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <Paragraph1 className="text-xs text-gray-500 mb-1">
            Annual PAYE
          </Paragraph1>
          <Paragraph2 className="text-xl font-bold text-gray-900">
            ₦
            {result.annualTax.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </Paragraph2>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <Paragraph1 className="text-xs text-gray-500 mb-1">
            Monthly PAYE
          </Paragraph1>
          <Paragraph2 className="text-xl font-bold text-gray-900">
            ₦
            {result.monthlyTax.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </Paragraph2>
        </div>
      </section>
    </main>
  );
};

export default NigeriaTaxPage;
