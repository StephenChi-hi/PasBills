"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import * as Icons from "lucide-react";
import { CreateCategoryModal } from "./CreateCategoryModal";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  icon: string;
}

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
  return IconComponent || Icons.HelpCircle;
}

export function CategorySelector({
  type,
  categoryType,
  selectedCategoryId,
  onSelectCategory,
}: CategorySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [portalReady, setPortalReady] = useState(false);

  // Ensure portal is ready on client
  useEffect(() => {
    setPortalReady(true);
  }, []);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch both default and user's custom categories
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, icon, type, category_type")
          .eq("type", type)
          .eq("category_type", categoryType)
          .or(`user_id.is.null,user_id.eq.${user.id}`);

        if (error) {
          console.error("Error fetching categories:", error);
          setLoading(false);
          return;
        }

        // Transform data to match Category interface
        const transformedCategories = (data || []).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
        }));

        setCategories(transformedCategories);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [type, categoryType]);

  // Filter by search query
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateCategory = async (
    categoryName: string,
    iconName: string,
  ) => {
    try {
      console.log("=== CATEGORY CREATION START ===");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("❌ User not authenticated");
        throw new Error("User not authenticated. Please sign in again.");
      }

      console.log("✓ User authenticated:", user.id);
      console.log("✓ Creating category with:", {
        user_id: user.id,
        name: categoryName,
        icon: iconName,
        type: type,
        category_type: categoryType,
        is_custom: true,
      });

      // Insert new category into database
      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            user_id: user.id,
            name: categoryName,
            icon: iconName,
            type: type,
            category_type: categoryType,
            is_custom: true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase error:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        throw new Error(
          error.message || "Failed to create category in database",
        );
      }

      console.log("✓ Category inserted successfully:", data);

      // Add the new category to local state
      if (data) {
        const newCategory = {
          id: data.id,
          name: data.name,
          icon: data.icon,
        };
        console.log("✓ Adding to local state:", newCategory);
        setCategories([...categories, newCategory]);
        onSelectCategory(data.id);
        console.log("✓ Selected category:", data.id);
      }

      setShowCreateModal(false);
      setSearchQuery("");
      console.log("=== CATEGORY CREATION SUCCESS ===");
    } catch (err) {
      console.error("=== CATEGORY CREATION FAILED ===");
      console.error("Error in handleCreateCategory:", err);
      throw err;
    }
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
          {loading ? (
            <div className="col-span-4 text-center py-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Loading categories...
              </p>
            </div>
          ) : filteredCategories.length > 0 ? (
            filteredCategories.map((cat) => {
              const IconComponent = getIconComponent(cat.icon);
              const isSelected = selectedCategoryId === cat.id;

              if (!IconComponent) {
                return null;
              }

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

      {/* Create Category Modal - Rendered via Portal to Avoid Form Nesting */}
      {portalReady &&
        showCreateModal &&
        createPortal(
          <CreateCategoryModal
            categoryType={categoryType}
            type={type}
            onClose={() => setShowCreateModal(false)}
            onCreateCategory={handleCreateCategory}
          />,
          document.body,
        )}
    </>
  );
}
