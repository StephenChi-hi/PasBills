"use client";

import CashFlow from "./home/CashFlow";
import MonthlySpendingCard from "./home/MonthlySpendingCard";
import Networth from "./home/Networth";
import SpendingTracker from "./home/SpendingTracker";

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
        <div className="h-40 rounded-xl bg-gray-100" />
        {/* Block 5 */}
        <div className="h-40 rounded-xl bg-gray-100" />
      </div>
    </section>
  );
};

export default HomePage;
