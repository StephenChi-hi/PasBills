"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

interface Account {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface AccountDropdownProps {
  selected: Account | null;
  accounts: Account[];
  onSelect: (account: Account) => void;
  placeholder?: string;
}

const AccountDropdown: React.FC<AccountDropdownProps> = ({
  selected,
  accounts,
  onSelect,
  placeholder = "Select Account",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredAccounts = accounts.filter((acc) =>
    acc.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border p-3 rounded-xl border-gray-200 flex items-center justify-between hover:border-gray-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          {selected ? (
            <>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {selected.icon}
              </div>
              <Paragraph1 className="text-sm font-medium">
                {selected.name}
              </Paragraph1>
            </>
          ) : (
            <Paragraph1 className="text-sm text-gray-400">
              {placeholder}
            </Paragraph1>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-lg"
          >
            <div className="p-3 space-y-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search accounts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Accounts Grid */}
              <motion.div className="max-h-80 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {filteredAccounts.length > 0 ? (
                    <motion.div className="grid grid-cols-2 gap-2 p-2">
                      {filteredAccounts.map((acc, index) => (
                        <motion.button
                          key={acc.id}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          type="button"
                          onClick={() => {
                            onSelect(acc);
                            setIsOpen(false);
                            setSearch("");
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                            selected?.id === acc.id
                              ? "bg-blue-50 border-2 border-blue-400 ring-2 ring-blue-200"
                              : "bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                            {acc.icon}
                          </div>
                          <Paragraph1 className="text-xs font-medium text-center line-clamp-2">
                            {acc.name}
                          </Paragraph1>
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      className="text-sm text-gray-400 text-center py-4"
                    >
                      No accounts found
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountDropdown;
