"use client";

import { useEffect, useState } from "react";
import { Search, Download, Menu, User } from "lucide-react";
import { Paragraph1 } from "../ui/Text";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/util/supabase/client";

interface TopNavbarProps {
  isHome?: boolean;
  pageTitle?: string;
  pageDescription?: string;
  onToggleSidebar?: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
  isHome = false,
  pageTitle,
  pageDescription,
  onToggleSidebar,
}) => {
  const { user } = useAuth();
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfileName(null);
      return;
    }

    const load = async () => {
      const { data, error } = await supabase
        .from("UserProfile")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data?.full_name) {
        setProfileName(data.full_name as string);
      } else {
        setProfileName(null);
      }
    };

    load();
  }, [user?.id]);

  const rawName =
    profileName ||
    (user?.user_metadata as any)?.full_name ||
    user?.email?.split("@")[0] ||
    "there";

  const firstName = rawName.trim().split(" ")[0];

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-50
        bg-white/70 backdrop-blur-xl
        shadow-[0_8px_30px_rgba(0,0,0,0.04)]
        px-5 py-4
      "
    >
      <div className="flex  items-center justify-between ">
        {/* LEFT: Profile OR Toggle */}
        <div className="flex items-center gap-3">
          {isHome ? (
            <div
              onClick={onToggleSidebar}
              className="flex items-center gap-2 cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold">
                  <User />
                </span>
              </div>

              {/* Greeting */}
              <div className="leading-tight">
                <Paragraph1 className="font-semibold text-gray-900">
                  Hi {firstName}
                </Paragraph1>
                <Paragraph1 className="text-sm text-gray-500">
                  Welcome back
                </Paragraph1>
              </div>
            </div>
          ) : (
            <button
              onClick={onToggleSidebar}
              className="
                p-2 rounded-xl
                hover:bg-blue-50 transition
              "
            >
              <Menu className="w-5 h-5 text-blue-600" />
            </button>
          )}
        </div>

        {/* CENTER: Page title (only on non-home pages) */}
        {!isHome && (
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <Paragraph1 className="font-semibold text-gray-900">
              {pageTitle}
            </Paragraph1>
            {pageDescription && (
              <Paragraph1 className="text-xs text-gray-500">
                {pageDescription}
              </Paragraph1>
            )}
          </div>
        )}

        {/* RIGHT: Search & Download */}
        <div className="flex items-center gap-3">
          <button
            className="
              p-2 rounded-xl shadow-sm
              hover:bg-blue-50  transition
            "
          >
            <Search className="w-5 h-5 text-blue-600" />
          </button>

          <button
            className="
              p-2 rounded-xl shadow-sm
              hover:bg-blue-50 transition
            "
          >
            <Download className="w-5 h-5 text-blue-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
