"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DashboardApi } from "@/app/(presentation-generator)/services/api/dashboard";
import { PresentationGrid } from "@/app/(presentation-generator)/(dashboard)/dashboard/components/PresentationGrid";
import Link from "next/link";
import { ArrowUpDown, Plus, Sparkles } from "lucide-react";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { usePathname } from "next/navigation";

const DashboardPage: React.FC = () => {
  const pathname = usePathname();
  const [presentations, setPresentations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deckSortDirection, setDeckSortDirection] = useState<"desc" | "asc">("desc");

  const sortedPresentations = useMemo(() => {
    if (!presentations) return presentations;
    return [...presentations].sort((a: any, b: any) => {
      const first  = new Date(a.updated_at ?? a.created_at).getTime();
      const second = new Date(b.updated_at ?? b.created_at).getTime();
      return deckSortDirection === "desc" ? second - first : first - second;
    });
  }, [presentations, deckSortDirection]);

  useEffect(() => { fetchPresentations(); }, []);

  const fetchPresentations = async () => {
    let fetchedCount = 0;
    let hasError = false;
    try {
      setIsLoading(true);
      setError(null);
      const data = await DashboardApi.getPresentations();
      fetchedCount = data.length;
      data.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setPresentations(data);
    } catch {
      hasError = true;
      setError(null);
      setPresentations([]);
    } finally {
      trackEvent(MixpanelEvent.Dashboard_Page_Viewed, { pathname, presentation_count: fetchedCount, load_failed: hasError });
      setIsLoading(false);
    }
  };

  const removePresentation = (presentationId: string) => {
    setPresentations((prev: any) => prev ? prev.filter((p: any) => p.id !== presentationId) : []);
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-base)",
      padding: "0 32px 48px",
      transition: "background-color var(--dur-base) var(--ease-out)",
    }}>
      {/* Header */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backgroundColor: "var(--bg-base)",
        paddingTop: 32,
        paddingBottom: 20,
        borderBottom: "1px solid var(--bg-muted)",
        marginBottom: 32,
        transition: "background-color var(--dur-base) var(--ease-out)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div className="o-label" style={{ marginBottom: 6 }}>Meine Präsentationen</div>
            <h1 style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              lineHeight: 1.2,
              margin: 0,
            }}>
              Present<span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)", marginLeft: 8, letterSpacing: "0" }}>by Orately AI</span>
            </h1>
          </div>
          <Link
            href="/upload"
            onClick={() => trackEvent(MixpanelEvent.Dashboard_New_Presentation_Clicked, { pathname, source: "dashboard_header" })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              backgroundColor: "var(--mint-500)",
              color: "#fff",
              borderRadius: 12,
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
              boxShadow: "0 8px 18px -10px rgba(20,184,166,0.65)",
              transition: "filter var(--dur-fast) var(--ease-out)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.08)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Neue Präsentation
          </Link>
        </div>
      </div>

      {/* Quick create card */}
      <section style={{ marginBottom: 48 }}>
        <div className="o-label" style={{ marginBottom: 16 }}>Schnellstart</div>
        <Link
          href="/upload"
          onClick={() => trackEvent(MixpanelEvent.Dashboard_New_Presentation_Clicked, { pathname, source: "dashboard_quickstart" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "20px 24px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--bg-muted)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-premium)",
            textDecoration: "none",
            maxWidth: 380,
            transition: "transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lg)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-premium)";
          }}
        >
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: "var(--accent-pale)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <Sparkles size={22} style={{ color: "var(--mint-500)" }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-primary)", marginBottom: 4 }}>
              KI-Präsentation erstellen
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              Thema eingeben → Gliederung → fertige Folien
            </div>
          </div>
        </Link>
      </section>

      {/* Presentations grid */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="o-label">Alle Präsentationen</div>
          <button
            type="button"
            title="Sortierung wechseln"
            onClick={() => setDeckSortDirection((d) => d === "desc" ? "asc" : "desc")}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--bg-muted)",
              backgroundColor: "var(--bg-surface)",
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "background-color var(--dur-fast) var(--ease-out)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-muted)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-surface)"; }}
          >
            <ArrowUpDown size={14} style={{ transform: deckSortDirection === "asc" ? "rotate(180deg)" : "", transition: "transform 0.3s" }} />
          </button>
        </div>
        <PresentationGrid
          presentations={sortedPresentations}
          isLoading={isLoading}
          error={error}
          onPresentationDeleted={removePresentation}
        />
      </section>
    </div>
  );
};

export default DashboardPage;
