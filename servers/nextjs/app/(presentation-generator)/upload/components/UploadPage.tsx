"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { clearOutlines, setPresentationId } from "@/store/slices/presentationGeneration";
import { Button } from "@/components/ui/button";
import { notify } from "@/components/ui/sonner";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import Wrapper from "@/components/Wrapper";
import { generateOutline } from "@/lib/presentation-api";
import { STUDENT_THEMES, withAccent } from "@/lib/student-themes";
import { ChevronRight, BookOpen, Sparkles, Palette } from "lucide-react";

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
  { value: "low" as const, label: "Wenig Text", desc: "Stichpunkte, prägnant" },
  { value: "compact" as const, label: "Kompakt", desc: "Ausgewogen, informativ" },
  { value: "high" as const, label: "Viel Text", desc: "Ausführlich, detailliert" },
];

export default function UploadPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [topic, setTopic] = useState("");
  const [gradeLevel, setGradeLevel] = useState(GRADE_LEVELS[2]);
  const [textDensity, setTextDensity] = useState<"low" | "compact" | "high">("compact");
  const [slideCount, setSlideCount] = useState(10);
  const [themeId, setThemeId] = useState(STUDENT_THEMES[0].id);
  const [accent, setAccent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      notify.warning("Thema fehlt", "Bitte gib ein Thema für deine Präsentation ein.");
      return;
    }
    if (slideCount < 1 || slideCount > 25) {
      notify.warning("Ungültige Folienanzahl", "Bitte wähle eine Anzahl zwischen 1 und 25.");
      return;
    }

    setIsLoading(true);
    dispatch(clearOutlines());

    try {
      const base = STUDENT_THEMES.find((t) => t.id === themeId) ?? STUDENT_THEMES[0];
      const theme = accent ? withAccent(base, accent) : base;
      const { presentationId, outlines } = await generateOutline({ topic, gradeLevel, textDensity, slideCount, theme: theme as unknown as Record<string, unknown> });
      dispatch(setPresentationId(presentationId));
      router.push(`/outline?id=${presentationId}`);
    } catch (err: any) {
      notify.error("Fehler", err.message || "Präsentation konnte nicht erstellt werden.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Wrapper className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <OverlayLoader show={isLoading} text="Recherche & Gliederung wird erstellt..." showProgress duration={30} />

      <div className="w-full max-w-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-7 h-7 text-violet-600" />
            <span className="text-2xl font-bold text-gray-900">Present AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Neue Präsentation</h1>
          <p className="text-gray-500">Powered by Google Gemini · Bilder von Unsplash & Pexels</p>
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Thema <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="z.B. Die Französische Revolution, Klimawandel, Photosynthese …"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />
        </div>

        {/* Grade Level */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <BookOpen className="inline w-4 h-4 mr-1 text-violet-500" />
            Klassenstufe
          </label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 outline-none transition bg-white"
          >
            {GRADE_LEVELS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Text Density */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Textmenge</label>
          <div className="grid grid-cols-3 gap-3">
            {TEXT_DENSITY_OPTIONS.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setTextDensity(value)}
                className={`rounded-xl border-2 p-3 text-left transition ${
                  textDensity === value
                    ? "border-violet-500 bg-violet-50 text-violet-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Slide Count */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Folienanzahl: <span className="text-violet-600 font-bold">{slideCount}</span>
          </label>
          <input
            type="range"
            min={3}
            max={25}
            value={slideCount}
            onChange={(e) => setSlideCount(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>3 Folien</span>
            <span>25 Folien</span>
          </div>
        </div>

        {/* Style / Theme */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <Palette className="inline w-4 h-4 mr-1 text-violet-500" />
            Design-Stil
          </label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {STUDENT_THEMES.map((t) => {
              const c = t.data.colors;
              const active = t.id === themeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  title={t.description}
                  className={`rounded-xl border-2 p-3 text-left transition ${
                    active
                      ? "border-violet-500 ring-2 ring-violet-100"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{ background: c.background }}
                >
                  <div className="flex gap-1 mb-2">
                    <span className="w-4 h-4 rounded-full" style={{ background: accent && active ? accent : c.primary }} />
                    <span className="w-4 h-4 rounded-full" style={{ background: c.card }} />
                    <span className="w-4 h-4 rounded-full border" style={{ background: c.background_text }} />
                  </div>
                  <div className="text-xs font-semibold" style={{ color: c.background_text }}>
                    {t.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent color */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Akzentfarbe (optional)</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accent ?? STUDENT_THEMES.find((t) => t.id === themeId)!.data.colors.primary}
              onChange={(e) => setAccent(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
            />
            {accent && (
              <button
                type="button"
                onClick={() => setAccent(null)}
                className="text-sm text-gray-500 underline hover:text-gray-700"
              >
                Zurücksetzen
              </button>
            )}
            <span className="text-xs text-gray-400">Überschreibt die Hauptfarbe des Stils.</span>
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base transition disabled:opacity-50"
        >
          Gliederung erstellen
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </Wrapper>
  );
}
