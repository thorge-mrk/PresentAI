// Icon resolution. The template components render an SVG from a URL, so we map
// a free-text query to a Phosphor icon slug and serve it via the Iconify CDN
// (very reliable, never 404s for known slugs).

// Curated, broadly useful Phosphor slugs (these all exist in the `ph` set).
const ICON_SLUGS = [
  "lightbulb", "rocket", "target", "chart-line-up", "chart-bar", "chart-pie",
  "trend-up", "trend-down", "users", "user", "handshake", "gear", "wrench",
  "shield-check", "lock", "globe", "map-pin", "calendar", "clock", "check-circle",
  "warning", "info", "question", "star", "heart", "thumbs-up", "trophy", "medal",
  "flag", "compass", "magnifying-glass", "book-open", "graduation-cap", "student",
  "brain", "atom", "flask", "leaf", "tree", "sun", "drop", "fire", "lightning",
  "coins", "currency-dollar", "bank", "briefcase", "buildings", "factory",
  "shopping-cart", "package", "truck", "airplane", "gauge", "puzzle-piece",
  "stack", "database", "cloud", "cpu", "code", "terminal", "device-mobile",
  "envelope", "chat-circle", "megaphone", "bell", "key", "scales", "hammer",
  "paint-brush", "palette", "camera", "image", "music-note", "film-strip",
  "list-checks", "clipboard-text", "note-pencil", "files", "folder", "link",
  "arrows-out", "arrows-in", "plus-circle", "minus-circle", "x-circle",
  "recycle", "plant", "first-aid", "heartbeat", "pill", "dna",
];

// Keyword hints -> slug. First matching keyword wins.
const KEYWORD_MAP: Array<[RegExp, string]> = [
  [/idea|innov|insight|tipp|kreativ/i, "lightbulb"],
  [/launch|start|grow|wachs|skal/i, "rocket"],
  [/goal|ziel|objective|aim|focus/i, "target"],
  [/increase|rise|up|steig|growth|umsatz/i, "chart-line-up"],
  [/decrease|fall|down|sink|risk|kosten/i, "trend-down"],
  [/bar|balken|vergleich|compare/i, "chart-bar"],
  [/pie|anteil|share|distribut/i, "chart-pie"],
  [/team|people|menschen|community|kund/i, "users"],
  [/partner|deal|agree|kooperat/i, "handshake"],
  [/setting|config|process|prozess|system/i, "gear"],
  [/tool|build|repair|wartung/i, "wrench"],
  [/secur|safe|schutz|datenschutz|privacy/i, "shield-check"],
  [/lock|password|zugang/i, "lock"],
  [/global|world|welt|international/i, "globe"],
  [/location|ort|map|standort/i, "map-pin"],
  [/time|zeit|schedule|termin/i, "clock"],
  [/date|kalender|plan/i, "calendar"],
  [/success|done|complete|fertig|erfolg/i, "check-circle"],
  [/warn|alert|achtung|problem|gefahr/i, "warning"],
  [/info|detail|hinweis/i, "info"],
  [/star|highlight|premium|besonder/i, "star"],
  [/love|favorit|gesundheit|herz/i, "heart"],
  [/win|award|trophy|preis|gewinn/i, "trophy"],
  [/learn|lern|education|bildung|schul/i, "graduation-cap"],
  [/book|lesen|read|wissen/i, "book-open"],
  [/think|brain|denk|intelli|ki|ai/i, "brain"],
  [/science|wissenschaft|experiment|chem/i, "flask"],
  [/nature|natur|umwelt|eco|öko|klima/i, "leaf"],
  [/energy|energie|power|strom/i, "lightning"],
  [/money|geld|finanz|cost|budget|preis/i, "coins"],
  [/business|firma|unternehmen|büro/i, "briefcase"],
  [/build|gebäude|stadt|haus/i, "buildings"],
  [/shop|kauf|store|markt|verkauf/i, "shopping-cart"],
  [/deliver|liefer|transport|logistik/i, "truck"],
  [/data|daten|statistik/i, "database"],
  [/cloud|server|hosting/i, "cloud"],
  [/code|program|software|entwickl/i, "code"],
  [/mobile|app|handy|phone/i, "device-mobile"],
  [/mail|email|nachricht|kontakt/i, "envelope"],
  [/chat|kommunikat|gespräch|dialog/i, "chat-circle"],
  [/market|werb|kampagne|promot/i, "megaphone"],
  [/law|recht|gesetz|fair|balance/i, "scales"],
  [/art|design|kreativ|farbe/i, "palette"],
  [/photo|foto|kamera|bild/i, "camera"],
  [/music|musik|sound|audio/i, "music-note"],
  [/video|film|movie/i, "film-strip"],
  [/list|aufgabe|task|todo|schritt/i, "list-checks"],
  [/health|gesund|medizin|arzt/i, "heartbeat"],
  [/recycl|nachhalt|sustain|kreislauf/i, "recycle"],
  [/plant|pflanze|garten|grow/i, "plant"],
];

export function iconUrl(slug: string): string {
  return `https://api.iconify.design/ph/${slug}-bold.svg`;
}

export function pickIconSlug(query: string): string {
  const q = (query ?? "").toLowerCase();
  for (const [re, slug] of KEYWORD_MAP) {
    if (re.test(q)) return slug;
  }
  // Stable deterministic fallback based on the query string.
  let hash = 0;
  for (let i = 0; i < q.length; i++) hash = (hash * 31 + q.charCodeAt(i)) >>> 0;
  return ICON_SLUGS[hash % ICON_SLUGS.length] ?? "star";
}

// For the search-icons function: return slugs that loosely match the query.
export function searchIconSlugs(query: string, limit = 20): string[] {
  const q = (query ?? "").toLowerCase().trim();
  if (!q) return ICON_SLUGS.slice(0, limit);
  const ranked = ICON_SLUGS.filter((s) => s.includes(q) || q.includes(s));
  const matched = pickIconSlug(q);
  const merged = [matched, ...ranked, ...ICON_SLUGS];
  return [...new Set(merged)].slice(0, limit);
}
