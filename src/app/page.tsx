"use client";

import CashFlow from "./home/CashFlow";
import FloatingActionMenu from "./home/FloatingActionMenu";
import MonthlySpendingCard from "./home/MonthlySpendingCard";
import Networth from "./home/Networth";
import PlannerDemo from "./home/PlannerDemo";
import ProFeaturesDemo from "./home/ProFeaturesDemo";
import SpendingTracker from "./home/SpendingTracker";
import TransactionsDemo from "./home/TransactionsDemo";
import TrustFooter from "./home/TrustFooter";

const HomePage = () => {
  return (
    <section className="w-full  py-6">
      <div
        className="
          grid gap-4
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {/* Block 1 */}
        <SpendingTracker />
        {/* Block 2 */}
        <CashFlow />
        {/* Block 3 */}
        <Networth />
        {/* Block 4 */}
        <PlannerDemo />
        {/* Block 5 */}
        <TransactionsDemo /> <ProFeaturesDemo />
      </div>
      <TrustFooter />
      <FloatingActionMenu />
    </section>
  );
};

export default HomePage;
