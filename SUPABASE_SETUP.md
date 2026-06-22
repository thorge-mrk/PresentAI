# Present AI — Supabase Setup

Die App läuft komplett auf **Supabase** (Postgres + Auth + Edge Functions) und
**Google Gemini** + **Pexels**. Dieses Dokument beschreibt, was du einmalig
einrichten musst.

Projekt: **Present** · Ref `ocabezkxbsktenhagcbd` · Region `eu-central-1`
URL: `https://ocabezkxbsktenhagcbd.supabase.co`

---

## 1. Datenbank (bereits eingerichtet)

Die Migration `init_presentai_schema` wurde angewendet. Tabellen:

| Tabelle | Zweck |
|---|---|
| `presentations` | eine Zeile pro Präsentation (Thema, Niveau, Status …) |
| `slide_outlines` | die Gliederung (eine Zeile pro Folie) |
| `slides` | die fertigen Folien inkl. `layout` + `content` (JSON) |
| `allowed_emails` | **Allowlist**: nur diese E-Mails dürfen generieren |

RLS ist auf allen Tabellen aktiv (Eigentümer-Prinzip). Die Edge Functions
schreiben mit dem Service-Role-Key.

---

## 2. Edge Function Secrets (DU musst die Keys eintragen)

Dashboard → **Project Settings → Edge Functions → Secrets** (oder
`Edge Functions → Secrets`). Folgende Secrets anlegen:

| Secret | Pflicht | Wert / Quelle |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google AI Studio → API Key (https://aistudio.google.com/apikey) |
| `PEXELS_API_KEY` | ✅ | https://www.pexels.com/api/ |
| `UNSPLASH_ACCESS_KEY` | optional | https://unsplash.com/developers (Fallback für Bilder) |
| `GEMINI_MODEL` | optional | Standard: `gemini-2.5-flash` |

`SUPABASE_URL`, `SUPABASE_ANON_KEY` und `SUPABASE_SERVICE_ROLE_KEY` werden von
Supabase automatisch in die Functions injiziert — die musst du **nicht** setzen.

---

## 3. Auth: E-Mail-Bestätigung

Damit die Anmeldung mit **E-Mail + Passwort** ohne eigenen Mailserver sofort
funktioniert: Dashboard → **Authentication → Sign In / Providers → Email** →
Option **„Confirm email" deaktivieren**.

(Lässt du sie an, bekommen Nutzer eine Bestätigungsmail über den
eingebauten Supabase-Mailer — limitiert und ggf. im Spam.)

Die eigentliche Zugangskontrolle läuft über die **Allowlist** (Schritt 4),
nicht über die E-Mail-Bestätigung.

---

## 4. Deine E-Mail freischalten (Allowlist)

Nur E-Mails in `allowed_emails` dürfen Präsentationen generieren / Bilder suchen.
`thorge.mro@gmail.com` ist bereits eingetragen. Weitere hinzufügen:

Dashboard → **SQL Editor**:

```sql
insert into public.allowed_emails (email, note)
values ('weitere@email.de', 'Kollege')
on conflict (email) do nothing;
```

---

## 5. Next.js App (lokal starten)

```bash
cd servers/nextjs
cp .env.example .env.local   # Werte sind schon eingetragen (öffentlich)
npm install
npm run dev
```

Benötigte Variablen stehen in `.env.example`:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DISABLE_AUTH=1`.

---

## 6. GitHub: Web-Build-Test

Der Workflow `.github/workflows/web-build.yml` baut die App bei jedem Push/PR
(und manuell über „Run workflow"). Optional für einen produktionsnahen Build
zwei Repo-Secrets setzen (Settings → Secrets and variables → Actions):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Ohne diese Secrets nutzt der Build sichere Platzhalter und läuft trotzdem durch.

---

## 7. Wie die Generierung funktioniert

1. **generate-outline** — Gemini recherchiert das Thema und erstellt die
   Gliederung; speichert `presentations` + `slide_outlines`.
2. **approve-outline** — Gemini wählt pro Folie das passende **Layout** aus dem
   Vorlagen-Katalog (`general`) und füllt dessen `content`; Bilder (Pexels) und
   Icons (Phosphor/Iconify) werden danach automatisch ergänzt. Speichert `slides`.
3. **get-presentation / update-slide** — Laden bzw. einzelne Folie bearbeiten.
4. **search-images / search-icons** — Suche im Editor.

Alle Functions verlangen ein gültiges Login (`verify_jwt`); die teuren
(`generate-outline`, `approve-outline`, `search-images`) zusätzlich die Allowlist.

---

## 8. Edge Functions neu deployen

Quellcode liegt unter `supabase/functions/`. Mit der Supabase CLI:

```bash
supabase link --project-ref ocabezkxbsktenhagcbd
supabase functions deploy            # alle
# oder einzeln, z.B.:
supabase functions deploy approve-outline
```

> Hinweis: Beim letzten Mal war der Function-Code nirgends gespeichert. Jetzt
> liegt er versioniert im Repo unter `supabase/functions/` — bitte dort pflegen.
