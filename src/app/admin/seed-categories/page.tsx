// Admin utility page to seed categories for existing users
// Path: /admin/seed-categories
// Only use this if needed to backfill existing users

"use client";

import { useState } from "react";
import { supabase } from "@/util/supabase/client";
import { seedDefaultCategoriesForUser } from "@/util/seedCategories";

export default function SeedCategoriesAdmin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const handleSeedAllUsers = async () => {
    setLoading(true);
    setMessage(null);
    setStatus(null);

    try {
      // Get all users
      const { data: users, error: usersError } =
        await supabase.auth.admin.listUsers();

      if (usersError || !users) {
        throw new Error(`Failed to fetch users: ${usersError?.message}`);
      }

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      // Seed categories for each user
      for (const user of users.identities) {
        const userId = user.user_id;
        const result = await seedDefaultCategoriesForUser(userId);

        if (result) {
          // Check if they already had categories
          const { data: categories } = await supabase
            .from("Category")
            .select("id")
            .eq("user_id", userId)
            .limit(1);

          if (categories && categories.length > 0) {
            skipCount++;
          } else {
            successCount++;
          }
        } else {
          errorCount++;
        }
      }

      setMessage(
        `Seeding complete: ${successCount} users seeded, ${skipCount} already had categories, ${errorCount} errors`,
      );
      setStatus("success");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedCurrentUser = async () => {
    setLoading(true);
    setMessage(null);
    setStatus(null);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("Failed to get current user");
      }

      const result = await seedDefaultCategoriesForUser(userData.user.id);

      if (result) {
        setMessage("Successfully seeded categories for current user");
        setStatus("success");
      } else {
        setMessage("Failed to seed categories");
        setStatus("error");
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Category Seeding Admin</h1>
        <p className="text-gray-600 mb-8">
          Use this page to seed default categories for users. This is useful for
          backfilling existing users.
        </p>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> New users automatically get seeded
              categories on signup. This tool is only needed for backfilling
              existing users.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSeedCurrentUser}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? "Processing..." : "Seed Current User"}
            </button>

            <button
              onClick={handleSeedAllUsers}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              {loading ? "Processing..." : "Seed All Users"}
            </button>
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                status === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <p className="text-sm">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
