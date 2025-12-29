"use client";

import React from "react";
import { X } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

interface Option {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface SelectionModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  options: Option[];
  onSelect: (option: Option) => void;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  title,
  isOpen,
  onClose,
  options,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Paragraph1 className="text-lg font-semibold">{title}</Paragraph1>
        <button onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              onSelect(option);
              onClose();
            }}
            className="w-full flex items-center gap-3 p-4 border-b hover:bg-gray-50"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              {option.icon}
            </div>
            <Paragraph1 className="text-base">{option.name}</Paragraph1>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectionModal;
