"use client";

import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MobileMenuProps {
  onNavigate?: (section: string) => void;
  onLogout?: () => void;
  toolsComponents?: {
    CurrencySwitcher?: React.ComponentType;
    DownloadTransactionsButton?: React.ComponentType;
    AITimelineButton?: React.ComponentType;
    CalculateTaxButton?: React.ComponentType;
    ResetDataButton?: React.ComponentType;
  };
}

export function MobileMenu({
  onNavigate,
  onLogout,
  toolsComponents,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sections = [
    { id: "accounts", label: "Accounts" },
    { id: "businesses", label: "Businesses" },
    { id: "loans", label: "Loans" },
    { id: "tangible-assets", label: "Tangible Assets" },
    { id: "cash-flow-dynamics", label: "Cash Flow Dynamics" },
  ];

  const {
    CurrencySwitcher,
    DownloadTransactionsButton,
    AITimelineButton,
    CalculateTaxButton,
    ResetDataButton,
  } = toolsComponents || {};

  const handleNavigate = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-fit items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 font-medium transition-colors"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Menu Overlay and Panel - Mobile Slide-in and Desktop Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />

            {/* Slide-in Panel from Right (Mobile) / Modal (Desktop) */}
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed right-0 bottom-0 h-screen w-full z-50 md:w-96 md:h-screen md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl"
            >
              {/* Glass Morphism Background */}
              <div className="absolute inset-0 sm:right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-l border-white/20 dark:border-zinc-700/20 md:border md:border-white/30 dark:md:border-zinc-700/30 md:rounded-2xl" />

              {/* Content */}
              <div className="relative h-full  md:overflow-y-auto md:overflow-x-hidden flex flex-col p-6">
                {/* Close Button */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    Menu
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5 text-zinc-900 dark:text-zinc-50" />
                  </button>
                </div>

                {/* Tools Section */}
                {toolsComponents && (
                  <div className="space-y-3 mb-6 md:max-h-48 ">
                    <div className="flex flex-col gap-2 w-full">
                      {CurrencySwitcher && (
                        <div className="flex-1 min-w-[calc(50%-0.375rem)]">
                          <CurrencySwitcher />
                        </div>
                      )}
                      {DownloadTransactionsButton && (
                        <div className="flex-1 min-w-[calc(50%-0.375rem)]">
                          <DownloadTransactionsButton />
                        </div>
                      )}
                      {AITimelineButton && (
                        <div className="flex-1 min-w-[calc(50%-0.375rem)]">
                          <AITimelineButton />
                        </div>
                      )}
                      {CalculateTaxButton && (
                        <div className="flex-1 min-w-[calc(50%-0.375rem)]">
                          <CalculateTaxButton />
                        </div>
                      )}
                      {ResetDataButton && (
                        <div className="flex-1 min-w-[calc(50%-0.375rem)]">
                          <ResetDataButton />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <nav className="space-y-3 flex-1 md:max-h-96">
                  {sections.map((section) => (
                    <motion.button
                      key={section.id}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigate(section.id)}
                      className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 hover:from-zinc-200 hover:to-zinc-100 dark:hover:from-zinc-700 dark:hover:to-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md"
                    >
                      {section.label}
                    </motion.button>
                  ))}
                </nav>

                {/* Logout Button */}
                {onLogout && (
                  <motion.button
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onLogout}
                    className="w-full mt-6 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white font-medium transition-all border border-red-500 dark:border-red-600 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </motion.button>
                )}

                {/* Footer Info */}
                <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Section Navigation
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
