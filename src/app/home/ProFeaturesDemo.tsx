"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  Sparkles,
  FileText,
  LayoutGrid,
  CalendarCheck,
  Repeat,
  TrendingUp,
  CreditCard,
  Share2,
} from "lucide-react";
import { useRouter } from "next/navigation";

const ProFeaturesCard: React.FC = () => {
  const router = useRouter();

  const features = [
    {
      label: "AI Insights",
      icon: Sparkles,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      route: "/ai-insights",
    },
    {
      label: "Monthly Reports",
      icon: FileText,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      route: "/monthly-reports",
    },
    {
      label: "Smart Widget",
      icon: LayoutGrid,
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      route: "/smart-widget",
    },
    {
      label: "Financial Planner",
      icon: CalendarCheck,
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      route: "/financial-planner",
    },

    // 🔥 New Pro Features
    {
      label: "Auto Bill Detection",
      icon: Repeat,
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600",
      route: "/auto-bill-detection",
    },
    {
      label: "Spending Forecast",
      icon: TrendingUp,
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-600",
      route: "/spending-forecast",
    },
    {
      label: "Multi-Account Sync",
      icon: CreditCard,
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
      route: "/multi-account-sync",
    },
    {
      label: "Export & Share",
      icon: Share2,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      route: "/export-share",
    },
  ];

  return (
    <div className=" p-4 sm:p-6 rounded-2xl w-full  border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Paragraph3 className="text-xl font-bold text-gray-900">
          Do More
        </Paragraph3>
        <span className="text-xl">👑</span>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => feature.route && router.push(feature.route)}
            className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${feature.bgColor} hover:bg-opacity-80`}
          >
            <Paragraph1 className="text-sm font-bold text-gray-900">
              {feature.label}
            </Paragraph1>
            <feature.icon className={`w-5 h-5 ${feature.textColor}`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProFeaturesCard;
