// Prisma seed script: default income/expense categories for PasBills
// Run with: npx prisma db seed

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Shared helper to build category records
function expense(name, iconKey, color = "#E5E7EB") {
  return {
    kind: "expense",
    name,
    iconKey,
    color,
    isTaxable: false,
    userId: null,
  };
}

function income(name, iconKey, { isTaxable = true, color = "#E5E7EB" } = {}) {
  return { kind: "income", name, iconKey, color, isTaxable, userId: null };
}

const defaultCategories = [
  // Expense categories (spending buckets)
  expense("Food & Drinks", "Coffee", "#F97316"),
  expense("Shopping", "ShoppingCart", "#6366F1"),
  expense("Transport", "Car", "#0EA5E9"),
  expense("Housing", "Home", "#10B981"),
  expense("Health", "Heart", "#EF4444"),
  expense("Gifts", "Gift", "#EC4899"),
  expense("Bills & Utilities", "Zap", "#22C55E"),
  expense("Credit Card Payment", "CreditCard", "#A855F7"),
  expense("Education", "Book", "#6366F1"),
  expense("Subscriptions", "Smartphone", "#0EA5E9"),
  expense("Repairs & Maintenance", "Wrench", "#6B7280"),
  expense("Entertainment", "Music", "#F97316"),
  expense("Travel", "Airplay", "#0EA5E9"),
  expense("Insurance", "User", "#22C55E"),
  expense("Groceries", "ShoppingCart", "#16A34A"),
  expense("Fuel", "Car", "#F59E0B"),
  expense("Dining Out", "Coffee", "#FB7185"),
  expense("Electronics", "Smartphone", "#0EA5E9"),
  expense("Movies & Shows", "Film", "#6366F1"),
  expense("Miscellaneous", "DollarSign", "#9CA3AF"),

  // Income categories (sources of money)
  income("Salary", "Briefcase", { isTaxable: true, color: "#22C55E" }),
  income("Business", "BarChart2", { isTaxable: true, color: "#0EA5E9" }),
  income("Investments", "DollarSign", { isTaxable: true, color: "#F97316" }),
  income("Savings", "PiggyBank", { isTaxable: false, color: "#6366F1" }),
  income("Gifts Received", "Gift", { isTaxable: false, color: "#EC4899" }),
  income("Freelance", "User", { isTaxable: true, color: "#22C55E" }),
  income("Rent Income", "Home", { isTaxable: true, color: "#0EA5E9" }),
  income("Dividends", "BarChart2", { isTaxable: true, color: "#10B981" }),
  income("Interest", "DollarSign", { isTaxable: true, color: "#F97316" }),
  income("Bonuses", "Briefcase", { isTaxable: true, color: "#22C55E" }),
  income("Refunds", "CreditCard", { isTaxable: false, color: "#9CA3AF" }),
  income("Lottery / Gambling", "Zap", { isTaxable: true, color: "#F97316" }),
  income("Sale of Assets", "ShoppingCart", {
    isTaxable: true,
    color: "#6366F1",
  }),
  income("Royalties", "Music", { isTaxable: true, color: "#EC4899" }),
  income("Commission", "BarChart2", { isTaxable: true, color: "#22C55E" }),
  income("Scholarship", "Book", { isTaxable: false, color: "#6366F1" }),
  income("Allowance", "User", { isTaxable: false, color: "#9CA3AF" }),
  income("Crowdfunding", "Airplay", { isTaxable: true, color: "#0EA5E9" }),
  income("Affiliate Income", "DollarSign", {
    isTaxable: true,
    color: "#F59E0B",
  }),
  income("Miscellaneous", "PiggyBank", { isTaxable: false, color: "#6B7280" }),
];

async function main() {
  console.log("Seeding default categories...");

  // Remove any previous global defaults (userId NULL)
  await prisma.category.deleteMany({ where: { userId: null } });

  if (defaultCategories.length > 0) {
    await prisma.category.createMany({ data: defaultCategories });
  }

  console.log(`Seeded ${defaultCategories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
