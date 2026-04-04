import type { Metadata, Viewport } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/auth-context";
import { CurrencyProvider } from "@/lib/currency/currency-context";
import { PWAClient } from "./pwa-client";
import { SplashScreen } from "./splash-screen";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "PasBills - Financial Dashboard",
  description: "Manage your personal and business finances with ease",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PasBills",
    startupImage: "/images/icon-192x192.png",
  },
  icons: {
    icon: [
      { url: "/images/icon-192x192.png", sizes: "192x192", type: "image/png" },
      {
        url: "/images/icon512_rounded.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/images/icon-192x192.png",
  },
  openGraph: {
    locale: "en_US",
    url: "https://pasbills.app",
    title: "PasBills - Financial Dashboard",
    description: "Manage your personal and business finances with ease",
    type: "website",
    images: [
      {
        url: "/images/icon512_rounded.png",
        width: 512,
        height: 512,
        alt: "PasBills Logo",
      },
    ],
  },
  other: {
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "application-name": "PasBills",
    "msapplication-TileColor": "#ffffff",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PWAClient />
        <SplashScreen />
        <AuthProvider>
          <CurrencyProvider>{children}</CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
