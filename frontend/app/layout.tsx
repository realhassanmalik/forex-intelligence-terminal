import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";

import "./globals.css";

export const metadata: Metadata = {
  title: "FOREX INTEL // TERMINAL",
  description: "AI-powered forex trading terminal",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-white antialiased">
        <div id="app-root" className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <StatusBar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
