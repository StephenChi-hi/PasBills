import React from "react";
import RecentTransactions, { Transaction } from "./RecentTransactions";

const demoTransactions: Transaction[] = [
  {
    id: "1",
    title: "Certificate",
    date: "Dec 21",
    amount: 5888.0,
    type: "expense",
    category: "certificate",
  },
  {
    id: "2",
    title: "Bonus",
    date: "Dec 21",
    amount: 2555.0,
    type: "income",
    category: "bonus",
  },
  {
    id: "3",
    title: "Bank Charge",
    date: "Dec 21",
    amount: 255.0,
    type: "expense",
    category: "charge",
  },
];

const TransactionsDemo = () => {
  return (
    <>
      <RecentTransactions
        transactions={demoTransactions}
        onViewAll={() => console.log("View all clicked")}
      />
    </>
  );
};

export default TransactionsDemo;
