"use client";

import React, { useState, useEffect } from "react";
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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dlabs_sidebar_collapsed") === "true";
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("dlabs_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-surface">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
        }`}
      >
        <TopBar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          customBreadcrumb={customBreadcrumb}
          isCollapsed={isCollapsed}
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
