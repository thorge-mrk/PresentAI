'use client'
import React, { useEffect } from "react";
import { DashboardApi } from "@/app/(presentation-generator)/services/api/dashboard";
import { AlertTriangle, EllipsisVertical, Loader2, Trash } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { usePathname, useRouter } from "next/navigation";
import { notify } from "@/components/ui/sonner";
import { useFontLoader } from "@/app/(presentation-generator)/hooks/useFontLoad";
import SlideScale from "@/app/(presentation-generator)/components/PresentationRender";
import MarkdownRenderer from "@/components/MarkDownRender";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";

export const PresentationCard = ({
  id,
  title,
  presentation,
  onDeleted,
}: {
  id: string;
  title: string;
  presentation: any;
  onDeleted?: (presentationId: string) => void;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    trackEvent(MixpanelEvent.Dashboard_Presentation_Opened, {
      pathname,
      presentation_id: id,
      title_length: (title || "").length,
      slide_count: presentation?.slides?.length || 0,
    });
    router.push(`/presentation?id=${id}&type=standard`);
  };

  useEffect(() => {
    applyTheme(presentation.theme);
  }, []);

  const applyTheme = async (theme: any) => {
    const element = document.getElementById(`dashboard-presentation-card-${id}`);
    if (!element) return;
    if (!theme?.data?.colors?.graph_0) return;
    const cssVariables: Record<string, string> = {
      '--primary-color':    theme.data.colors.primary,
      '--background-color': theme.data.colors.background,
      '--card-color':       theme.data.colors.card,
      '--stroke':           theme.data.colors.stroke,
      '--primary-text':     theme.data.colors.primary_text,
      '--background-text':  theme.data.colors.background_text,
      '--graph-0': theme.data.colors.graph_0,
      '--graph-1': theme.data.colors.graph_1,
      '--graph-2': theme.data.colors.graph_2,
      '--graph-3': theme.data.colors.graph_3,
      '--graph-4': theme.data.colors.graph_4,
      '--graph-5': theme.data.colors.graph_5,
      '--graph-6': theme.data.colors.graph_6,
      '--graph-7': theme.data.colors.graph_7,
      '--graph-8': theme.data.colors.graph_8,
      '--graph-9': theme.data.colors.graph_9,
    };
    Object.entries(cssVariables).forEach(([k, v]) => element.style.setProperty(k, v));
    if (theme.data.fonts?.textFont?.url && theme.data.fonts?.textFont?.name) {
      useFontLoader({ [theme.data.fonts.textFont.name]: theme.data.fonts.textFont.url });
    }
    if (theme.data.fonts?.textFont?.name) {
      element.style.setProperty('font-family', `"${theme.data.fonts.textFont.name}"`);
      element.style.setProperty('--heading-font-family', `"${theme.data.fonts.textFont.name}"`);
      element.style.setProperty('--body-font-family', `"${theme.data.fonts.textFont.name}"`);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    const response = await DashboardApi.deletePresentation(id);
    if (response?.success) {
      trackEvent(MixpanelEvent.Dashboard_Presentation_Deleted, {
        pathname,
        presentation_id: id,
        slide_count: presentation?.slides?.length || 0,
      });
      notify.success("Gelöscht", "Die Präsentation wurde entfernt.");
      setShowDeleteDialog(false);
      if (onDeleted) onDeleted(id);
    } else {
      notify.error("Fehler", response?.message || "Löschen fehlgeschlagen.");
    }
    setIsDeleting(false);
  };

  const firstSlide = presentation?.slides?.[0];

  return (
    <>
      <div
        suppressHydrationWarning
        onClick={handlePreview}
        style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--bg-muted)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-sm)",
          cursor: "pointer",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-premium)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
        }}
      >
        <div
          id={`dashboard-presentation-card-${id}`}
          suppressHydrationWarning
          style={{ display: "flex", flexDirection: "column", flex: 1, position: "relative" }}
        >
          {/* Slide preview */}
          <div style={{
            position: "relative",
            backgroundColor: "var(--bg-base)",
            padding: "12px 12px 0",
            overflow: "hidden",
          }}>
            <div style={{ transform: "scale(0.75)", transformOrigin: "top center", border: "1px solid var(--bg-muted)", borderRadius: 8, overflow: "hidden" }}>
              <SlideScale slide={firstSlide} isClickable={false} />
            </div>
          </div>

          {/* Card footer */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--bg-muted)",
            backgroundColor: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginTop: "auto",
          }}>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <MarkdownRenderer
                content={title}
                className="text-sm font-semibold overflow-hidden line-clamp-1"
              />
              <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 2 }}>
                {new Date(presentation?.created_at).toLocaleDateString("de-DE")}
              </p>
            </div>
            <Popover>
              <PopoverTrigger
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisVertical size={16} />
              </PopoverTrigger>
              <PopoverContent
                align="end"
                style={{
                  width: 160,
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--bg-muted)",
                  borderRadius: 12,
                  boxShadow: "var(--shadow-premium)",
                  padding: 4,
                }}
              >
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--status-danger)",
                    fontFamily: "var(--font-family)",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(212,91,78,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <span>Löschen</span>
                  <Trash size={14} />
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDeleting) setShowDeleteDialog(false);
          }}
        >
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
          <div
            style={{
              position: "relative",
              width: 360,
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--bg-muted)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-lg)",
              overflow: "hidden",
            }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 24px 20px", textAlign: "center" }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                backgroundColor: "rgba(212,91,78,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}>
                <AlertTriangle size={22} style={{ color: "var(--status-danger)" }} />
              </div>
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                Präsentation löschen?
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--text-primary)" }}>&ldquo;{title}&rdquo;</strong> wird dauerhaft gelöscht.
              </p>
            </div>
            <div style={{ display: "flex", borderTop: "1px solid var(--bg-muted)" }}>
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "14px",
                  fontFamily: "var(--font-family)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Abbrechen
              </button>
              <button
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: "14px",
                  fontFamily: "var(--font-family)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--status-danger)",
                  backgroundColor: "transparent",
                  border: "none",
                  borderLeft: "1px solid var(--bg-muted)",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {isDeleting ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Löschen…</> : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
