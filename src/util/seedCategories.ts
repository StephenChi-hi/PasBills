// Utility to seed default categories for new users
import { supabase } from "@/util/supabase/client";
import {
  defaultExpenseCategories,
  defaultIncomeCategories,
} from "@/data/defaultCategories";

// Simple UUID v4 generator
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function seedDefaultCategoriesForUser(userId: string) {
  try {
    // Get existing category names for this user
    const { data: existingCategories, error: checkError } = await supabase
      .from("Category")
      .select("name")
      .eq("user_id", userId);

    if (checkError) {
      console.error("Error checking existing categories:", checkError);
      return false;
    }

    // Get existing category names as a set for fast lookup
    const existingNames = new Set(
      existingCategories?.map((cat) => cat.name) || [],
    );

    // Combine all default categories
    const allDefaults = [
      ...defaultExpenseCategories,
      ...defaultIncomeCategories,
    ];

    // Filter to only add categories that don't exist yet
    const newCategories = allDefaults.filter(
      (cat) => !existingNames.has(cat.name),
    );

    if (newCategories.length === 0) {
      console.log("No new categories to add");
      return true;
    }

    // Prepare data for insertion
    const now = new Date();
    const categoriesToInsert = newCategories.map((cat) => ({
      id: generateUUID(),
      user_id: userId,
      kind: cat.kind,
      name: cat.name,
      icon_key: cat.iconKey,
      is_taxable: cat.isTaxable,
      color: "#E5E7EB",
      created_at: now,
      updated_at: now,
    }));

    // Insert categories in batches (Supabase has request size limits)
    const batchSize = 20;
    for (let i = 0; i < categoriesToInsert.length; i += batchSize) {
      const batch = categoriesToInsert.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from("Category")
        .insert(batch);

      if (insertError) {
        console.error("Error seeding categories:", insertError);
        return false;
      }
    }

    console.log(
      `Successfully added ${categoriesToInsert.length} new categories for user ${userId}`,
    );
    return true;
  } catch (error) {
    console.error("Error in seedDefaultCategoriesForUser:", error);
    return false;
  }
}
