export interface ExpenseCategory {
  id: string;
  name: string;
  iconName: string;
  subcategory: "personal" | "business";
}

export const expenseCategories: ExpenseCategory[] = [
  // Personal Expenses
  {
    id: "personal_groceries",
    name: "Groceries",
    iconName: "ShoppingBag",
    subcategory: "personal",
  },
  {
    id: "personal_utilities",
    name: "Utilities",
    iconName: "Zap",
    subcategory: "personal",
  },
  {
    id: "personal_transportation",
    name: "Transportation",
    iconName: "Car",
    subcategory: "personal",
  },
  {
    id: "personal_entertainment",
    name: "Entertainment",
    iconName: "Film",
    subcategory: "personal",
  },
  {
    id: "personal_healthcare",
    name: "Healthcare",
    iconName: "Heart",
    subcategory: "personal",
  },
  {
    id: "personal_shopping",
    name: "Shopping",
    iconName: "ShoppingCart",
    subcategory: "personal",
  },
  {
    id: "personal_dining",
    name: "Dining Out",
    iconName: "Utensils",
    subcategory: "personal",
  },
  {
    id: "personal_gas",
    name: "Gas",
    iconName: "Fuel",
    subcategory: "personal",
  },
  {
    id: "personal_rent",
    name: "Rent/Mortgage",
    iconName: "Home",
    subcategory: "personal",
  },
  {
    id: "personal_phone",
    name: "Phone & Internet",
    iconName: "Smartphone",
    subcategory: "personal",
  },
  {
    id: "personal_other",
    name: "Other Personal",
    iconName: "CreditCard",
    subcategory: "personal",
  },

  // Business Expenses
  {
    id: "business_supplies",
    name: "Office Supplies",
    iconName: "Paperclip",
    subcategory: "business",
  },
  {
    id: "business_software",
    name: "Software & Subscriptions",
    iconName: "Monitor",
    subcategory: "business",
  },
  {
    id: "business_marketing",
    name: "Marketing",
    iconName: "Megaphone",
    subcategory: "business",
  },
  {
    id: "business_payroll",
    name: "Payroll & Salaries",
    iconName: "Users",
    subcategory: "business",
  },
  {
    id: "business_equipment",
    name: "Equipment",
    iconName: "Hammer",
    subcategory: "business",
  },
  {
    id: "business_travel",
    name: "Travel & Accommodation",
    iconName: "Plane",
    subcategory: "business",
  },
  {
    id: "business_client",
    name: "Client Expenses",
    iconName: "Handshake",
    subcategory: "business",
  },
  {
    id: "business_hosting",
    name: "Hosting & Cloud",
    iconName: "Cloud",
    subcategory: "business",
  },
  {
    id: "business_professional",
    name: "Professional Services",
    iconName: "Briefcase",
    subcategory: "business",
  },
  {
    id: "business_other",
    name: "Other Business",
    iconName: "FileText",
    subcategory: "business",
  },
];

export function getExpenseCategoryById(
  id: string,
): ExpenseCategory | undefined {
  return expenseCategories.find((cat) => cat.id === id);
}
