import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Web3Providers } from "./providers";
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
  description: "Institutional Web3 prediction market and points gamification dashboard built on Ethereum Sepolia and Robinhood Chain.",
  icons: {
    icon: [
      { url: "/logo-omen 1.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/logo-omen 1.png",
    apple: "/logo-omen 1.png",
  },
  openGraph: {
    title: "Omen — Web3 Prediction Markets",
    description: "Social Belief Market Protocol turning opinions into tradable on-chain markets.",
    images: ["/logo-omen 1.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Omen — Web3 Prediction Markets",
    description: "Social Belief Market Protocol turning opinions into tradable on-chain markets.",
    images: ["/logo-omen 1.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const savedTheme = (cookieStore.get("omen-theme")?.value as "system" | "dark" | "light") || "system";
  const initialClass = savedTheme === "light" ? "light" : savedTheme === "dark" ? "dark" : "";

  return (
    <html
      lang="en"
      className={`${initialClass} ${proximaNova.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = null;
                  try { stored = localStorage.getItem('omen-theme'); } catch(e) {}
                  var cookieMatch = document.cookie.match(/(?:^|; )omen-theme=([^;]*)/);
                  var cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
                  var theme = stored || cookieTheme || 'system';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  var root = document.documentElement;
                  if (isDark) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                    root.style.colorScheme = 'dark';
                  } else {
                    root.classList.remove('dark');
                    root.classList.add('light');
                    root.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased font-sans bg-[#F3FAF6] dark:bg-[#030906] text-[#0B1F16] dark:text-white" suppressHydrationWarning>
        <ThemeProvider initialTheme={savedTheme}>
          <Web3Providers>
            <div className="min-h-screen flex flex-col w-full">
              <Navbar />
              <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
                <div className="max-w-[1400px] w-full mx-auto">
                  {children}
                </div>
              </main>
              <Footer />
            </div>
          </Web3Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
