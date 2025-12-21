"use client";

interface MonthlySpendingCardProps {
  month: string; // e.g. "December"
  spent: number; // total spent so far
  projected: number; // projected spending
  onClick?: () => void;
}

const MonthlySpendingCard: React.FC<MonthlySpendingCardProps> = ({
  month,
  spent,
  projected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="
        w-full text-left
        rounded-2xl
        bg-white
        border border-gray-200
        shadow-[0_8px_24px_rgba(0,0,0,0.06)]
        p-4
        transition
        hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]
      "
    >
      {/* Header */}
      <div className="mb-3">
        <p className="text-sm text-gray-500">Spending in {month}</p>
        <p className="text-2xl font-semibold text-gray-900">
          ₦{spent.toLocaleString()}
        </p>
      </div>

      {/* Projected */}
      <div className="mb-4">
        <p className="text-xs text-gray-500">Projected spending</p>
        <p className="text-sm font-medium text-blue-600">
          ₦{projected.toLocaleString()}
        </p>
      </div>

      {/* Minimal Line Graph */}
      <div className="h-16 w-full">
        <svg
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="
              0,30
              10,28
              20,25
              30,27
              40,22
              50,18
              60,20
              70,14
              80,10
              90,12
              100,8
            "
          />
        </svg>
      </div>
    </button>
  );
};

export default MonthlySpendingCard;
