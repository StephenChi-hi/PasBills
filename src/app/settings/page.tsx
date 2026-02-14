"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/util/supabase/client";

interface ProfileForm {
  fullName: string;
  country: string;
  currency: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    country: "NG",
    currency: "NGN",
  });
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("UserProfile")
        .select("id, full_name, country, currency")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setProfileId(data.id as string);
        setForm({
          fullName: data.full_name ?? "",
          country: data.country ?? "NG",
          currency: data.currency ?? "NGN",
        });
      }

      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage(null);

    const id = profileId ?? crypto.randomUUID();

    const { error } = await supabase.from("UserProfile").upsert(
      {
        id,
        user_id: user.id,
        full_name: form.fullName,
        country: form.country,
        currency: form.currency,
        // keep in sync with NOT NULL updated_at constraint
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile updated");
      if (!profileId) {
        setProfileId(id);
      }
    }

    setSaving(false);
  };

  if (!user) {
    return (
      <div className="pt-24 px-4">
        <p className="text-sm text-gray-500">You need to be logged in.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage your profile and default preferences.
      </p>

      {loading ? (
        <p className="text-sm text-gray-500">Loading profile…</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Full name
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What should we call you?"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Country</label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => handleChange("country", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="NG"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">
              Currency
            </label>
            <input
              type="text"
              value={form.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="NGN"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700 disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>

          {message && (
            <p className="text-xs text-center text-gray-500">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
