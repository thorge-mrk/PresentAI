# Present AI — Flutter App (Vorbereitung)

Dies ist ein **Grundgerüst** für die zukünftige mobile App. Es ist bewusst
schlank gehalten und noch **nicht vollständig funktionsfähig** — Auth-Formular,
Editor und Vorschau müssen noch gebaut werden. Was bereits steht:

- `lib/config.dart` – Supabase-URL + Anon-Key (gleiche öffentliche Werte wie Web).
- `lib/services/edge_functions.dart` – Client für **dieselben** Supabase Edge
  Functions wie die Web-App (`generate-outline`, `approve-outline`,
  `get-presentation`, `update-slide`, `save-presentation`, `search-images`,
  `search-icons`, `generate-image`, `edit-slide`, `presentation-chat`).
- `lib/main.dart` – minimaler Einstieg, der die Gliederungs-Erstellung aufruft.

## Architektur

Die App spricht **ausschließlich** mit den Edge Functions — keine direkte
Datenbank- oder KI-Logik im Client. Dadurch teilen Web und Mobile exakt dieselbe
Backend-Logik (Gemini 3.1 Flash Lite für Text, „Nano Banana" für Bilder).

## Starten (sobald Flutter installiert ist)

```bash
cd flutter_app
flutter pub get
flutter run \
  --dart-define=SUPABASE_URL=https://ocabezkxbsktenhagcbd.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=<dein-anon-key>
```

## Nächste Schritte

1. Echtes E-Mail/Passwort-Login (Supabase Auth) einbauen.
2. Gliederungs- und Editor-Screens umsetzen.
3. Folien-Rendering (die Web-Templates als Flutter-Widgets nachbauen).
4. Export (PDF) über `printing`/`pdf`-Pakete.
