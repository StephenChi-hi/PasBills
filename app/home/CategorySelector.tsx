"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { incomeCategories } from "./constants/incomeCategories";
import { expenseCategories } from "./constants/expenseCategories";
import { CreateCategoryModal } from "./CreateCategoryModal";

interface CategorySelectorProps {
  type: "income" | "expense";
  categoryType: "personal" | "business";
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}

function getIconComponent(iconName: string) {
  const iconKey = iconName as keyof typeof Icons;
  const IconComponent = Icons[iconKey] as React.ComponentType<{
    className: string;
  }>;
  return IconComponent;
}

export function CategorySelector({
  type,
  categoryType,
  selectedCategoryId,
  onSelectCategory,
}: CategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customCategories, setCustomCategories] = useState<
    Array<{ id: string; name: string; icon: string }>
  >([]);

  const allCategories =
    type === "income" ? incomeCategories : expenseCategories;

  // Filter by category type and search query
  const filteredCategories = allCategories.filter(
    (cat) =>
      cat.subcategory === categoryType &&
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Combine with custom categories
  const displayCategories = [
    ...filteredCategories,
    ...customCategories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        cat.id.includes(categoryType),
    ),
  ];

  const handleCreateCategory = (categoryName: string, iconName: string) => {
    const categoryId = `${categoryType}_${categoryName.toLowerCase().replace(/\s+/g, "_")}`;
    const newCategory = {
      id: categoryId,
      name: categoryName,
      icon: iconName,
    };
    setCustomCategories([...customCategories, newCategory]);
    onSelectCategory(categoryId);
    setShowCreateModal(false);
    setSearchQuery("");
  };

  return (
    <>
      <div className="space-y-3">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Category Grid */}
        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900">
          {displayCategories.length > 0 ? (
            displayCategories.map((cat) => {
              // Handle both iconName (from default categories) and icon (from custom)
              const iconName =
                (cat as any).iconName || (cat as any).icon || "HelpCircle";
              const IconComponent = getIconComponent(iconName);
              const isSelected = selectedCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    isSelected
                      ? "bg-blue-500 text-white ring-2 ring-blue-200"
                      : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700"
                  }`}
                  title={cat.name}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-xs text-center truncate">
                    {cat.name.split(" ")[0]}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="col-span-4 text-center py-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No categories found
              </p>
            </div>
          )}
        </div>

        {/* Create New Category Button */}
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="w-full px-3 py-2 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm font-medium transition-colors"
        >
          + Create New Category
        </button>
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <CreateCategoryModal
          categoryType={categoryType}
          type={type}
          onClose={() => setShowCreateModal(false)}
          onCreateCategory={handleCreateCategory}
        />
      )}
    </>
  );
}
