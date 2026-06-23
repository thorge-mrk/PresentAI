"use client";

import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

const DashboardNav = () => {
  const pathname = usePathname();
  const activeTab = pathname.split("?")[0].split("/").pop();

  const tabLabel: Record<string, string> = {
    dashboard: "Dashboard",
    templates: "Templates",
    theme: "Themes",
    settings: "Einstellungen",
  };

  const title = tabLabel[activeTab ?? ""] ?? (activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : "");

  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 20,
      backgroundColor: "var(--bg-base)",
      padding: "24px 0 16px",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      transition: "background-color var(--dur-base) var(--ease-out)",
    }}>
      <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
        {title}
      </h2>
      {activeTab !== "settings" && (
        <Link
          href={activeTab === "theme" ? "/theme?tab=new-theme" : "/upload"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            backgroundColor: "var(--mint-500)",
            color: "#fff",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: "0.8125rem",
            textDecoration: "none",
            boxShadow: "0 6px 14px -8px rgba(20,184,166,0.65)",
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          {activeTab === "theme" ? "Neues Theme" : "Neu"}
        </Link>
      )}
    </div>
  );
};

export default DashboardNav;
