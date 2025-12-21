"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Receipt, PieChart, Wallet, CreditCard } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Bills", href: "/bills", icon: Receipt },
  { label: "Insights", href: "/insights", icon: PieChart },
  { label: "Budgets", href: "/budgets", icon: Wallet },
  { label: "Accounts", href: "/accounts", icon: CreditCard },
];

const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="
        fixed bottom-4 left-1/2 -translate-x-1/2 z-50
        w-[95%] max-w-md
        bg-white/70 backdrop-blur-xl
        rounded-full
        shadow-[0_10px_30px_rgba(0,0,0,0.08)]
        border border-gray-200
      "
    >
      <ul className="flex justify-between px-6 py-3">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <li key={label} className="flex-1">
              <button
                onClick={() => router.push(href)}
                className="
                  w-full flex flex-col items-center justify-center gap-1
                  py-1 transition-all duration-200
                "
              >
                <Icon
                  className={clsx(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )}
                />

                <span
                  className={clsx(
                    "text-xs font-medium transition-colors",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )}
                >
                  {label}
                </span>

            
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
