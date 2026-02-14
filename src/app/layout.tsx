import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/common/layout/BottomNav";
import AppLayout from "@/common/layout/AppLayout";
import { AuthProvider } from "@/providers/AuthProvider";
import AuthGate from "./auth/AuthGate";
import SplashScreen from "./SplashScreen";

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
    default: "PassBills – Smart Money, Bills & Investments Manager",
    template: "%s | PassBills",
  },

  description:
    "PassBills is a smart personal finance app that helps you manage bills, track income and expenses, create budgets, monitor accounts, and manage investments in one secure place.",

  applicationName: "PassBills",

  keywords: [
    "PassBills",
    "bill management app",
    "money management",
    "expense tracker",
    "budget planner",
    "investment tracker",
    "personal finance",
    "financial planning",
    "wealth management",
  ],

  authors: [{ name: "PassBills Team" }],
  creator: "PassBills",
  publisher: "PassBills",

  metadataBase: new URL("https://passbills.app"), // change when domain is final

  openGraph: {
    title: "PassBills – Smart Money, Bills & Investments Manager",
    description:
      "Manage bills, budgets, expenses, accounts, and investments with PassBills. One app for complete financial control.",
    url: "https://passbills.app",
    siteName: "PassBills",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PassBills – Personal Finance Management App",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "PassBills – Smart Money, Bills & Investments Manager",
    description:
      "Track bills, manage budgets, monitor accounts, and grow your investments with PassBills.",
    images: ["/og-image.png"],
    creator: "@passbills", // optional
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

  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", sizes: "192x192", type: "image/png" }],
    shortcut: [{ url: "/logo.png", sizes: "192x192", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` pb-25 [100px]`}>
        <AuthProvider>
          <AuthGate>
            <SplashScreen>
              <AppLayout>{children}</AppLayout>
              <BottomNav />
            </SplashScreen>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
