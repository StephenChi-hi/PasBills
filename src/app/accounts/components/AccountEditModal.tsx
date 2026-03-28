"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { supabase } from "@/util/supabase/client";

interface Account {
  id: string;
  name: string;
  type: string;
  category: string;
  balance: number;
}

interface AccountEditModalProps {
  isOpen: boolean;
  account: Account | null;
  onClose: () => void;
  onSave: () => void;
}

const AccountEditModal: React.FC<AccountEditModalProps> = ({
  isOpen,
  account,
  onClose,
  onSave,
}) => {
  const [editName, setEditName] = useState(account?.name || "");
  const [editType, setEditType] = useState(account?.type || "");
  const [editBalance, setEditBalance] = useState(account?.balance || 0);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  React.useEffect(() => {
    if (account) {
      setEditName(account.name);
      setEditType(account.type);
      setEditBalance(account.balance);
    }
  }, [account]);

  const handleSave = async () => {
    if (!account || !editName.trim()) {
      alert("Account name is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("Account")
        .update({
          name: editName,
          type: editType,
          balance: editBalance,
        })
        .eq("id", account.id);

      if (error) throw error;

      alert("Account updated successfully");
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!account) return;

    if (!window.confirm("Are you sure you want to delete this account?")) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("Account")
        .delete()
        .eq("id", account.id);

      if (error) throw error;

      alert("Account deleted successfully");
      onSave();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && account && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <Paragraph1 className="text-lg font-bold">
                Edit Account
              </Paragraph1>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Paragraph1 className="text-sm font-medium text-gray-700 mb-1">
                  Account Name
                </Paragraph1>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. VFD Bank"
                />
              </div>

              <div>
                <Paragraph1 className="text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </Paragraph1>
                <input
                  type="text"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Bank account"
                />
              </div>

              <div>
                <Paragraph1 className="text-sm font-medium text-gray-700 mb-1">
                  Balance
                </Paragraph1>
                <input
                  type="number"
                  value={editBalance}
                  onChange={(e) =>
                    setEditBalance(parseFloat(e.target.value) || 0)
                  }
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDelete}
                disabled={deleting || loading}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 p-2 rounded-lg transition text-sm font-medium"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={onClose}
                disabled={loading || deleting}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 p-2 rounded-lg transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || deleting}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 p-2 rounded-lg transition text-sm font-medium"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AccountEditModal;
