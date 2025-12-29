"use client";

import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { Paragraph1 } from "@/common/ui/Text";
import {
  HiOutlineChevronRight,
  HiOutlineCalendar,
  HiOutlinePencilSquare,
  HiOutlineCamera,
  HiOutlineBuildingLibrary,
  HiReceiptPercent,
} from "react-icons/hi2";
import { TrendingUp, Calculator } from "lucide-react";

import CategoryModal from "./CategoryModal";
import AccountModal from "./AccountModal";
import { recentCategories, allCategories, mockAccounts } from "@/util/mockData";

const AddExpenseForm: React.FC = () => {
  const [showCatModal, setShowCatModal] = useState(false);
  const [showAccModal, setShowAccModal] = useState(false);

  return (
    <Formik
      initialValues={{
        amount: "",
        category: "",
        account: "",
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD for input[type=date]
        note: "",
      }}
      onSubmit={(values) => console.log(values)}
    >
      {({ values, setFieldValue }) => (
        <Form className="w-full max-w-md mx-auto bg-white min-h-screen flex flex-col">
          {/* Amount Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg font-bold text-gray-600">
                ₦
              </div>
              <Field
                name="amount"
                placeholder="Amount"
                className="text-2xl font-bold outline-none w-full placeholder:text-gray-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-gray-400" />
              
            </div>
          </div>

          <div className="flex-1 space-y-3 px-4">
            {/* Category Trigger */}
            <div
              onClick={() => setShowCatModal(true)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <HiReceiptPercent className="w-6 h-6 text-red-400" />
                </div>
                <Paragraph1
                  className={`text-base font-bold ${
                    values.category ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {values.category || "Categories"}
                </Paragraph1>
              </div>
              <HiOutlineChevronRight className="w-6 h-6 text-gray-300" />
            </div>

            {/* Account Trigger */}
            <div
              onClick={() => setShowAccModal(true)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <HiOutlineBuildingLibrary className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <Paragraph1
                    className={`text-base font-bold ${
                      values.account ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {values.account || "Bank account"}
                  </Paragraph1>
                  {values.account && (
                    <Paragraph1 className="text-[10px] text-gray-400 font-bold">
                      Balance: ₦60,766.54
                    </Paragraph1>
                  )}
                </div>
              </div>
              <HiOutlineChevronRight className="w-6 h-6 text-gray-300" />
            </div>

            {/* Date */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HiOutlineCalendar className="w-6 h-6 text-gray-500" />
                <Field
                  type="date"
                  name="date"
                  className="outline-none text-gray-700"
                />
              </div>
              <HiOutlineChevronRight className="w-6 h-6 text-gray-300" />
            </div>

            {/* Notes */}
            <div className="flex items-center gap-2">
              <HiOutlinePencilSquare className="w-6 h-6 text-gray-500" />
              <Field
                name="note"
                placeholder="Notes..."
                className="flex-1 outline-none bg-transparent"
              />
            </div>

            {/* Attach Photo */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HiOutlineCamera className="w-6 h-6 text-gray-500" />
                <Paragraph1 className="text-gray-400">Attach Photo</Paragraph1>
              </div>
              <HiOutlineChevronRight className="w-6 h-6 text-gray-300" />
            </div>
          </div>

          {/* Modals */}
          <CategoryModal
            isOpen={showCatModal}
            onClose={() => setShowCatModal(false)}
            recentCategories={recentCategories}
            allCategories={allCategories}
            onSelect={(cat) => setFieldValue("category", cat.name)}
          />

          <AccountModal
            isOpen={showAccModal}
            onClose={() => setShowAccModal(false)}
            accounts={mockAccounts}
            onSelect={(acc) => setFieldValue("account", acc.name)}
          />
        </Form>
      )}
    </Formik>
  );
};

export default AddExpenseForm;
