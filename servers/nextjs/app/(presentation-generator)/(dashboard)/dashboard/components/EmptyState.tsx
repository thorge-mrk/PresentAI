import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "40vh",
      textAlign: "center",
      padding: "60px 20px",
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: "var(--radius-xl)",
        backgroundColor: "var(--accent-pale)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
      }}>
        <Sparkles size={30} style={{ color: "var(--mint-500)" }} />
      </div>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
        Noch keine Präsentationen
      </h3>
      <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
        Erstelle deine erste KI-Präsentation — in wenigen Minuten.
      </p>
      <Link
        href="/upload"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 20px",
          backgroundColor: "var(--mint-500)",
          color: "#fff",
          borderRadius: "var(--radius-md)",
          fontWeight: 600,
          fontSize: "0.875rem",
          textDecoration: "none",
          boxShadow: "0 8px 18px -10px rgba(20,184,166,0.65)",
        }}
      >
        <Sparkles size={16} />
        Neue Präsentation
      </Link>
    </div>
  );
};
