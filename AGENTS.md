# Wartungsheft: Arbeitswissen für Agenten

Einstiegsdatei für dieses Repo; `CLAUDE.md` zieht sie per `@AGENTS.md` herein. Anlassbezogenes liegt in
`.claude/skills/` (abo-rechnung, scan-und-chat, wartungsplan, auswertungen-export, texte-und-sprachen, instantdb-start,
mistral-limits, e2e-test, app-hilfe, werbefilm) und wird bei Bedarf geladen.

Die App läuft unter https://wartungsheft.ch (Landing Pages `/betrieb` und `/privathalter`, Login mit Magic Code, AI-Proxy unter `ai.`, InstantDB unter `api.`/`dash.`/`files.`). Betrieb und Befehle: README «Produktion», Skill `instantdb-start` «Produktion».

Produktname «Wartungsheft» (wartungsheft.ch) in allen Texten, Titeln, Manifest und Chat-Prompts; «auto-service» bleibt nur als Repo-, Paket- und Pfadname.
Logo ist `public/favicon.svg` (Serviceheft mit Haken, `#059669`), in Seiten nur über `AppLogo.vue`; PWA-Icons daraus mit
`resvg` rendern. `pi pi-car` steht für Fahrzeuge, nie für die Marke.

Produktgrenze (business-plan/03-produkt.md «Abgrenzung»): Serviceheft mit Rechnungen, pro Fahrzeug. Kein Tankbuch, kein Fahrtenbuch,
keine Buchhaltung, keine Übernahme-Checklisten, keine Fahrer-Fahrzeug-Zuordnung oder Rollen, kein Aufpreis für Betriebe.
Zwei Preislisten, gleiche Funktionen: Privat 25 CHF im Jahr bis 5 Fahrzeuge, Betrieb 36 CHF pro Fahrzeug und Jahr
mit Rechnung auf die Firma (`plans.ts`: `yearlyPriceChf(n, audience)`, Pläne `free`, `privat`, `betrieb`).
Bezahlt wird zuerst per QR-Rechnung für Schweizer Kunden; ob später Payrexx oder Stripe für Karten dazukommt, ist offen
(Skill `abo-rechnung`).

## Arbeitsweise
- Text-, Style- und Marketing-Änderungen einer Runde erst sammeln, dann einmal Lint und die betroffenen Specs (oder wenn Goran «testen» sagt); nicht nach jeder kleinen Änderung. Deploy nur auf Aufforderung.
- Gorans eigenes Konto in der Produktion ist ein Testkonto: Datenfehler dort ohne Rückfrage korrigieren und im Bericht nennen. Bei echten Kunden weiter fragen.
- Produktpost läuft über info@wartungsheft.ch mit `mailbox … wartungsheft` (Skill `mailbox`), nie über die Gmail-Anbindung (deren Absender ist immer die Gmail-Adresse). Resend (login@, erinnerung@) nur für automatische App-Mails, kein Empfang.
- Google Ads nur über die CLI `ads` (`~/projects/tools/ads.py`, Zugang in `~/.config/google-ads/`); fehlt ein Befehl, in `ads.py` ergänzen. Die Ads-Oberfläche in Chrome nur für Einstellungen ohne API.
- Meldet die Chrome-Extension «not connected», erneut versuchen und nach Skill `browser-wahl` selbst beheben, die Aufgabe nicht zurückgeben.

## Hilfs-Repos und todo.md
Gearbeitet wird auf zwei Rechnern (Windows und Fedora); neben diesem Repo auch `../business` und `../ai-proxy` pullen.
Scheitert ein Pull (lokale Änderungen, abweichende Historie), nicht selbst auflösen, sondern melden. Bringt der Pull in
`../ai-proxy` neue Abhängigkeiten, danach dort und hier `npm install`.

`todo.md` ist öffentlich, `../business` privat: Punkte mit geschäftlichem Inhalt (Preise, Anbieter, Kanäle, Texte,
Termine, Konditionen) stehen in `todo.md` nur als eine Zeile mit Verweis auf die Stelle in `../business`
(bzw. `business-plan/`), die Einzelheiten nur dort.

## Commands
npm run dev          # Vite + InstantDB + AI-Proxy (startet, was nicht läuft; Proxy-Log /tmp/ai-proxy-dev.log)
npm run dev:vite     # Vite dev server only (no InstantDB check)
npm run build        # vue-tsc + vite build
npm run lint         # ESLint (antfu config)
npm run lint:fix     # ESLint autofix
npm run test:e2e     # Playwright E2E (loads .env via dotenv)
npm run test:e2e:ui  # Playwright UI mode
npm run test:e2e:soft # Weiche KI-Tests (@soft), nicht Teil der Standard-Suite
npm run test:unit    # Vitest: src/**/*.test.ts (die AI-Proxy-Tests liegen im Repo ~/projects/ai-proxy)
npm run dev:proxy    # AI-Proxy lokal aus node_modules/@strainovic/ai-proxy (liest .env, Port 8787)

Dev-Instanz `wartungsheft-dev` (InstantDB per SSH-Tunnel, `ssh debian@195.15.207.253`) schaltet sich nach 2 h
ohne SSH-Verbindung ab und wird beim nächsten Akquise-Lauf zurückgestellt. Vor dem Tunnel wecken:
`~/projects/tools/dev-instanz-wecken.sh wartungsheft-dev` (braucht `openstack` und `~/.config/openstack/clouds.yaml`).

## Architecture
Vue 3 + PrimeVue + Pinia + **InstantDB** (self-hosted) + Vercel AI SDK v6 + PWA + **AI-Proxy** (eigenes Repo `~/projects/ai-proxy`, Paket `@strainovic/ai-proxy` via `file:../ai-proxy`)

src/
  pages/          # LandingPage, LoginPage, DashboardPage, VehiclesPage, VehicleDetailPage, SettingsPage, ImpressumPage, DatenschutzPage
  components/     # ChatDrawer, MediaViewer, ToolResultCard, StatCard, VehicleCard, VehicleForm, Invoice*/Maintenance* (Form + FormDialog)
  composables/    # useImageResize (client-side 1540px resize), useInvoiceScan, useVehicleScan, useFormValidation, useSprache …
  services/       # ai.ts (Mistral: OCR-Pipeline + Modell-Factory), chat.ts (tool-calling), maintenance-schedule.ts
  stores/         # Pinia: vehicles, invoices, maintenances, settings
  lib/            # instantdb.ts (DB-Client), instant-config.ts (Modus cloud/local/selfhosted, reine Funktion), locale.ts, errors.ts
  texte/          # Texte je Sprache: öffentliche Seiten, app/ für die App (Skill `texte-und-sprachen`)
../ai-proxy/      # AI-Proxy (eigenes Repo): app.ts (Hono, DI), auth/instant.ts, billing.ts (Stripe), limits.ts,
                  # plans.ts (Frontend importiert '@strainovic/ai-proxy/plans'), stores/ (memory, instant), Dockerfile
deploy/           # docker-compose.yml (ai-proxy + caddy für PWA), Caddyfile, .env.example
e2e/              # Playwright tests + fixtures/ (Code)
testdateien/      # Testbilder für E2E und manuelles Ausprobieren, Übersicht und Lizenzen in README.md
scripts/          # dev.sh (Vite + InstantDB), test-9-images.ts (manueller OCR-Pipeline-Test)
tmp/              # Testbilder + 9-Seiten-PDF für manuelle Tests (gitignored, NICHT löschen)

## InstantDB
Backend-Datenbank mit Echtzeit-Sync via WebSocket. Starten, Konfiguration, Entwickeln ohne Docker, Produktion und Auth:
Skill `instantdb-start`. Modi (`src/lib/instant-config.ts`):
- **Cloud (Default ohne Variable, Auslaufmodell):** instantdb.com, App-ID `5d413a89-91ad-4a5a-ad71-d2df5fd81d88`.
  Das Instant-Team ist bei OpenAI, keine neuen Signups, **Cloud-Abschaltung 31.08.2027**. Der lokale Proxy kann Cloud-Tokens nicht prüfen, Scan und Chat
  antworten dann mit 401.
- **Local (Entwicklung und E2E):** `VITE_INSTANTDB_MODE=local`, App-ID `cd7e6912-773b-4ee1-be18-4d95c3b20e9f`,
  Auth-Bypass im Frontend, Proxy erkennt den Nutzer am Header `x-user-id`. `scripts/dev.sh` setzt den Modus,
  Playwright ebenso: E2E läuft immer gegen den lokalen Server.
- **Selfhosted (Produktion):** `VITE_INSTANTDB_MODE=selfhosted` + `VITE_INSTANT_APP_ID`, `VITE_INSTANT_API_URI`,
  optional `VITE_INSTANT_WS_URI` (sonst aus API-URI abgeleitet). Echte Auth, kein Bypass.
- `npm run dev` → Local, `VITE_INSTANTDB_MODE=cloud npm run dev` → Cloud ohne Scan und Chat.
- Entity-IDs sind UUIDs (`id()`), Hashes als eigenes Feld.

## AI
Nur Mistral, alles über den AI-Proxy; der Client kennt keinen Mistral-Key und kein Modell, `VITE_AI_PROXY_URL` ist
Pflicht. Modelle, Pipeline, Grenzen: Skill `mistral-limits`. Scan und Chat: Skill `scan-und-chat`.

## Key Patterns
- Währung, Zahlen und Datum nur über `src/lib/locale.ts` in der App-Sprache (CHF, `1'234.50`, `formatDate` →
  `14.09.2026`, en `14/09/2026`, `formatMonth`; bewusst ohne Intl, weil Browser und Node verschiedene Apostrophe liefern). ISO-Daten bleiben in Formularfeldern,
  CSV und Dateinamen. Kategorie-Schlüssel (`oelwechsel`, `fahrwerk`) nie roh anzeigen, immer `categoryLabel` aus
  `src/services/report.ts`, die einzige Label-Tabelle. Kilometerstand 0 heisst unbekannt und wird weggelassen.
- Speicherwege: Rechnungen immer über `saveInvoice` (`src/services/invoice-save.ts`: Rechnung, eine Wartung pro Kategorie
  mit `invoiceId`, höherer Kilometerstand, eine Transaktion; Chat, Formular und Stapel) und beim Bearbeiten über
  `updateInvoice` (zieht Datum, Kilometerstand und Positionen in die verknüpften Wartungen nach), Wartungen ohne Rechnung über
  `saveMaintenances` (`src/services/maintenance-save.ts`: Formular, «Erledigt eintragen», «Eintragen» im Wartungsplan,
  Serviceheft). Nie direkt `tx.invoices`/`tx.maintenances` aus Seiten schreiben. Jeder Speicherweg verlangt die Herkunft
  `source` (`EntrySource` in `src/services/entry-source.ts`, auch `vehiclesStore.add` und die Chat-Tools); sie ersetzt
  einen Analytics-Dienst, Auswertung in README «6. Health-Checks und Zahlen».
- Löschen kaskadiert: Fahrzeug über `vehiclesStore.removeWithRelated` (Rechnungen und Wartungen mit), Rechnung löscht
  ihre Wartungen über `invoiceId`; Wartungen aus `add_invoice` tragen die `invoiceId`.
- Die Stores `invoices` und `maintenances` halten alle Einträge des Kontos; Seiten für ein Fahrzeug filtern mit
  `getByVehicleId`, nie direkt `store.invoices` verwenden.
- Fehler an Nutzer nur über `userMessage` in `src/lib/errors.ts` (402/429/Netz/Auth in Sätze der App-Sprache; die deutsche
  Limit-Meldung des ai-proxy geht auf Deutsch unverändert durch, sie nennt Kontingent und Plan). Technische Details nur in der Konsole.
- Offline: ohne Verbindung wird der Beleg mit `scanPending` gespeichert (kein Tesseract, es lädt vom CDN),
  `useOfflineScanQueue` holt den Scan beim `online`-Ereignis nach und füllt nur leere Felder. Speicherwege dürfen
  keine Serverabfrage voraussetzen; `db.queryOnce` scheitert offline.
- Herkunftsfrage der Anmeldung und Rückfrage-Mails an Testkonten (Tag 21 und 31, Schalter `TRIAL_FEEDBACK_MAILS`,
  Standard aus): README «7. E-Mail-Erinnerungen». Texte der Rückfragen nur zusammen mit der Freigabe-Datei
  `~/projects/find-jobs/freigaben/wartungsheft-feedback-mails.md` ändern.
- Wortwahl in der App: «Rechnung» (nie «Beleg»), «Kontrollschild» und «Fahrgestellnummer» wie auf dem Schweizer
  Ausweis (nie «Kennzeichen», «FIN»). Formular «Neues Fahrzeug» belegt nichts vor: Baujahr und Kilometerstand 0 heisst
  unbekannt, der Ausweis-Scan füllt leere Felder. Löschen eines Fahrzeugs nur auf der Fahrzeugseite, nicht auf der Karte.

## Code Style
- UI text in DE, FR, IT, EN only via `src/texte/` (no hard-coded strings, test `app-deutsch.test.ts`); AI prompts and
  schema descriptions stay German (`src/services/prompts.ts`)
- antfu ESLint (no semicolons, single quotes, if-newline rule); `npm run lint` muss ganz sauber sein, auch vorbestehende Fehler beheben
- Zod-Fehler über `error.issues` lesen, `error.errors` gibt es nicht
- All source TypeScript; eslint.config.js stays .js (ESLint compat)

## Unit-Tests und Proxy
- Vitest: `src/**/*.test.ts`, Konfig `vitest.config.ts` (mit Vue-Plugin). Seiten rendert ein Test per
  `vue/server-renderer` mit Memory-Router; Kopf, Fuss und Events-Store per `vi.mock` ersetzen, sonst zieht er den
  InstantDB-Client mit (Beispiel `src/pages/AnlagenPage.test.ts`).
- Grafiken der Angebotsseiten: Inline-SVG aus `GrafikAblauf.vue` und `GrafikVorherNachher.vue` (Stil der
  Produktseiten von strainovic-it.ch), Masse in `src/lib/grafik.ts`, Stile in `src/styles/grafik.css`, Beschriftungen aus
  `src/texte/`. `grafik.test.ts` prüft je Sprache, dass kein Text aus seinem Kasten ragt.
- Proxy-Tests im Repo ai-proxy: `createApp(deps)` nimmt alles per
  DI (fetch, Store, verifyToken) → Proxy-Logik ohne Netz testbar. Stripe-Webhooks mit `generateTestHeaderString` signiert.
- Der Proxy läuft mit Node-nativem Type-Stripping: relative Imports **mit `.ts`-Endung** (`./app.ts`), kein Build.
- Node `--env-file` überschreibt bereits exportierte Shell-Variablen **nicht**: ein in der Shell gesetzter
  `MISTRAL_API_KEY` übersteuert `npm run dev:proxy`. Playwright gibt den `.env`-Key deshalb explizit per `env` mit.
- `pkill -f "node.ts"` killt die eigene Shell, wenn der Suchstring im Befehl steht → `pgrep -f "^node .*ai-proxy/src/node\.ts"`.
