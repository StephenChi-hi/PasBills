"use client";

import { Sparkles } from "lucide-react";

interface AITimelineButtonProps {
  onClick?: () => void;
}

export function AITimelineButton({ onClick }: AITimelineButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-800 dark:to-zinc-900 hover:from-zinc-200 hover:to-zinc-100 dark:hover:from-zinc-700 dark:hover:to-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium transition-all border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md"
    >
      <Sparkles className="h-4 w-4" />
      AI Summary
    </button>
  );
}
