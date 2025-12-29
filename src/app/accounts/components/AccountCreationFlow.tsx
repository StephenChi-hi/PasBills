"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineCurrencyEuro } from "react-icons/hi2";
import { ChevronLeft, Plus } from "lucide-react";
import { supabase } from "@/util/supabase/client";
import {
  AccountOption,
  SelectAccountTypeModalProps,
  AddAccountModalProps,
} from "@/util/types"; // adjust the path

import { accountTypes } from "@/data/accountTypes"; // adjust the path to match your folder structure

// --- Components ---

const SelectAccountTypeModal: React.FC<SelectAccountTypeModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-999">
      <div className="bg-white w-full max-w-md h-full md:h-125 [500px] overflow-y-auto md:rounded-2xl flex flex-col shadow-xl">
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <button onClick={onClose} className="flex items-center gap-1">
            <ChevronLeft className="w-5 h-5" />
            <Paragraph1>Accounts</Paragraph1>
          </button>
          <Paragraph1 className="flex-1 text-center font-bold">
            Select Account Type
          </Paragraph1>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {accountTypes.map((section) => (
            <div key={section.category} className="mb-6">
              <Paragraph1 className="font-bold mb-3">
                {section.category}
              </Paragraph1>
              <div className="grid grid-cols-3 gap-3">
                {section.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onSelect(option)}
                    className="flex flex-col items-center gap-2 p-4 border rounded-2xl border-gray-200"
                  >
                    <option.icon className="w-8 h-8 text-blue-500" />
                    <Paragraph1 className="text-xs text-center">
                      {option.name}
                    </Paragraph1>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onBack,
  selectedType,
}) => {
  if (!isOpen) return null;

  const [includeBalance, setIncludeBalance] = useState(true);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    number: "",
    balance: "",
    currency: "USD",
    notes: "",
  });

  const handleCreate = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    await supabase.from("accounts").insert({
      user_id: user.id,
      type_id: selectedType?.id,
      type_name: selectedType?.name,
      name: form.name,
      account_number: form.number,
      starting_balance: Number(form.balance || 0),
      currency: form.currency,
      notes: form.notes,
      include_in_net_worth: includeBalance,
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-999">
      <div className="bg-white w-full max-w-md h-full md:h-125 [500px] overflow-y-auto md:rounded-2xl flex flex-col shadow-xl">
        <div className="flex items-center px-4 py-3 border-b border-gray-200">
          <button onClick={onBack} className="flex items-center gap-1">
            <ChevronLeft className="w-5 h-5" />
            <Paragraph1>Back</Paragraph1>
          </button>
          <Paragraph1 className="flex-1 text-center font-bold">
            Add Account
          </Paragraph1>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full border">
              {selectedType?.icon && (
                <selectedType.icon className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div>
              <Paragraph1 className="text-xs uppercase text-gray-400">
                Account Type
              </Paragraph1>
              <Paragraph1 className="font-bold">
                {selectedType?.name}
              </Paragraph1>
            </div>
          </div>

          <div className="space-y-4">
            <input
              className="w-full border rounded-2xl border-gray-200 px-4 py-3"
              placeholder="Account Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="w-full border rounded-2xl border-gray-200 px-4 py-3"
              placeholder="Account Number"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
            />

            <input
              type="number"
              className="w-full border rounded-2xl border-gray-200 px-4 py-3"
              placeholder="Starting Balance"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
            />

            <select
              className="w-full border rounded-2xl border-gray-200 px-4 py-3 bg-white"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              <option value="USD">USD – US Dollar</option>
              <option value="NGN">NGN – Nigerian Naira</option>
            </select>

            <textarea
              rows={4}
              className="w-full border rounded-2xl border-gray-200 px-4 py-3 resize-none"
              placeholder="More details"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <HiOutlineCurrencyEuro className="w-5 h-5 text-gray-500" />
              <Paragraph1 className="text-sm">
                Include balance in net worth
              </Paragraph1>
            </div>
            <button
              type="button"
              onClick={() => setIncludeBalance(!includeBalance)}
              className={`w-12 h-6 rounded-full p-1 ${
                includeBalance ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  includeBalance ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-4 flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 border rounded-2xl border-gray-200"
          >
            <Paragraph1>Back</Paragraph1>
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-3 bg-blue-500 rounded-xl text-white"
          >
            <Paragraph1>
              {loading ? "Creating..." : "Create Account"}
            </Paragraph1>
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountCreationFlow = () => {
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<AccountOption | null>(null);

  return (
    <div>
      <button
        onClick={() => setIsTypeOpen(true)}
        className="p-2 bg-blue-500 rounded-xl text-white"
      >
        <Plus size={24} />
      </button>

      <SelectAccountTypeModal
        isOpen={isTypeOpen}
        onClose={() => setIsTypeOpen(false)}
        onSelect={(type) => {
          setSelectedType(type);
          setIsTypeOpen(false);
          setIsAddOpen(true);
        }}
      />

      <AddAccountModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onBack={() => {
          setIsAddOpen(false);
          setIsTypeOpen(true);
        }}
        selectedType={selectedType}
      />
    </div>
  );
};

export default AccountCreationFlow;
