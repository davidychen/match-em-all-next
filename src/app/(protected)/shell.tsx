"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background" suppressHydrationWarning>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
