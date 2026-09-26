"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || Boolean(pathname?.startsWith("/admin/"));

  return (
    <>
      {!isAdmin && <Navbar />}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8">
        <div className="max-w-[1400px] w-full mx-auto">{children}</div>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
