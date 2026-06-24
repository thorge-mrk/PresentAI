// Walks generated slide content and fills in real media URLs:
//  - any object with `__image_prompt__`  -> sets `__image_url__` (AI-generated)
//  - any object with `__icon_query__`    -> sets `__icon_url__`
// This is layout-agnostic, so it works for images/icons nested in arrays.
//
// Images are generated with Gemini ("Nano Banana") and stored in Supabase
// Storage — no stock photos. On failure a neutral placeholder is used so a
// slide never ends up with a broken image.
import { fallbackImage } from "./images.ts";
import { iconUrl, pickIconSlug } from "./icons.ts";
import { generateImageUrl } from "./image-gen.ts";

const MAX_IMAGES_PER_SLIDE = 4;

interface ImageNode {
  node: Record<string, unknown>;
  prompt: string;
}

function collect(value: unknown, images: ImageNode[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collect(item, images);
    return;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.__image_prompt__ === "string") {
      images.push({ node: obj, prompt: obj.__image_prompt__ });
    }
    if (typeof obj.__icon_query__ === "string") {
      obj.__icon_url__ = iconUrl(pickIconSlug(obj.__icon_query__));
    }
    for (const key of Object.keys(obj)) {
      if (key === "__image_prompt__" || key === "__icon_query__") continue;
      collect(obj[key], images);
    }
  }
}

/** Run async tasks with a bounded concurrency to respect AI rate/time limits. */
async function mapLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let i = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (i < items.length) {
        const idx = i++;
        await fn(items[idx]);
      }
    },
  );
  await Promise.all(workers);
}

/**
 * Collect every image placeholder across all provided content objects and
 * generate them with a single shared concurrency budget. Pass all slides at
 * once so the whole deck's images are produced in parallel (bounded), which is
 * far faster than hydrating slide-by-slide.
 */
export async function hydrateAllMedia(
  contents: unknown[],
  userId: string,
  concurrency = 4,
): Promise<void> {
  const images: ImageNode[] = [];
  for (const content of contents) {
    const perSlide: ImageNode[] = [];
    collect(content, perSlide);
    // Cap images per slide; placeholder the overflow.
    for (const extra of perSlide.slice(MAX_IMAGES_PER_SLIDE)) {
      extra.node.__image_url__ = fallbackImage(extra.prompt);
    }
    images.push(...perSlide.slice(0, MAX_IMAGES_PER_SLIDE));
  }

  await mapLimit(images, concurrency, async ({ node, prompt }) => {
    try {
      const { url } = await generateImageUrl(prompt, userId);
      node.__image_url__ = url;
    } catch (_e) {
      node.__image_url__ = fallbackImage(prompt);
    }
  });
}

/** Back-compat single-slide helper (now AI-backed). */
export async function hydrateMedia(
  content: unknown,
  userId: string,
): Promise<void> {
  await hydrateAllMedia([content], userId);
}
