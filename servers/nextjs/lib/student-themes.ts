/**
 * Curated, student-friendly presentation themes.
 *
 * Each theme matches the `Theme.data` shape consumed by
 * `applyPresentationThemeToElement` (CSS custom properties on the slide
 * wrapper) so the colors below actually render across every layout, the
 * editor preview, and the PDF/PPTX export.
 *
 * These are also passed to the Supabase `generate-outline` function so Gemini
 * can match the tone / image motifs to the chosen style.
 */

export interface StudentThemeColors {
  primary: string;
  background: string;
  card: string;
  stroke: string;
  primary_text: string;
  background_text: string;
  graph_0: string;
  graph_1: string;
  graph_2: string;
  graph_3: string;
  graph_4: string;
  graph_5: string;
  graph_6: string;
  graph_7: string;
  graph_8: string;
  graph_9: string;
}

export interface StudentTheme {
  id: string;
  name: string;
  description: string;
  logo: null;
  logo_url: null;
  company_name: null;
  data: {
    colors: StudentThemeColors;
    fonts: { textFont: { name: string; url: string } };
  };
}

// Build a 10-step chart ramp from a base hex by blending toward white.
function ramp(hex: string): Record<`graph_${number}`, string> {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const out: Record<string, string> = {};
  for (let i = 0; i < 10; i++) {
    const t = i / 11; // 0 → base color, higher → lighter
    const mix = (c: number) => Math.round(c + (255 - c) * t);
    const to2 = (c: number) => mix(c).toString(16).padStart(2, "0");
    out[`graph_${i}`] = `#${to2(r)}${to2(g)}${to2(b)}`;
  }
  return out as Record<`graph_${number}`, string>;
}

const FONT = {
  nunito: {
    name: "Nunito",
    url: "https://fonts.googleapis.com/css2?family=Nunito:wght@200..1000&display=swap",
  },
  poppins: {
    name: "Poppins",
    url: "https://fonts.googleapis.com/css2?family=Poppins:wght@100..900&display=swap",
  },
  baloo: {
    name: "Baloo 2",
    url: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&display=swap",
  },
  quicksand: {
    name: "Quicksand",
    url: "https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap",
  },
};

export const STUDENT_THEMES: StudentTheme[] = [
  {
    id: "school-fresh",
    name: "Schul-Frisch",
    description:
      "Helles, freundliches Design mit kräftigem Blau – klar und gut lesbar für den Unterricht.",
    logo: null,
    logo_url: null,
    company_name: null,
    data: {
      colors: {
        primary: "#2563eb",
        background: "#ffffff",
        card: "#eff6ff",
        stroke: "#bfdbfe",
        primary_text: "#ffffff",
        background_text: "#1e293b",
        ...ramp("#2563eb"),
      } as StudentThemeColors,
      fonts: { textFont: FONT.nunito },
    },
  },
  {
    id: "colorful-clear",
    name: "Bunt & Klar",
    description:
      "Verspielte, bunte Akzente in Lila und Orange auf hellem Grund – ideal für jüngere Schüler.",
    logo: null,
    logo_url: null,
    company_name: null,
    data: {
      colors: {
        primary: "#7c3aed",
        background: "#fffdf7",
        card: "#f3e8ff",
        stroke: "#e9d5ff",
        primary_text: "#ffffff",
        background_text: "#3b0764",
        ...ramp("#f97316"),
      } as StudentThemeColors,
      fonts: { textFont: FONT.baloo },
    },
  },
  {
    id: "chalkboard",
    name: "Tafel",
    description:
      "Dunkelgrüne Tafel-Optik mit heller Schrift – wirkt wie an der Schultafel geschrieben.",
    logo: null,
    logo_url: null,
    company_name: null,
    data: {
      colors: {
        primary: "#fde68a",
        background: "#1f3a2e",
        card: "#27503d",
        stroke: "#3f6b54",
        primary_text: "#1f3a2e",
        background_text: "#f8fafc",
        ...ramp("#86efac"),
      } as StudentThemeColors,
      fonts: { textFont: FONT.quicksand },
    },
  },
  {
    id: "sunny",
    name: "Sonnig",
    description:
      "Warme, motivierende Gelb- und Orangetöne mit dunkler Schrift – freundlich und energiegeladen.",
    logo: null,
    logo_url: null,
    company_name: null,
    data: {
      colors: {
        primary: "#ea580c",
        background: "#fffbeb",
        card: "#fef3c7",
        stroke: "#fcd34d",
        primary_text: "#ffffff",
        background_text: "#451a03",
        ...ramp("#f59e0b"),
      } as StudentThemeColors,
      fonts: { textFont: FONT.poppins },
    },
  },
  {
    id: "ocean",
    name: "Ozean",
    description:
      "Ruhige Türkis- und Blautöne – sachlich, modern und angenehm für längere Vorträge.",
    logo: null,
    logo_url: null,
    company_name: null,
    data: {
      colors: {
        primary: "#0d9488",
        background: "#f0fdfa",
        card: "#ccfbf1",
        stroke: "#99f6e4",
        primary_text: "#ffffff",
        background_text: "#134e4a",
        ...ramp("#0d9488"),
      } as StudentThemeColors,
      fonts: { textFont: FONT.nunito },
    },
  },
  {
    id: "midnight",
    name: "Mitternacht",
    description:
      "Dunkles, modernes Design mit leuchtenden Akzenten – cool für ältere Schüler und Referate.",
    logo: null,
    logo_url: null,
    company_name: null,
    data: {
      colors: {
        primary: "#818cf8",
        background: "#0f172a",
        card: "#1e293b",
        stroke: "#334155",
        primary_text: "#0f172a",
        background_text: "#e2e8f0",
        ...ramp("#818cf8"),
      } as StudentThemeColors,
      fonts: { textFont: FONT.poppins },
    },
  },
];

/** Look up a student theme by id. */
export function getStudentTheme(id: string | null | undefined): StudentTheme | null {
  if (!id) return null;
  return STUDENT_THEMES.find((t) => t.id === id) ?? null;
}

/** Apply a custom accent color on top of a base theme (used by the color picker). */
export function withAccent(theme: StudentTheme, accent: string): StudentTheme {
  return {
    ...theme,
    id: `${theme.id}-custom`,
    name: `${theme.name} (angepasst)`,
    data: {
      ...theme.data,
      colors: { ...theme.data.colors, primary: accent, ...ramp(accent) },
    },
  };
}
