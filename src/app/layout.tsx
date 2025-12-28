import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/common/layout/BottomNav";
import AppLayout from "@/common/layout/AppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "PasBills – Smart Money, Bills & Investments Manager",
    template: "%s | PasBills",
  },

  description:
    "PasBills is a smart personal finance app that helps you manage bills, track income and expenses, create budgets, monitor accounts, and manage investments in one secure place.",

  applicationName: "PasBills",

  keywords: [
    "PasBills",
    "bill management app",
    "money management",
    "expense tracker",
    "budget planner",
    "investment tracker",
    "personal finance",
    "financial planning",
    "wealth management",
  ],

  authors: [{ name: "PasBills Team" }],
  creator: "PasBills",
  publisher: "PasBills",

  metadataBase: new URL("https://pasbills.app"), // change when domain is final

  openGraph: {
    title: "PasBills – Smart Money, Bills & Investments Manager",
    description:
      "Manage bills, budgets, expenses, accounts, and investments with PasBills. One app for complete financial control.",
    url: "https://pasbills.app",
    siteName: "PasBills",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PasBills – Personal Finance Management App",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "PasBills – Smart Money, Bills & Investments Manager",
    description:
      "Track bills, manage budgets, monitor accounts, and grow your investments with PasBills.",
    images: ["/og-image.png"],
    creator: "@pasbills", // optional
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "finance",

  themeColor: "#0F766E", // Tailwind teal-700 (trust & finance)
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={` pb-25 [100px]`}
      >
        <AppLayout> {children} </AppLayout>

        <BottomNav />
      </body>
    </html>
  );
}
