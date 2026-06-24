// Group-aware slide-layout catalog.
//
// The curated "general" group is defined inline (high-quality compact shapes).
// All other template groups are loaded at runtime from the public table
// `app_config` (key = 'layout_catalog'), which is populated from the app's
// generated catalog:
//
//   1. `npm run gen:catalog`  -> writes _shared/catalogs.generated.json
//   2. upload that JSON into app_config.value (see SUPABASE_SETUP.md)
//
// This keeps the (large) catalog out of the function bundle and lets it be
// updated without redeploying the edge functions.
import { serviceClient } from "./clients.ts";

export interface LayoutDef { id: string; name: string; description: string; shape: unknown; }
export interface Layout { id: string; name: string; description: string; spec: unknown; }

const IMG = { __image_prompt__: "string 10-50 chars, english image search query" };
const ICON = { __icon_query__: "string 3-6 words, english icon search query" };
export const TEMPLATE_NAME = "general";
export const DEFAULT_GROUP = "general";
// Pseudo-group: lets the model pick from EVERY template family for maximum
// variety ("Smart" mode). Not a real entry in GROUPS — handled explicitly.
export const SMART_GROUP = "smart";

export const GENERAL_LAYOUTS: LayoutDef[] = [
  { id: "general:general-intro-slide", name: "Intro Slide", description: "Title slide. Use as the FIRST slide. Title, short description, presenter info and a supporting image.", shape: { title: "string 3-40 chars", description: "string 10-150 chars", presenterName: "string", presentationDate: "string", image: IMG } },
  { id: "general:table-of-contents-slide", name: "Table of Contents", description: "Agenda / overview of sections. Best as the SECOND slide.", shape: { sections: [{ number: 1, title: "string 1-80 chars", pageNumber: "01" }, { number: 2, title: "string 1-80 chars", pageNumber: "02" }, { number: 3, title: "string 1-80 chars", pageNumber: "03" }] } },
  { id: "general:basic-info-slide", name: "Basic Info", description: "Simple slide: title, a paragraph and one supporting image.", shape: { title: "string 3-40 chars", description: "string 10-150 chars", image: IMG } },
  { id: "general:bullet-with-icons-slide", name: "Bullet with Icons", description: "Title, description, image and 1-3 bullet points with icon and description.", shape: { title: "string 3-40 chars", description: "string up to 150 chars", image: IMG, bulletPoints: [{ title: "string 2-60 chars", description: "string 10-100 chars", icon: ICON }, { title: "string 2-60 chars", description: "string 10-100 chars", icon: ICON }, { title: "string 2-60 chars", description: "string 10-100 chars", icon: ICON }] } },
  { id: "general:bullet-icons-only-slide", name: "Bullet Icons Only", description: "Title, image and 2-3 icon bullets (title + optional subtitle).", shape: { title: "string 3-40 chars", image: IMG, bulletPoints: [{ title: "string 2-80 chars", subtitle: "string 5-150 chars", icon: ICON }, { title: "string 2-80 chars", subtitle: "string 5-150 chars", icon: ICON }] } },
  { id: "general:numbered-bullets-slide", name: "Numbered Bullets", description: "Title, image and 1-3 numbered bullet points with descriptions.", shape: { title: "string 3-40 chars", image: IMG, bulletPoints: [{ title: "string 2-80 chars", description: "string 10-150 chars" }, { title: "string 2-80 chars", description: "string 10-150 chars" }, { title: "string 2-80 chars", description: "string 10-150 chars" }] } },
  { id: "general:metrics-slide", name: "Metrics", description: "ONLY for numbers/statistics. Title and 2-3 metrics.", shape: { title: "string 3-100 chars", metrics: [{ label: "string 2-50 chars", value: "string 1-10 chars", description: "string 10-150 chars" }, { label: "string 2-50 chars", value: "string 1-10 chars", description: "string 10-150 chars" }] } },
  { id: "general:metrics-with-image-slide", name: "Metrics with Image", description: "Image plus title, description and 1-3 compact metrics.", shape: { title: "string 3-40 chars", description: "string 10-150 chars", image: IMG, metrics: [{ label: "string 2-100 chars", value: "string 1-20 chars" }, { label: "string 2-100 chars", value: "string 1-20 chars" }] } },
  { id: "general:table-info-slide", name: "Table with Info", description: "Title, a comparison table and a description.", shape: { title: "string 3-40 chars", tableData: { headers: ["2-5 column headers"], rows: [["row cells"]] }, description: "string 10-200 chars" } },
  { id: "general:chart-with-bullets-slide", name: "Chart with Bullet Boxes", description: "ONLY if quantitative data is available. Title, description, chart and 1-3 bullet boxes.", shape: { title: "string 3-40 chars", description: "string 10-150 chars", chartData: { type: "bar | pie | line | area", data: [{ name: "label", value: 10 }, { name: "label", value: 20 }, { name: "label", value: 30 }] }, showLegend: false, showTooltip: true, bulletPoints: [{ title: "string 2-80 chars", description: "string 10-150 chars", icon: ICON }] } },
  { id: "general:quote-slide", name: "Quote", description: "A heading, a quote, its author and a background image.", shape: { heading: "string 3-60 chars", quote: "string 10-200 chars", author: "string 2-50 chars", backgroundImage: IMG } },
  { id: "general:team-slide", name: "Team Slide", description: "2-4 people with photos and a group description.", shape: { title: "string 3-40 chars", companyDescription: "string 10-150 chars", teamMembers: [{ name: "string 2-50", position: "string 2-50", description: "string up to 150", image: IMG }, { name: "string 2-50", position: "string 2-50", description: "string up to 150", image: IMG }] } },
];

const GROUPS: Record<string, Layout[]> = {};
GROUPS[DEFAULT_GROUP] = GENERAL_LAYOUTS.map((l) => ({ id: l.id, name: l.name, description: l.description, spec: l.shape }));

let loaded = false;
/** Load extra template groups from app_config (key='layout_catalog') once per cold start. */
export async function loadCatalog(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const svc = serviceClient();
    const { data } = await svc.from("app_config").select("value").eq("key", "layout_catalog").maybeSingle();
    const cat = data?.value as Record<string, { layouts: { id: string; name: string; description: string; schema: unknown }[] }> | null;
    if (cat) {
      for (const [gid, g] of Object.entries(cat)) {
        if (gid === DEFAULT_GROUP) continue;
        if (!g?.layouts) continue;
        GROUPS[gid] = g.layouts.map((l) => ({ id: l.id, name: l.name, description: l.description, spec: l.schema }));
      }
    }
  } catch (_e) { /* fall back to general only */ }
}

export function listGroups(): { id: string; count: number }[] {
  return Object.entries(GROUPS).map(([id, layouts]) => ({ id, count: layouts.length }));
}
export function isSmartGroup(groupId: string | undefined | null): boolean {
  return groupId === SMART_GROUP;
}
export function isKnownGroup(groupId: string | undefined | null): boolean {
  if (isSmartGroup(groupId)) return true;
  return !!groupId && Object.prototype.hasOwnProperty.call(GROUPS, groupId);
}
/** Every layout across every loaded group — the "smart" catalog. */
export function smartLayouts(): Layout[] {
  const all: Layout[] = [];
  for (const layouts of Object.values(GROUPS)) all.push(...layouts);
  return all;
}
function group(groupId: string | undefined | null): Layout[] {
  if (isSmartGroup(groupId)) return smartLayouts();
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
  const basic = layouts.find((l) => /basic|content|description|info|text/.test(l.id.toLowerCase()));
  return (basic ?? layouts[0]).id;
}
/** Compact, model-friendly description of one group's catalog. */
export function buildCatalogSpec(groupId: string = DEFAULT_GROUP): string {
  return group(groupId)
    .map((l) => `### ${l.id}\n${l.description}\ncontent shape:\n${JSON.stringify(l.spec)}`)
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
export function normalizeLayoutId(raw: string | undefined, groupId: string = DEFAULT_GROUP): string {
  const layouts = group(groupId);
  const ids = new Set(layouts.map((l) => l.id));
  if (!raw) return defaultLayoutId(groupId);
  const id = raw.trim();
  if (ids.has(id)) return id;
  // Smart mode: the catalog spans every family, so a bare/unqualified id
  // ("basic-info-slide") should match the first layout whose id ends with it.
  if (isSmartGroup(groupId)) {
    const suffix = id.includes(":") ? id.split(":").pop()! : id;
    const match = layouts.find((l) => l.id === id || l.id.endsWith(`:${suffix}`));
    return match ? match.id : defaultLayoutId(groupId);
  }
  const qualified = id.includes(":") ? id : `${groupId}:${id}`;
  return ids.has(qualified) ? qualified : defaultLayoutId(groupId);
}

// Back-compat (general group).
export const KNOWN_LAYOUT_IDS = new Set(GROUPS[DEFAULT_GROUP].map((l) => l.id));
export const DEFAULT_LAYOUT_ID = defaultLayoutId(DEFAULT_GROUP);
