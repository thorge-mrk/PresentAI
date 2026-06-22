// Walks generated slide content and fills in real media URLs:
//  - any object with `__image_prompt__`  -> sets `__image_url__`
//  - any object with `__icon_query__`    -> sets `__icon_url__`
// This is layout-agnostic, so it works for images/icons nested in arrays.
import { firstImage, fallbackImage } from "./images.ts";
import { iconUrl, pickIconSlug } from "./icons.ts";

const MAX_IMAGES_PER_SLIDE = 6;

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

export async function hydrateMedia(content: unknown): Promise<void> {
  const images: ImageNode[] = [];
  collect(content, images);

  const slice = images.slice(0, MAX_IMAGES_PER_SLIDE);
  await Promise.all(
    slice.map(async ({ node, prompt }) => {
      try {
        const { url } = await firstImage(prompt);
        node.__image_url__ = url;
      } catch (_e) {
        node.__image_url__ = fallbackImage(prompt);
      }
    }),
  );
  // Any images beyond the cap still get a deterministic fallback.
  for (const { node, prompt } of images.slice(MAX_IMAGES_PER_SLIDE)) {
    node.__image_url__ = fallbackImage(prompt);
  }
}
