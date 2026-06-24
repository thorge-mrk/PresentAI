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

// ---------------------------------------------------------------------------
// Group-aware catalog. Every built-in template group's layouts are auto-derived
// from the app's React layout schemas via scripts/gen-backend-catalog.ts and
// stored in catalogs.generated.json. The curated "general" shapes above are kept
// as a higher-quality override for that group.
// ---------------------------------------------------------------------------
import GENERATED from "./catalogs.generated.json" with { type: "json" };

export interface Layout {
  id: string;
  name: string;
  description: string;
  spec: unknown; // either a compact shape (general) or a JSON schema (generated)
}

type GeneratedShape = Record<
  string,
  {
    id: string;
    name?: string;
    layouts: { id: string; name: string; description: string; schema: unknown }[];
  }
>;

export const DEFAULT_GROUP = "general";

const GROUPS: Record<string, Layout[]> = {};
for (const [gid, g] of Object.entries(GENERATED as GeneratedShape)) {
  GROUPS[gid] = g.layouts.map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    spec: l.schema,
  }));
}
// Prefer the curated, compact general shapes.
GROUPS[DEFAULT_GROUP] = GENERAL_LAYOUTS.map((l) => ({
  id: l.id,
  name: l.name,
  description: l.description,
  spec: l.shape,
}));

export function listGroups(): { id: string; count: number }[] {
  return Object.entries(GROUPS).map(([id, layouts]) => ({ id, count: layouts.length }));
}

export function isKnownGroup(groupId: string | undefined | null): boolean {
  return !!groupId && Object.prototype.hasOwnProperty.call(GROUPS, groupId);
}

function group(groupId: string | undefined | null): Layout[] {
  return (groupId && GROUPS[groupId]) || GROUPS[DEFAULT_GROUP];
}

/** Detect the intro/cover and table-of-contents layouts of a group, for ordering. */
export function groupRoles(groupId: string): { introId: string; tocId: string | null } {
  const layouts = group(groupId);
  const byKw = (re: RegExp) =>
    layouts.find((l) => re.test(l.id.toLowerCase()) || re.test(l.name.toLowerCase()));
  const intro = byKw(/intro|cover/) ?? layouts[0];
  const toc = byKw(/table[-_ ]?of[-_ ]?contents|agenda|contents|\btoc\b/) ?? null;
  return { introId: intro.id, tocId: toc ? toc.id : null };
}

export function defaultLayoutId(groupId: string): string {
  const layouts = group(groupId);
  const basic = layouts.find((l) =>
    /basic|content|description|info|text/.test(l.id.toLowerCase())
  );
  return (basic ?? layouts[0]).id;
}

/** Compact, model-friendly description of one group's catalog. */
export function buildCatalogSpec(groupId: string = DEFAULT_GROUP): string {
  return group(groupId)
    .map(
      (l) => `### ${l.id}\n${l.description}\ncontent shape:\n${JSON.stringify(l.spec)}`,
    )
    .join("\n\n");
}

/** Returns the JSON content-shape string for a single full layout id (any group). */
export function layoutShapeJSON(id: string): string {
  for (const layouts of Object.values(GROUPS)) {
    const found = layouts.find((l) => l.id === id);
    if (found) return JSON.stringify(found.spec);
  }
  return "{}";
}

/** Coerce a model-provided layout id into a valid id within the given group. */
export function normalizeLayoutId(
  raw: string | undefined,
  groupId: string = DEFAULT_GROUP,
): string {
  const ids = new Set(group(groupId).map((l) => l.id));
  if (!raw) return defaultLayoutId(groupId);
  let id = raw.trim();
  if (!id.includes(":")) id = `${groupId}:${id}`;
  return ids.has(id) ? id : defaultLayoutId(groupId);
}

// Back-compat (general group).
export const KNOWN_LAYOUT_IDS = new Set(GROUPS[DEFAULT_GROUP].map((l) => l.id));
export const DEFAULT_LAYOUT_ID = defaultLayoutId(DEFAULT_GROUP);
