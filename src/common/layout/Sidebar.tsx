"use client";

import { X } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/10 z-40" />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-50
          bg-white/80 backdrop-blur-xl
          shadow-[20px_0_40px_rgba(0,0,0,0.08)]
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-5 flex justify-between items-center">
          <p className="font-semibold text-gray-900">Menu</p>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <nav className="px-5 space-y-4 text-gray-700">
          <p className="hover:text-blue-600 cursor-pointer">Home</p>
          <p className="hover:text-blue-600 cursor-pointer">Bills</p>
          <p className="hover:text-blue-600 cursor-pointer">Insights</p>
          <p className="hover:text-blue-600 cursor-pointer">Budgets</p>
          <p className="hover:text-blue-600 cursor-pointer">Accounts</p>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
