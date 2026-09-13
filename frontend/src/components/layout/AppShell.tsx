"use client";

import React, { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
  customBreadcrumb?: React.ReactNode;
  maxWidth?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  customBreadcrumb,
  maxWidth = "w-full max-w-[1536px]",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <TopBar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          customBreadcrumb={customBreadcrumb}
        />
        <main className="relative pt-16 bg-surface flex-1">
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
