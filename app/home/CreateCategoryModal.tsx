"use client";

import { useState } from "react";
import { X } from "lucide-react";
import * as Icons from "lucide-react";

// Comprehensive list of Lucide icons suitable for categories
const AVAILABLE_ICONS = [
  "Banknote",
  "Briefcase",
  "TrendingUp",
  "RotateCcw",
  "Gift",
  "DollarSign",
  "ShoppingCart",
  "Wrench",
  "MessageSquare",
  "Music",
  "Bell",
  "Zap",
  "Home",
  "Car",
  "Phone",
  "Heart",
  "Bag",
  "UtensilsCrossed",
  "Fuel",
  "Layers",
  "Package",
  "Code",
  "Megaphone",
  "Users",
  "Cpu",
  "Plane",
  "Handshake",
  "Server",
  "Settings",
  "BarChart3",
  "TrendingDown",
  "AlertCircle",
  "CheckCircle",
  "Clock",
  "Calendar",
  "MapPin",
  "Compass",
  "Eye",
  "Lock",
  "Unlock",
  "Key",
  "Shield",
  "Target",
  "Lightbulb",
  "Zap",
  "Wifi",
  "Bluetooth",
  "Radio",
  "Headphones",
  "User",
  "Users",
  "Share2",
  "Share",
  "Send",
  "Mail",
  "MessageCircle",
  "HelpCircle",
  "Info",
  "AlertTriangle",
  "XCircle",
  "Plus",
  "Minus",
  "X",
  "ChevronRight",
  "ChevronLeft",
  "ChevronDown",
  "ChevronUp",
  "ChevronsRight",
  "Download",
  "Upload",
  "Refresh",
  "RotateCw",
  "Trash2",
  "Edit",
  "Copy",
  "Clipboard",
  "Archive",
  "Inbox",
  "FileText",
  "Folder",
  "GitBranch",
  "GitCommit",
  "GitPullRequest",
  "Github",
  "Gitlab",
  "Slack",
  "Trello",
  "Figma",
  "Chrome",
  "Firefox",
  "Safari",
  "Coffee",
  "Beer",
  "Wine",
  "Utensils",
  "Cake",
  "Croissant",
  "Apple",
  "ShoppingBag",
  "Tag",
  "Tags",
  "Bookmark",
  "Star",
  "Heart",
  "Smile",
  "Frown",
  "Meh",
  "Laugh",
  "AlertCircle",
] as const;

interface CreateCategoryModalProps {
  categoryType: "personal" | "business";
  type: "income" | "expense";
  onClose: () => void;
  onCreateCategory: (name: string, icon: string) => void;
}

function getIconComponent(iconName: string) {
  const iconKey = iconName as keyof typeof Icons;
  const IconComponent = Icons[iconKey] as React.ComponentType<{
    className: string;
  }>;
  return IconComponent || Icons.HelpCircle;
}

export function CreateCategoryModal({
  categoryType,
  type,
  onClose,
  onCreateCategory,
}: CreateCategoryModalProps) {
  const [categoryName, setCategoryName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("HelpCircle");
  const [searchIcon, setSearchIcon] = useState("");

  const filteredIcons = AVAILABLE_ICONS.filter((icon) =>
    icon.toLowerCase().includes(searchIcon.toLowerCase()),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      onCreateCategory(categoryName, selectedIcon);
      setCategoryName("");
      setSelectedIcon("HelpCircle");
      setSearchIcon("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Create {type === "income" ? "Income" : "Expense"} Category
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Gym Membership, Car Rental"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category Type Display */}
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
              Category Type
            </p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {categoryType === "personal" ? "👤 Personal" : "🏢 Business"} -{" "}
              {type === "income" ? "💰 Income" : "💸 Expense"}
            </p>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Select Icon
            </label>

            {/* Selected Icon Display */}
            <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 mb-3">
              {getIconComponent(selectedIcon) &&
                (() => {
                  const IconComp = getIconComponent(selectedIcon);
                  return <IconComp className="h-8 w-8 text-blue-600" />;
                })()}
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {selectedIcon}
              </span>
            </div>

            {/* Icon Search */}
            <input
              type="text"
              placeholder="Search icons..."
              value={searchIcon}
              onChange={(e) => setSearchIcon(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />

            {/* Icon Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900">
              {filteredIcons.map((iconName) => {
                const IconComponent = getIconComponent(iconName);
                const isSelected = selectedIcon === iconName;

                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIcon(iconName)}
                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-blue-500 ring-2 ring-blue-200 dark:ring-blue-300"
                        : "bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-zinc-700"
                    }`}
                    title={iconName}
                  >
                    <IconComponent
                      className={`h-5 w-5 ${
                        isSelected
                          ? "text-white"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!categoryName.trim()}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
