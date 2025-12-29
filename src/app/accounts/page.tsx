import React from "react";
import AccountsPage from "./components/AccountsPage";
import InvestmentsCard from "./components/InvestmentsCard";
import { Paragraph3 } from "@/common/ui/Text";
import NetworthSection from "./components/NetworthSection";
import CashCard from "./components/CashCard";
import CashTrend from "./components/CashTrend";
import InvestmentTrend from "./components/InvestmentTrend";
import AccountCreationFlow from "./components/AccountCreationFlow";

function page() {
  return (
    <div>
      {" "}
      <div className=" py-2 flex justify-between gap-4 items-center ">
        {" "}
        <Paragraph3 className=" font-bold mb-2"> Accounts</Paragraph3>{" "}
        <AccountCreationFlow />
      </div>
      <div className=" grid sm:grid-cols-3 grid-cols-1 gap-4">
        <NetworthSection /> <CashCard /> <InvestmentsCard />
      </div>
      <Paragraph3 className=" font-bold mb-2 mt-4"> Trends</Paragraph3>
      <div className=" grid sm:grid-cols-3 grid-cols-1 gap-4">
        <CashTrend />
        <InvestmentTrend />
      </div>
    </div>
  );
}

export default page;
