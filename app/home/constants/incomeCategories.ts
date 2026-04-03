export interface IncomeCategory {
  id: string;
  name: string;
  iconName: string;
  subcategory: "personal" | "business";
}

export const incomeCategories: IncomeCategory[] = [
  // Personal Income
  {
    id: "personal_salary",
    name: "Salary",
    iconName: "Briefcase",
    subcategory: "personal",
  },
  {
    id: "personal_freelance",
    name: "Freelance",
    iconName: "Zap",
    subcategory: "personal",
  },
  {
    id: "personal_investment",
    name: "Investment Returns",
    iconName: "TrendingUp",
    subcategory: "personal",
  },
  {
    id: "personal_refund",
    name: "Refunds",
    iconName: "RotateCcw",
    subcategory: "personal",
  },
  {
    id: "personal_bonus",
    name: "Bonus",
    iconName: "Gift",
    subcategory: "personal",
  },
  {
    id: "personal_gifts",
    name: "Gifts",
    iconName: "Gift",
    subcategory: "personal",
  },
  {
    id: "personal_other",
    name: "Other Income",
    iconName: "DollarSign",
    subcategory: "personal",
  },

  // Business Income
  {
    id: "business_sales",
    name: "Product Sales",
    iconName: "ShoppingCart",
    subcategory: "business",
  },
  {
    id: "business_services",
    name: "Service Revenue",
    iconName: "Wrench",
    subcategory: "business",
  },
  {
    id: "business_consulting",
    name: "Consulting",
    iconName: "Lightbulb",
    subcategory: "business",
  },
  {
    id: "business_royalties",
    name: "License & Royalties",
    iconName: "Music",
    subcategory: "business",
  },
  {
    id: "business_subscription",
    name: "Subscription Revenue",
    iconName: "Infinity",
    subcategory: "business",
  },
  {
    id: "business_gifts",
    name: "Gifts",
    iconName: "Gift",
    subcategory: "business",
  },
  {
    id: "business_other",
    name: "Other Business Income",
    iconName: "Banknote",
    subcategory: "business",
  },
];

export function getIncomeCategoryById(id: string): IncomeCategory | undefined {
  return incomeCategories.find((cat) => cat.id === id);
}
