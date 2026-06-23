"use client";
import React from "react";
import { User, Shield, LogOut, Sparkles, Image, FileDown } from "lucide-react";
import LogoutButton from "@/components/Auth/LogoutButton";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const InfoCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div style={{
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    padding: "16px 20px",
    backgroundColor: "var(--bg-surface)",
    border: "1px solid var(--bg-muted)",
    borderRadius: 16,
  }}>
    <div style={{
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "var(--accent-pale)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={18} style={{ color: "var(--mint-500)" }} />
    </div>
    <div>
      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{description}</div>
    </div>
  </div>
);

export default function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-base)",
      padding: "32px",
      transition: "background-color var(--dur-base) var(--ease-out)",
    }}>
      <div style={{ maxWidth: 640 }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div className="o-label" style={{ marginBottom: 6 }}>Konfiguration</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", margin: 0 }}>
            Einstellungen
          </h1>
        </div>

        {/* Account section */}
        <section style={{ marginBottom: 40 }}>
          <div className="o-label" style={{ marginBottom: 12 }}>Account</div>
          <div style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--bg-muted)",
            borderRadius: 20,
            boxShadow: "var(--shadow-sm)",
            overflow: "hidden",
          }}>
            {/* User info */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--bg-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "var(--accent-pale)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <User size={22} style={{ color: "var(--mint-500)" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
                    {email ?? "Wird geladen…"}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Angemeldet via Supabase Auth</div>
                </div>
              </div>
            </div>

            {/* Logout */}
            <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text-primary)" }}>Abmelden</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>Aus dem Account ausloggen</div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </section>

        {/* Backend info */}
        <section style={{ marginBottom: 40 }}>
          <div className="o-label" style={{ marginBottom: 12 }}>Backend & KI</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <InfoCard
              icon={Sparkles}
              title="Gemini 3.1 Flash Lite"
              description="Text- und Gliederungsgenerierung via Google Gemini — konfiguriert via Supabase Edge Functions."
            />
            <InfoCard
              icon={Image}
              title="KI-Bildgenerierung (Nano Banana)"
              description="Bilder werden mit Gemini generiert oder von Pexels/Unsplash als Fallback bezogen. Keine eigenen API-Keys nötig."
            />
            <InfoCard
              icon={FileDown}
              title="PPTX & PDF Export"
              description="Präsentationen können als PowerPoint (.pptx) heruntergeladen oder als PDF gedruckt werden."
            />
            <InfoCard
              icon={Shield}
              title="Datensicherheit"
              description="Alle Daten liegen in deiner Supabase-Datenbank. Row Level Security stellt sicher, dass nur du deine Präsentationen sehen kannst."
            />
          </div>
        </section>

        {/* App info */}
        <div style={{
          padding: "16px 20px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--bg-muted)",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: "var(--mint-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 200 200" fill="none">
                <g stroke="#08110F" strokeWidth="28" strokeLinecap="round">
                  <line x1="48"  y1="86"  x2="48"  y2="114" />
                  <line x1="76"  y1="68"  x2="76"  y2="132" />
                  <line x1="104" y1="54"  x2="104" y2="146" />
                  <line x1="132" y1="74"  x2="132" y2="126" />
                  <line x1="158" y1="90"  x2="158" y2="110" />
                </g>
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-primary)" }}>Present</div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)" }}>by Orately AI · Supabase Backend</div>
            </div>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>v2.2</div>
        </div>
      </div>
    </div>
  );
}
