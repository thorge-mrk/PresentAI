# Present AI

KI-Präsentationsgenerator für Schule & Bildung — vollständig cloud-nativ.

**Stack:** Next.js (Web) · Supabase Edge Functions (Backend) · Google Gemini über GCP Service Account (Vertex AI) · Unsplash/Pexels (Bilder) · Lucide (Icons)

Das Backend besteht ausschließlich aus Supabase Edge Functions — dieselben Endpunkte werden später auch von der Flutter-App genutzt.

## Workflow (6 Schritte)

1. **Eingabe:** `topic`, `gradeLevel`, `textDensity` (`low`/`compact`/`high`), `slideCount` (1–25)
2. **Research Agent:** Gemini mit Google Search Grounding recherchiert das Thema, gefiltert auf die Klassenstufe
3. **Gliederung + Freigabe:** Strukturierte Folien-Vorschau (`slideIndex`, `section`, `title`, `visualDescription`) — der Prozess stoppt bis zur Freigabe durch den Nutzer
4. **Content-Generierung:** Pro Folie Folientext (nach Textdichte), Speaker Notes und englische Asset-Suchbegriffe
5. **Asset-Integration:** Unsplash/Pexels-Bilder + Lucide-Icons werden automatisch in die Design-Templates gemappt
6. **Editor + Export:** Inline-Editing (TipTap), Export als PPTX (PptxGenJS), PDF (Print) und PNG (html2canvas)

## Supabase Edge Functions

| Function | Methode | Zweck |
|---|---|---|
| `generate-outline` | POST | Schritt 1–3: Recherche + Gliederung erstellen |
| `approve-outline` | POST | Schritt 4–5: Freigabe → Content + Assets generieren |
| `get-presentation` | GET `?id=` | Präsentation mit Gliederung + Folien laden |
| `update-slide` | PATCH | Inline-Editing einer Folie speichern |
| `search-images` | GET `?q=` | Unsplash/Pexels-Bildersuche |
| `search-icons` | GET `?q=` | Lucide-Icon-Suche |

## Datenbank (Supabase PostgreSQL)

- `presentations` — Anfrage + Status (`outlined` → `approved` → `generating` → `complete`)
- `slide_outlines` — Gliederung vor der Freigabe
- `slides` — generierter Foliencontent inkl. Bilder, Icons, Speaker Notes

## Setup

### 1. Edge Function Secrets (Supabase Dashboard → Edge Functions → Secrets)

```bash
# Google AI über GCP Service Account (primär)
GCP_SERVICE_ACCOUNT_JSON={ ...kompletter Service-Account-Key als JSON... }
GCP_LOCATION=global               # optional
GCP_PROJECT_ID=mein-projekt       # optional, sonst aus dem Key

# Fallback ohne Service Account
GOOGLE_API_KEY=...                # https://aistudio.google.com

# Stockbilder (mind. einer empfohlen)
UNSPLASH_ACCESS_KEY=...
PEXELS_API_KEY=...
```

Service Account anlegen: GCP Console → IAM → Service Accounts → Schlüssel (JSON) erstellen.
Rolle: **Vertex AI User**. API aktivieren: `aiplatform.googleapis.com`.

### 2. Web-App starten

```bash
cd servers/nextjs
npm install --legacy-peer-deps
npm run dev
```

`servers/nextjs/.env.local` enthält die Supabase-URL und den Anon Key.

## Flutter-Anbindung

Alle Edge Functions sind CORS-offen und ohne JWT aufrufbar (Anon Key als `apikey`-Header):

```dart
final res = await http.post(
  Uri.parse('https://lmmnwgtcdjyiktobsere.supabase.co/functions/v1/generate-outline'),
  headers: {'Content-Type': 'application/json', 'apikey': supabaseAnonKey},
  body: jsonEncode({
    'topic': 'Die Französische Revolution',
    'gradeLevel': '8.-10. Klasse',
    'textDensity': 'compact',
    'slideCount': 10,
  }),
);
```
