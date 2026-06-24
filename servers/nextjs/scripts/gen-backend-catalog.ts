/**
 * Generates a backend-consumable catalog of every built-in template group's
 * slide layouts (id, name, description, JSON schema) by compiling each layout's
 * `Schema` export with the same compiler the app uses. Output is written to
 *   supabase/functions/_shared/catalogs.generated.json
 * so the Deno edge functions can offer the chosen template's layouts to Gemini
 * without importing any React/client code.
 *
 * Run:  npm run gen:catalog
 */
import fs from "fs";
import path from "path";
import { compileTemplateSchema } from "@/lib/compile-template-schema";

// dir name on disk  ->  template group id used in `templates` (the id prefix
// in `${groupId}:${layoutId}` that the renderer looks up).
const DIR_TO_GROUP: Record<string, string> = {
  general: "general",
  modern: "modern",
  standard: "standard",
  swift: "swift",
  Code: "code",
  Education: "education",
  ProductOverview: "product-overview",
  Report: "report",
  "pitch-deck": "pitch-deck",
};

interface CatalogLayout {
  id: string;
  name: string;
  description: string;
  schema: unknown;
}
interface CatalogGroup {
  id: string;
  name: string;
  layouts: CatalogLayout[];
}

function titleCase(s: string): string {
  return s
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Read a `export const <name> = "..."` string literal from source. */
function readExportString(source: string, name: string): string | null {
  const re = new RegExp(
    `export\\s+const\\s+${name}\\s*=\\s*([\`"'])([\\s\\S]*?)\\1`,
  );
  const m = source.match(re);
  return m ? m[2].trim() : null;
}

/**
 * Slim a JSON schema for the generation prompt:
 *  - drop server-filled media url fields (`__image_url__`, `__icon_url__`) and
 *    the stock-photo defaults they carry, so the model only returns prompts
 *  - drop noisy keys (`$schema`, `default`, `additionalProperties`)
 */
function slim(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(slim);
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === "$schema" || k === "default" || k === "additionalProperties") continue;
      if (k === "properties" && v && typeof v === "object") {
        const props = v as Record<string, unknown>;
        const cleaned: Record<string, unknown> = {};
        for (const [pk, pv] of Object.entries(props)) {
          if (pk === "__image_url__" || pk === "__icon_url__") continue;
          cleaned[pk] = slim(pv);
        }
        out[k] = cleaned;
        continue;
      }
      if (k === "required" && Array.isArray(v)) {
        out[k] = v.filter((x) => x !== "__image_url__" && x !== "__icon_url__");
        continue;
      }
      out[k] = slim(v);
    }
    return out;
  }
  return node;
}

function main() {
  const templatesDir = path.join(process.cwd(), "app", "presentation-templates");
  const out: Record<string, CatalogGroup> = {};

  for (const [dir, groupId] of Object.entries(DIR_TO_GROUP)) {
    const groupPath = path.join(templatesDir, dir);
    if (!fs.existsSync(groupPath)) {
      console.warn(`skip missing group dir: ${dir}`);
      continue;
    }
    const files = fs
      .readdirSync(groupPath)
      .filter((f) => f.endsWith(".tsx") && !f.includes(".test.") && !f.includes(".spec."))
      .sort();

    const layouts: CatalogLayout[] = [];
    for (const file of files) {
      const source = fs.readFileSync(path.join(groupPath, file), "utf-8");
      const compiled = compileTemplateSchema(source);
      if (!compiled) continue;
      const slug = readExportString(source, "slideLayoutId") ?? compiled.layoutId;
      const name = readExportString(source, "slideLayoutName") ?? compiled.layoutName;
      const description =
        readExportString(source, "slideLayoutDescription") ??
        compiled.layoutDescription;
      layouts.push({
        id: `${groupId}:${slug}`,
        name,
        description,
        schema: slim(compiled.schemaJSON),
      });
    }

    if (layouts.length === 0) {
      console.warn(`no compilable layouts in: ${dir}`);
      continue;
    }
    out[groupId] = { id: groupId, name: titleCase(groupId), layouts };
    console.log(`${groupId}: ${layouts.length} layouts`);
  }

  const target = path.join(
    process.cwd(),
    "..",
    "..",
    "supabase",
    "functions",
    "_shared",
    "catalogs.generated.json",
  );
  fs.writeFileSync(target, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nwrote ${target}`);
}

main();
