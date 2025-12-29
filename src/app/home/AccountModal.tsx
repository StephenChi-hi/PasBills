import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  HiOutlineMagnifyingGlass,
  HiOutlineBuildingLibrary,
  HiOutlinePlus,
} from "react-icons/hi2";
import { X, Bitcoin } from "lucide-react";

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  iconType: "bank" | "crypto";
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (account: Account) => void;
  accounts: Account[];
}

const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  accounts,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 [100] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-50">
        <button onClick={onClose}>
          <X className="w-6 h-6 text-gray-400" />
        </button>
        <Paragraph1 className="text-lg font-bold">Select Account</Paragraph1>
        <button className="text-blue-500 font-bold text-sm">Clear</button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-100 rounded-xl py-3 pl-10 pr-4 outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {accounts.map((acc) => (
          <button
            key={acc.id}
            onClick={() => {
              onSelect(acc);
              onClose();
            }}
            className="w-full flex items-center justify-between p-4 border-b border-gray-50 active:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg border border-gray-100 flex items-center justify-center">
                {acc.iconType === "bank" ? (
                  <HiOutlineBuildingLibrary className="w-8 h-8 text-blue-500" />
                ) : (
                  <Bitcoin className="w-8 h-8 text-blue-500" />
                )}
              </div>
              <div className="text-left">
                <Paragraph1 className="text-[15px] font-bold text-gray-900">
                  {acc.name}
                </Paragraph1>
                <Paragraph1 className="text-xs text-gray-400 font-medium">
                  {acc.type}
                </Paragraph1>
              </div>
            </div>
            <Paragraph1 className="text-[15px] font-bold text-gray-900">
              ₦{acc.balance.toLocaleString()}
            </Paragraph1>
          </button>
        ))}

        {/* Add Account */}
        <button className="w-full flex items-center gap-4 p-4 text-blue-500 hover:bg-blue-50">
          <HiOutlinePlus className="w-8 h-8" />
          <Paragraph1 className="text-[15px] font-bold">Add Account</Paragraph1>
        </button>
      </div>
    </div>
  );
};

export default AccountModal;
