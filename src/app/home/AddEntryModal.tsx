"use client";

import React from "react";
import { X, ArrowLeft } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import ExpenseTab from "./ExpenseTab";
import IncomeTab from "./IncomeTab";
import TransferTab from "./TransferTab";
import BillTab from "./BillTab";
import { AddEntryTab } from "@/util/types";
import { motion, AnimatePresence } from "framer-motion";

interface AddEntryModalProps {
  isOpen: boolean;
  activeTab: AddEntryTab;
  onClose: () => void;
  onTabChange: (tab: AddEntryTab) => void;
}

const tabs: { id: AddEntryTab; label: string }[] = [
  { id: "expense", label: "EXPENSE" },
  { id: "income", label: "INCOME" },
  { id: "transfer", label: "TRANSFER" },
  { id: "bill", label: "BILLS" },
];

const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  activeTab,
  onClose,
  onTabChange,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (no blur, lighter on mobile) */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 sm:bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal wrapper */}
          <motion.div
            className="fixed inset-0 z-999 flex items-end sm:items-center justify-center"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {/* Modal */}
            <div
              className="
                w-full
                h-dvh [100dvh]
                sm:h-125 [500px]
                sm:w-[600px]
                bg-white
                rounded-none
                sm:rounded-2xl
                shadow-none
                sm:shadow-2xl
                flex
                flex-col
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header (sticky) */}
              <div className="sticky top-0 z-10 bg-white rounded-2xl border-gray-200 border-b px-4 py-3 flex items-center justify-between">
                <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </motion.button>

                <Paragraph1 className="font-semibold text-gray-900">
                  Add Entry
                </Paragraph1>

                <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}>
                  <X className="w-5 h-5 text-gray-700" />
                </motion.button>
              </div>

              {/* Tabs (sticky) */}
              <div className="relative flex border-b border-gray-200 bg-white">
                {tabs.map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`relative flex-1 py-3 text-xs font- capitalize tracking-wide ${
                        active ? "text-orange-500" : "text-gray-400"
                      }`}
                    >
                      <Paragraph1>{tab.label} </Paragraph1>

                      {active && (
                        <motion.span
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 [2px] bg-orange-500"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Content (scrollable) */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === "expense" && <ExpenseTab />}
                    {activeTab === "income" && <IncomeTab />}
                    {activeTab === "transfer" && <TransferTab />}
                    {activeTab === "bill" && <BillTab />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddEntryModal;
