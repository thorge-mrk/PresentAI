"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";

type LogoutButtonProps = {
  label?: string;
  iconOnly?: boolean;
};

export default function LogoutButton({ label = "Abmelden", iconOnly = false }: LogoutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // route back regardless
    } finally {
      window.location.replace("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        backgroundColor: "transparent",
        color: "var(--status-danger)",
        border: "1px solid var(--status-danger)",
        borderRadius: 10,
        fontFamily: "var(--font-family)",
        fontSize: "0.8125rem",
        fontWeight: 600,
        cursor: isSubmitting ? "not-allowed" : "pointer",
        opacity: isSubmitting ? 0.7 : 1,
        transition: "background-color var(--dur-fast) var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(212,91,78,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
      }}
    >
      <LogOut size={14} />
      {!iconOnly && <span>{isSubmitting ? "Abmelden…" : label}</span>}
    </button>
  );
}
