"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearOutlines, setPresentationId } from "@/store/slices/presentationGeneration";
import { notify } from "@/components/ui/sonner";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import { generateOutline } from "@/lib/presentation-api";
import { STUDENT_THEMES, withAccent } from "@/lib/student-themes";
import { BookOpen, Sparkles, ChevronRight, Palette, AlignLeft, AlignCenter, AlignJustify, LayoutTemplate } from "lucide-react";
import Link from "next/link";

// Built-in template groups the backend can generate (must match the keys in
// supabase/functions/_shared/catalogs.generated.json).
const TEMPLATES: { id: string; name: string; desc: string }[] = [
  { id: "general", name: "Allgemein", desc: "Vielseitig für jedes Thema" },
  { id: "education", name: "Bildung", desc: "Für Unterricht & Schule" },
  { id: "modern", name: "Modern", desc: "Klare, moderne Folien" },
  { id: "standard", name: "Standard", desc: "Klassisch & sachlich" },
  { id: "swift", name: "Swift", desc: "Schlicht & schnell" },
  { id: "report", name: "Report", desc: "Daten & Analysen" },
  { id: "product-overview", name: "Produkt", desc: "Produkt-Übersichten" },
  { id: "pitch-deck", name: "Pitch Deck", desc: "Überzeugende Pitches" },
  { id: "code", name: "Code", desc: "Technik & Entwicklung" },
];

const GRADE_LEVELS = [
  "1.-4. Klasse (Grundschule)",
  "5.-7. Klasse",
  "8.-10. Klasse",
  "Oberstufe (11.-13. Klasse)",
  "Berufsschule",
  "Universität / Hochschule",
  "Erwachsenenbildung",
];

const TEXT_DENSITY_OPTIONS = [
  { value: "low" as const, label: "Wenig", desc: "Stichpunkte", icon: AlignLeft },
  { value: "compact" as const, label: "Kompakt", desc: "Ausgewogen", icon: AlignCenter },
  { value: "high" as const, label: "Viel", desc: "Ausführlich", icon: AlignJustify },
];

export default function UploadPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState(GRADE_LEVELS[2]);
  const [textDensity, setTextDensity] = useState<"low" | "compact" | "high">("compact");
  const [slideCount, setSlideCount] = useState(10);
  const [template, setTemplate] = useState(TEMPLATES[0].id);
  const [themeId, setThemeId] = useState(STUDENT_THEMES[0].id);
  const [accent, setAccent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      notify.warning("Thema fehlt", "Bitte gib ein Thema ein.");
      return;
    }
    if (slideCount < 1 || slideCount > 25) {
      notify.warning("Ungültige Folienanzahl", "Bitte wähle 1–25 Folien.");
      return;
    }
    setIsLoading(true);
    dispatch(clearOutlines());
    try {
      const base = STUDENT_THEMES.find((t) => t.id === themeId) ?? STUDENT_THEMES[0];
      const theme = accent ? withAccent(base, accent) : base;
      const { presentationId } = await generateOutline({
        topic,
        gradeLevel,
        textDensity,
        slideCount,
        template,
        theme: theme as unknown as Record<string, unknown>,
      });
      dispatch(setPresentationId(presentationId));
      router.push(`/outline?id=${presentationId}`);
    } catch (err: any) {
      notify.error("Fehler", err.message || "Präsentation konnte nicht erstellt werden.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "var(--bg-base)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "40px 20px 60px",
      transition: "background-color var(--dur-base) var(--ease-out)",
    }}>
      <OverlayLoader show={isLoading} text="Recherche & Gliederung wird erstellt…" showProgress duration={30} />

      <div style={{ width: "100%", maxWidth: 580 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", marginBottom: 24 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "var(--mint-500)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <svg width="20" height="20" viewBox="0 0 200 200" fill="none">
                <g stroke="#08110F" strokeWidth="28" strokeLinecap="round">
                  <line x1="48"  y1="86"  x2="48"  y2="114" />
                  <line x1="76"  y1="68"  x2="76"  y2="132" />
                  <line x1="104" y1="54"  x2="104" y2="146" />
                  <line x1="132" y1="74"  x2="132" y2="126" />
                  <line x1="158" y1="90"  x2="158" y2="110" />
                </g>
              </svg>
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)", lineHeight: 1.1 }}>Present</div>
              <div style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", lineHeight: 1 }}>by Orately AI</div>
            </div>
          </Link>

          <h1 style={{ fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 8 }}>
            Neue Präsentation
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Powered by Gemini · Bilder von Pexels &amp; KI-Generierung
          </p>
        </div>

        {/* Form card */}
        <div style={{
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--bg-muted)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-premium)",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}>

          {/* Topic */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              Thema <span style={{ color: "var(--mint-500)" }}>*</span>
            </label>
            <input
              className="input-orately"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="z.B. Die Französische Revolution, Klimawandel, Photosynthese …"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              autoFocus
            />
          </div>

          {/* Grade Level */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              <BookOpen size={14} style={{ color: "var(--mint-500)" }} />
              Klassenstufe
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "var(--bg-base)",
                border: "1px solid var(--bg-muted)",
                borderRadius: 12,
                padding: "11px 16px",
                fontFamily: "var(--font-family)",
                fontSize: "0.875rem",
                color: "var(--text-primary)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Template / Layout style */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>
              <LayoutTemplate size={14} style={{ color: "var(--mint-500)" }} />
              Vorlage
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {TEMPLATES.map((t) => {
                const active = t.id === template;
                return (
                  <button
                    key={t.id}
                    type="button"
                    title={t.desc}
                    onClick={() => setTemplate(t.id)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: active ? "2px solid var(--mint-500)" : "1px solid var(--bg-muted)",
                      backgroundColor: active ? "var(--accent-pale)" : "var(--bg-base)",
                      color: active ? "var(--mint-600)" : "var(--text-primary)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all var(--dur-fast) var(--ease-out)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>{t.name}</span>
                    <span style={{ fontSize: "0.6875rem", color: active ? "var(--mint-600)" : "var(--text-secondary)", lineHeight: 1.2 }}>{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Density */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              Textmenge
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {TEXT_DENSITY_OPTIONS.map(({ value, label, desc, icon: Icon }) => {
                const active = textDensity === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTextDensity(value)}
                    style={{
                      padding: "12px 10px",
                      borderRadius: 12,
                      border: active ? "2px solid var(--mint-500)" : "1px solid var(--bg-muted)",
                      backgroundColor: active ? "var(--accent-pale)" : "var(--bg-base)",
                      color: active ? "var(--mint-600)" : "var(--text-primary)",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all var(--dur-fast) var(--ease-out)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <Icon size={14} />
                    <div style={{ fontWeight: 600, fontSize: "0.8125rem" }}>{label}</div>
                    <div style={{ fontSize: "0.6875rem", color: active ? "var(--mint-600)" : "var(--text-secondary)" }}>{desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slide Count */}
          <div>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              <span>Folienanzahl</span>
              <span style={{ fontWeight: 700, color: "var(--mint-500)" }}>{slideCount} Folien</span>
            </label>
            <input
              type="range"
              min={3}
              max={25}
              value={slideCount}
              onChange={(e) => setSlideCount(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--mint-500)", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>
              <span>3</span>
              <span>25</span>
            </div>
          </div>

          {/* Template / Style */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>
              <Palette size={14} style={{ color: "var(--mint-500)" }} />
              Farbschema
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {STUDENT_THEMES.map((t) => {
                const c = t.data.colors;
                const active = t.id === themeId;
                const previewAccent = accent && active ? accent : c.primary;
                return (
                  <button
                    key={t.id}
                    type="button"
                    title={t.description}
                    onClick={() => setThemeId(t.id)}
                    style={{
                      padding: "10px 10px 8px",
                      borderRadius: 12,
                      border: active ? `2px solid ${previewAccent}` : "1px solid var(--bg-muted)",
                      backgroundColor: c.background,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all var(--dur-fast) var(--ease-out)",
                      transform: active ? "scale(1.03)" : "scale(1)",
                      boxShadow: active ? `0 4px 14px -4px ${previewAccent}60` : "none",
                    }}
                  >
                    <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                      <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: previewAccent, display: "inline-block" }} />
                      <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: c.card, border: "1px solid rgba(0,0,0,0.08)", display: "inline-block" }} />
                    </div>
                    <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: c.background_text, lineHeight: 1.2 }}>{t.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent color */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              Akzentfarbe <span style={{ fontWeight: 400, color: "var(--text-secondary)" }}>(optional)</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="color"
                value={accent ?? (STUDENT_THEMES.find((t) => t.id === themeId)?.data.colors.primary ?? "#14B8A6")}
                onChange={(e) => setAccent(e.target.value)}
                style={{
                  width: 44,
                  height: 44,
                  padding: 2,
                  border: "1px solid var(--bg-muted)",
                  borderRadius: 10,
                  cursor: "pointer",
                  backgroundColor: "var(--bg-surface)",
                }}
              />
              {accent && (
                <button
                  type="button"
                  onClick={() => setAccent(null)}
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-secondary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  Zurücksetzen
                </button>
              )}
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Überschreibt die Hauptfarbe</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "14px 24px",
              backgroundColor: isLoading || !topic.trim() ? "var(--bg-muted)" : "var(--mint-500)",
              color: isLoading || !topic.trim() ? "var(--text-secondary)" : "#fff",
              border: "none",
              borderRadius: 14,
              fontFamily: "var(--font-family)",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: isLoading || !topic.trim() ? "not-allowed" : "pointer",
              boxShadow: isLoading || !topic.trim() ? "none" : "0 8px 18px -10px rgba(20,184,166,0.65)",
              transition: "all var(--dur-fast) var(--ease-out)",
            }}
          >
            <Sparkles size={18} />
            Gliederung erstellen
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
