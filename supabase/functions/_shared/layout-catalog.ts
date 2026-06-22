// Catalog of the "general" template's slide layouts (the combinable elements).
// Each entry mirrors the Zod schema of the matching React layout component in
// servers/nextjs/app/presentation-templates/general/*. The model picks one
// layout per outline slide and returns `content` shaped exactly like `shape`.
//
// Media placeholders:
//   image:  { "__image_prompt__": "<10-50 char english search query>" }
//   icon:   { "__icon_query__": "<3-6 word english icon search>" }
// The "__image_url__" / "__icon_url__" fields are filled in afterwards by the
// server (do NOT ask the model for them).

export interface LayoutDef {
  id: string; // full layout id, e.g. "general:general-intro-slide"
  name: string;
  description: string;
  shape: unknown; // example/shape of the `content` object
}

const IMG = { __image_prompt__: "string 10-50 chars, english image search query" };
const ICON = { __icon_query__: "string 3-6 words, english icon search query" };

export const TEMPLATE_NAME = "general";

export const GENERAL_LAYOUTS: LayoutDef[] = [
  {
    id: "general:general-intro-slide",
    name: "Intro Slide",
    description:
      "Title slide. Use as the FIRST slide. Title, short description, presenter info and a supporting image.",
    shape: {
      title: "string 3-40 chars, the presentation title",
      description: "string 10-150 chars, one-sentence overview",
      presenterName: "string, presenter or course/teacher name",
      presentationDate: "string, e.g. a month and year",
      image: IMG,
    },
  },
  {
    id: "general:table-of-contents-slide",
    name: "Table of Contents",
    description:
      "Agenda / overview of sections. Best used as the SECOND slide right after the intro.",
    shape: {
      sections: [
        { number: 1, title: "string 1-80 chars", pageNumber: "01" },
        { number: 2, title: "string 1-80 chars", pageNumber: "02" },
        { number: 3, title: "string 1-80 chars", pageNumber: "03" },
      ],
    },
  },
  {
    id: "general:basic-info-slide",
    name: "Basic Info",
    description:
      "Simple slide: title, a paragraph of description and one supporting image. Good general-purpose explainer.",
    shape: {
      title: "string 3-40 chars",
      description: "string 10-150 chars",
      image: IMG,
    },
  },
  {
    id: "general:bullet-with-icons-slide",
    name: "Bullet with Icons",
    description:
      "Title, short description, supporting image and 1-3 bullet points, each with an icon and description. Great for key points / features / advantages.",
    shape: {
      title: "string 3-40 chars",
      description: "string up to 150 chars",
      image: IMG,
      bulletPoints: [
        {
          title: "string 2-60 chars",
          description: "string 10-100 chars",
          icon: ICON,
        },
        {
          title: "string 2-60 chars",
          description: "string 10-100 chars",
          icon: ICON,
        },
        {
          title: "string 2-60 chars",
          description: "string 10-100 chars",
          icon: ICON,
        },
      ],
    },
  },
  {
    id: "general:bullet-icons-only-slide",
    name: "Bullet Icons Only",
    description:
      "Title, supporting image and 2-3 icon bullets (title + optional subtitle). Use for concise lists where each item has an icon.",
    shape: {
      title: "string 3-40 chars",
      image: IMG,
      bulletPoints: [
        { title: "string 2-80 chars", subtitle: "string 5-150 chars", icon: ICON },
        { title: "string 2-80 chars", subtitle: "string 5-150 chars", icon: ICON },
      ],
    },
  },
  {
    id: "general:numbered-bullets-slide",
    name: "Numbered Bullets",
    description:
      "Large title, supporting image and 1-3 numbered bullet points with descriptions. Use for ordered steps / phases / reasons.",
    shape: {
      title: "string 3-40 chars",
      image: IMG,
      bulletPoints: [
        { title: "string 2-80 chars", description: "string 10-150 chars" },
        { title: "string 2-80 chars", description: "string 10-150 chars" },
        { title: "string 2-80 chars", description: "string 10-150 chars" },
      ],
    },
  },
  {
    id: "general:metrics-slide",
    name: "Metrics",
    description:
      "ONLY when the slide is about numbers/statistics. Title and 2-3 metrics (label, value, description).",
    shape: {
      title: "string 3-100 chars",
      metrics: [
        { label: "string 2-50 chars", value: "string 1-10 chars e.g. 85% or 1.2M", description: "string 10-150 chars" },
        { label: "string 2-50 chars", value: "string 1-10 chars", description: "string 10-150 chars" },
      ],
    },
  },
  {
    id: "general:metrics-with-image-slide",
    name: "Metrics with Image",
    description:
      "Supporting image plus title, description and 1-3 compact metrics (label, value). Alternative to Metrics when an image fits.",
    shape: {
      title: "string 3-40 chars",
      description: "string 10-150 chars",
      image: IMG,
      metrics: [
        { label: "string 2-100 chars", value: "string 1-20 chars" },
        { label: "string 2-100 chars", value: "string 1-20 chars" },
      ],
    },
  },
  {
    id: "general:table-info-slide",
    name: "Table with Info",
    description:
      "Title, a structured comparison table and a description below. Use when content is naturally tabular.",
    shape: {
      title: "string 3-40 chars",
      tableData: {
        headers: ["2-5 column headers, each 1-30 chars"],
        rows: [["row cells, each 1-50 chars, count matches headers"]],
      },
      description: "string 10-200 chars explaining the table",
    },
  },
  {
    id: "general:chart-with-bullets-slide",
    name: "Chart with Bullet Boxes",
    description:
      "ONLY if quantitative data is available. Title, description, a chart and 1-3 bullet boxes with icons.",
    shape: {
      title: "string 3-40 chars",
      description: "string 10-150 chars",
      chartData: {
        type: "one of: bar | pie | line | area",
        data: [
          { name: "label", value: 10 },
          { name: "label", value: 20 },
          { name: "label", value: 30 },
        ],
      },
      showLegend: false,
      showTooltip: true,
      bulletPoints: [
        { title: "string 2-80 chars", description: "string 10-150 chars", icon: ICON },
      ],
    },
  },
  {
    id: "general:quote-slide",
    name: "Quote",
    description:
      "A heading, an inspiring/relevant quote, its author and a background image. Nice for emphasis or transitions.",
    shape: {
      heading: "string 3-60 chars",
      quote: "string 10-200 chars",
      author: "string 2-50 chars",
      backgroundImage: IMG,
    },
  },
  {
    id: "general:team-slide",
    name: "Team Slide",
    description:
      "Showcases 2-4 people (name, position, description, photo) with a company/group description. Use only if the topic involves people/roles.",
    shape: {
      title: "string 3-40 chars",
      companyDescription: "string 10-150 chars",
      teamMembers: [
        { name: "string 2-50", position: "string 2-50", description: "string up to 150", image: IMG },
        { name: "string 2-50", position: "string 2-50", description: "string up to 150", image: IMG },
      ],
    },
  },
];

export const KNOWN_LAYOUT_IDS = new Set(GENERAL_LAYOUTS.map((l) => l.id));
export const DEFAULT_LAYOUT_ID = "general:basic-info-slide";

// Compact, model-friendly description of the whole catalog.
export function buildCatalogSpec(): string {
  return GENERAL_LAYOUTS
    .map(
      (l) =>
        `### ${l.id}\n${l.description}\ncontent shape:\n${
          JSON.stringify(l.shape)
        }`,
    )
    .join("\n\n");
}

/** Returns the JSON content-shape string for a single layout id (for editing). */
export function layoutShapeJSON(id: string): string {
  const layout = GENERAL_LAYOUTS.find((l) => l.id === normalizeLayoutId(id));
  return JSON.stringify(layout?.shape ?? {});
}

export function normalizeLayoutId(raw: string | undefined): string {
  if (!raw) return DEFAULT_LAYOUT_ID;
  let id = raw.trim();
  if (!id.includes(":")) id = `${TEMPLATE_NAME}:${id}`;
  return KNOWN_LAYOUT_IDS.has(id) ? id : DEFAULT_LAYOUT_ID;
}
