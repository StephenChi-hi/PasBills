"use client";

import { useState } from "react";
import { X, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { signOut } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleLogoutConfirm = async () => {
    setConfirmLogout(false);
    onClose();
    await signOut();
    router.push("/");
  };
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
          <button
            onClick={() => navigate("/")}
            className="block hover:text-blue-600 cursor-pointer text-left w-full"
          >
            Home
          </button>
          <button
            onClick={() => navigate("/bills")}
            className="block hover:text-blue-600 cursor-pointer text-left w-full"
          >
            Bills
          </button>
          <button
            onClick={() => navigate("/insights")}
            className="block hover:text-blue-600 cursor-pointer text-left w-full"
          >
            Insights
          </button>
          <button
            onClick={() => navigate("/budgets")}
            className="block hover:text-blue-600 cursor-pointer text-left w-full"
          >
            Budgets
          </button>
          <button
            onClick={() => navigate("/accounts")}
            className="block hover:text-blue-600 cursor-pointer text-left w-full"
          >
            Accounts
          </button>
          <button
            onClick={() => navigate("/tax")}
            className="block hover:text-blue-600 cursor-pointer text-left w-full"
          >
            Tax Calculator
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="block hover:text-blue-600 cursor-pointer text-left w-full flex items-center gap-2 mt-4"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => setConfirmLogout(true)}
            className="block text-red-600 hover:text-red-700 cursor-pointer text-left w-full flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </nav>
        <AnimatePresence>
          {confirmLogout && (
            <motion.div
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="bg-white rounded-2xl p-6 w-80 shadow-xl"
              >
                <p className="font-semibold text-gray-900 mb-2">Log out?</p>
                <p className="text-sm text-gray-500 mb-4">
                  You’ll be signed out of PasBills on this device.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                    onClick={() => setConfirmLogout(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
                    onClick={handleLogoutConfirm}
                  >
                    Log out
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </>
  );
};

export default Sidebar;
