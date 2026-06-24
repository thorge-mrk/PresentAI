"use client";

import React from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Layers,
  Palette,
  Settings,
  Sun,
  Moon,
  PlusCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/templates", label: "Templates", icon: Layers },
  { href: "/theme", label: "Themes", icon: Palette },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      style={{
        width: 80,
        minWidth: 80,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--bg-muted)",
        paddingTop: 24,
        paddingBottom: 24,
        gap: 0,
        zIndex: 40,
        transition: "background-color var(--dur-base) var(--ease-out)",
      }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, width: "100%" }}>
        <Link href="/dashboard" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textDecoration: "none", marginBottom: 8 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: "var(--mint-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px -4px rgba(20,184,166,0.50)",
          }}>
            {/* Orately soundwave glyph */}
            <svg width="26" height="26" viewBox="0 0 200 200" fill="none">
              <g stroke="#08110F" strokeWidth="22" strokeLinecap="round">
                <line x1="48"  y1="86"  x2="48"  y2="114" />
                <line x1="76"  y1="68"  x2="76"  y2="132" />
                <line x1="104" y1="54"  x2="104" y2="146" />
                <line x1="132" y1="74"  x2="132" y2="126" />
                <line x1="158" y1="90"  x2="158" y2="110" />
              </g>
            </svg>
          </div>
          <span style={{ fontSize: 8, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.04em", lineHeight: 1, textTransform: "uppercase" }}>
            Present
          </span>
        </Link>

        {/* Create new */}
        <Link
          href="/upload"
          title="Neue Präsentation"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            textDecoration: "none",
            padding: "10px 8px",
            borderRadius: 12,
            backgroundColor: "var(--accent-pale)",
            color: "var(--accent)",
            width: 58,
            transition: "transform var(--dur-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
        >
          <PlusCircle size={20} />
          <span style={{ fontSize: 9, fontWeight: 600, lineHeight: 1 }}>Neu</span>
        </Link>

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                prefetch={false}
                href={href}
                title={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  padding: "10px 8px",
                  borderRadius: 12,
                  width: 58,
                  textDecoration: "none",
                  backgroundColor: active ? "var(--accent-pale)" : "transparent",
                  color: active ? "var(--accent)" : "var(--text-secondary)",
                  transition: "background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, lineHeight: 1 }}>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: settings + theme toggle */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%", borderTop: "1px solid var(--bg-muted)", paddingTop: 16 }}>
        {bottomItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              prefetch={false}
              href={href}
              title={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "10px 8px",
                borderRadius: 12,
                width: 58,
                textDecoration: "none",
                backgroundColor: active ? "var(--accent-pale)" : "transparent",
                color: active ? "var(--accent)" : "var(--text-secondary)",
                transition: "background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, lineHeight: 1 }}>{label}</span>
            </Link>
          );
        })}

        {/* Dark/light toggle */}
        <button
          title={theme === "dark" ? "Zum hellen Modus wechseln" : "Zum dunklen Modus wechseln"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "10px 8px",
            borderRadius: 12,
            width: 58,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
            transition: "background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-muted)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
          }}
        >
          {theme === "dark" ? <Sun size={20} strokeWidth={1.8} /> : <Moon size={20} strokeWidth={1.8} />}
          <span style={{ fontSize: 9, fontWeight: 400, lineHeight: 1 }}>
            {theme === "dark" ? "Hell" : "Dunkel"}
          </span>
        </button>
      </div>
    </aside>
  );
}
