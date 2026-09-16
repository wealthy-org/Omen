import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const proximaNova = localFont({
  src: [
    {
      path: "../public/fonts/ProximaNova-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/ProximaNova-Semibold.woff",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/ProximaNova-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/ProximaNova-Extrabld.woff",
      weight: "800",
      style: "normal",
    },
    {
      path: "../public/fonts/ProximaNova-Black.woff",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Omen — Web3 Prediction Markets & Points Farming",
  description: "Institutional Web3 prediction market and points gamification dashboard built on Arbitrum Sepolia.",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${proximaNova.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen antialiased font-sans">
        <ThemeProvider>
          <div className="min-h-screen flex flex-col w-full">
            <Navbar />
            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
              <div className="max-w-[1400px] w-full mx-auto">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
