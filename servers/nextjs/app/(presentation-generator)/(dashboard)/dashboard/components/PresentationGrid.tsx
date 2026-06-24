import React from "react";
import { PresentationCard } from "./PresentationCard";
import { PresentationResponse } from "@/app/(presentation-generator)/services/api/dashboard";
import { EmptyState } from "./EmptyState";

interface PresentationGridProps {
  presentations: PresentationResponse[];
  isLoading?: boolean;
  error?: string | null;
  onPresentationDeleted?: (presentationId: string) => void;
}

const ShimmerCard = () => (
  <div style={{
    minHeight: 200,
    borderRadius: "var(--radius-xl)",
    border: "1px solid var(--bg-muted)",
    backgroundColor: "var(--bg-surface)",
    overflow: "hidden",
    animation: "pulse 1.5s ease-in-out infinite",
  }}>
    <div style={{ height: 130, backgroundColor: "var(--bg-muted)", margin: "12px 12px 0" , borderRadius: 8 }} />
    <div style={{ padding: "12px 16px", borderTop: "1px solid var(--bg-muted)", marginTop: 12 }}>
      <div style={{ height: 14, width: 120, backgroundColor: "var(--bg-muted)", borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 11, width: 80, backgroundColor: "var(--bg-muted)", borderRadius: 6 }} />
    </div>
  </div>
);

export const PresentationGrid = ({
  presentations,
  isLoading = false,
  error = null,
  onPresentationDeleted,
}: PresentationGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
        {[...Array(8)].map((_, i) => <ShimmerCard key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--bg-muted)",
        backgroundColor: "var(--bg-surface)",
      }}>
        <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          <p style={{ marginBottom: 8 }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              color: "var(--mint-500)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-family)",
              fontWeight: 600,
              textDecoration: "underline",
            }}
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  if (!presentations || presentations.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {presentations.map((presentation) => (
        <PresentationCard
          key={presentation.id}
          id={presentation.id}
          title={presentation.title}
          presentation={presentation}
          onDeleted={onPresentationDeleted}
        />
      ))}
    </div>
  );
};
