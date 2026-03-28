"use client";

import { useState } from "react";
import { Sprout } from "lucide-react";
import { seedDefaultCategoriesForUser } from "@/util/seedCategories";
import { supabase } from "@/util/supabase/client";

export default function SeedCategoriesButton() {
  const [loading, setLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | "seeding" | null>(
    null,
  );
  const [message, setMessage] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    setShowStatus(true);
    setStatus("seeding");
    setMessage("Seeding your categories...");

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        throw new Error("Could not get current user");
      }

      const result = await seedDefaultCategoriesForUser(userData.user.id);

      if (result) {
        setStatus("success");
        setMessage("✅ Categories seeded successfully! Refresh to see them.");
        setTimeout(() => {
          setShowStatus(false);
          setLoading(false);
        }, 3000);
      } else {
        throw new Error("Seeding failed");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(`❌ Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2 text-sm"
        title="Click to seed default categories for your account (temporary)"
      >
        <Sprout size={18} />
        Seed Categories
      </button>

      {showStatus && (
        <div
          className={`fixed bottom-20 right-6 z-40 p-4 rounded-lg shadow-lg text-sm font-medium max-w-xs ${
            status === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : status === "error"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          {message}
        </div>
      )}
    </>
  );
}
