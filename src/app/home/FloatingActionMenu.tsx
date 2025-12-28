import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text"; // Assuming your custom text component location
import {
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  FileText,
} from "lucide-react";

// Definition for menu items to keep the render clean
interface MenuItem {
  label: string;
  icon: React.ElementType;
  theme: "red" | "green" | "blue" | "orange";
  onClick?: () => void;
}

const menuItems: MenuItem[] = [
  { label: "Add Expense", icon: ArrowUp, theme: "red" },
  { label: "Add Income", icon: ArrowDown, theme: "green" },
  { label: "Transfer", icon: ArrowLeftRight, theme: "blue" },
  { label: "Add Bill", icon: FileText, theme: "orange" },
];

const FloatingActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Helper to map theme colors to Tailwind classes
  const getThemeStyles = (theme: MenuItem["theme"]) => {
    switch (theme) {
      case "red":
        return "text-red-500";
      case "green":
        return "text-green-500";
      case "blue":
        return "text-blue-500";
      case "orange":
        return "text-orange-500";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div className="relative z-50">
      {/* --- Backdrop Overlay with Blur --- */}
      {/* This covers the entire screen when open */}
      <div
        className={`fixed inset-0 bg-white/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)} // Click background to close
        aria-hidden="true"
      />

      {/* --- Menu Items Container --- */}
      {/* Positioned absolutely above the main FAB button */}
      <div
        className={`fixed sm:bottom-24 bottom-42 right-6 flex flex-col items-end space-y-4 transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0 z-50"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {menuItems.map((item, index) => {
          const themeClass = getThemeStyles(item.theme);
          return (
            <button
              key={item.label}
              onClick={item.onClick}
              // Staggering the animation slightly for a smoother effect
              style={{ transitionDelay: `${index * 50}ms` }}
              className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg shadow-gray-200/50 hover:bg-gray-50 transition-transform active:scale-95"
            >
              {/* Icon with specific color theme */}
              <item.icon
                className={`w-5 h-5 ${themeClass}`}
                strokeWidth={2.5}
              />
              <Paragraph1 className="text-base font-bold text-gray-900">
                {item.label}
              </Paragraph1>
            </button>
          );
        })}
      </div>

      {/* --- Main Toggle Button (FAB) --- */}
      {/* Fixed at bottom right, toggles between Plus and X icon */}
      <button
        onClick={toggleMenu}
        className={`fixed sm:bottom-6 bottom-26 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 z-50 
          ${
            isOpen
              ? "bg-white text-blue-500 rotate-90"
              : "bg-blue-500 text-white rotate-0 hover:bg-blue-600"
          }`}
        aria-label={isOpen ? "Close menu" : "Open actions menu"}
      >
        {isOpen ? (
          <X className="w-8 h-8" strokeWidth={2.5} />
        ) : (
          <Plus className="w-8 h-8" strokeWidth={2.5} />
        )}
      </button>
    </div>
  );
};

export default FloatingActionMenu;




