"use client";

import React, { useState } from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { Share2, Link as LinkIcon, FileText, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ExportSharePage: React.FC = () => {
  const [open, setOpen] = useState(false);

  const shareLink = "https://app.pasbills.com/share/your-report";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert("Share link copied to clipboard");
    } catch {
      alert("Could not copy link");
    }
  };

  return (
    <main className="w-full py-6 space-y-6">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <Paragraph3 className="text-sm uppercase tracking-wide opacity-80">
            Export &amp; Share
          </Paragraph3>
          <Paragraph2 className="text-2xl sm:text-3xl font-bold mt-1">
            Share reports, profiles and referrals
          </Paragraph2>
          <Paragraph1 className="text-sm sm:text-base mt-2 max-w-xl opacity-90">
            Generate a link to share your summary report, send a profile
            snapshot, or invite friends to the app.
          </Paragraph1>
        </div>
        <Share2 className="hidden sm:block w-12 h-12" />
      </div>

      <section className="border border-gray-200 rounded-2xl p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Paragraph2 className="text-lg font-bold text-gray-900 mb-1">
            Quick actions
          </Paragraph2>
          <Paragraph1 className="text-sm text-gray-600">
            Use the button on the right to open a smooth share sheet with
            multiple options.
          </Paragraph1>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-xl bg-yellow-400 text-gray-900 font-semibold flex items-center gap-2 shadow-sm hover:bg-yellow-300"
        >
          <Share2 className="w-4 h-4" />
          Open Share Sheet
        </button>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <div className="flex items-center justify-between mb-4">
                <Paragraph2 className="text-lg font-bold text-gray-900">
                  Share
                </Paragraph2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <Paragraph1 className="text-sm font-semibold text-gray-900">
                      Share monthly report (PDF)
                    </Paragraph1>
                  </div>
                  <Paragraph1 className="text-xs text-gray-500">
                    Coming soon
                  </Paragraph1>
                </button>

                <button
                  onClick={copyLink}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-emerald-500" />
                    <Paragraph1 className="text-sm font-semibold text-gray-900">
                      Copy share link
                    </Paragraph1>
                  </div>
                  <Paragraph1 className="text-xs text-gray-500 truncate max-w-[120px]">
                    {shareLink}
                  </Paragraph1>
                </button>

                <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-rose-500" />
                    <Paragraph1 className="text-sm font-semibold text-gray-900">
                      Share referral link
                    </Paragraph1>
                  </div>
                  <Paragraph1 className="text-xs text-gray-500">
                    Invite friends and earn rewards
                  </Paragraph1>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default ExportSharePage;
