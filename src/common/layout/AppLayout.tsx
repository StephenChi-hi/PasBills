"use client";

import { useState } from "react";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";


export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="pt-20  min-h-screen">
      <TopNavbar
        isHome={true} // false on other pages
        pageTitle="Insights"
        pageDescription="Track performance and spending trends"
        onToggleSidebar={() => setSidebarOpen(true)}
      />

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="px-4">{children}</main>
    </div>
  );
}
