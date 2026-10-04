---
name: texte-und-sprachen
description: >
  Sprachen der öffentlichen Seiten (de ohne Präfix, /fr, /it, /en) und der App hinter der Anmeldung (App-Sprache), Übersetzungen, Texte der Landing Pages, App-Texte in src/texte/app, Hauptknopf. Use when Texte in src/texte/, Ratgeber, Landing Pages, Rechtstexte, sprache.ts, app-sprache.ts, page-meta.ts, hreflang, UI-Texte der App, Mails oder PDFs geändert oder übersetzt werden.
---

## Sprachen der öffentlichen Seiten
- Öffentlich sind Landing Pages, Hilfe, Rechtstexte, Login und Ratgeber. Deutsch ohne Präfix, damit bestehende Links
  gelten, Französisch, Italienisch und Englisch unter `/fr`, `/it`, `/en` mit denselben Pfaden (`src/lib/sprache.ts`,
  der Router legt jede öffentliche Route pro Präfix an, `page-meta.ts` setzt `lang`, canonical und hreflang mit
  x-default Deutsch).
- Texte in `src/texte/<seite>.ts` (je Sprache ein Objekt gleicher Form, `useSprache(texte)`), lange Seiten als
  `src/texte/<seite>/<fr|it|en>.vue` neben dem deutschen Inhalt der Seite, Ratgeber unter `content/ratgeber/<fr|it|en>/`.
- Rechtstexte und Hilfe nennen App-Knöpfe mit ihrer Beschriftung in der jeweiligen Sprache (aus `src/texte/app/`).
- Rechtstexte verweisen auf die massgebende deutsche Fassung. Anrede auf öffentlichen Seiten fr «vous», it «tu», en «you».

## Sprache der App hinter der Anmeldung
- `src/lib/app-sprache.ts`: `appSprache` (Vue-ref). Quelle in dieser Reihenfolge: Feld `sprache` der Entität `settings`
  am Benutzer (lädt `stores/reminders.ts` beim Start, `spracheNachLaden`), sonst die im Browser gemerkte Wahl
  (`localStorage.sprache`, gesetzt von der Login-Seite in ihrer Sprache und von der Wahl in den Einstellungen), sonst
  Deutsch. Fehlt die Sprache am Benutzer, wird eine nicht-deutsche Browser-Wahl nachgetragen. Gewählt wird in den
  Einstellungen (Karte «Sprache», `data-testid="sprache-wahl"`, `setSprache`).
- `useSprache(texte)` nimmt auf Pfaden mit Präfix oder `meta.public` die Pfad-Sprache, sonst `appSprache`. Code
  ausserhalb von Komponenten: `waehle(texte)`. `main.ts` setzt PrimeVue-Texte (`src/texte/app/primevue.ts`) und `lang`.
- Texte in `src/texte/app/<thema>.ts`, Muster `const de = {...}` und `satisfies Record<Sprache, typeof de>`; Funktionen
  für Platzhalter und Mehrzahl nur mit Zahl- oder String-Parametern. Gemeinsame Wörter in `allgemein.ts`.
- Daten bleiben deutsch: Kategorie-Schlüssel, Standard-Bezeichnungen des Wartungsplans und Beschreibungen stehen so in
  der Datenbank. Angezeigt werden sie über `categoryLabel` und `planLabel` (`services/report.ts`, Tabelle
  `src/texte/app/kategorien.ts`); eigene Texte der Nutzer bleiben, wie sie sind.
- Zahlen und Daten über `src/lib/locale.ts` mit der App-Sprache: de, fr, it Schweizer Format (`1'234.50`,
  `14.09.2026`), en britisch (`1,234.50`, `14/09/2026`). InputNumber mit `:locale="zahlenLocale()"`.
- Erinnerungsmails nehmen die Sprache aus `settings.sprache` des Empfängers (`services/reminders.ts`, `mailSprache`);
  Abo-Rechnung (PDF, QR-Zahlteil, Mails im AI-Proxy) die Sprache der Bestellung (`language` an der Rechnungsadresse).
  Mails an info@ bleiben deutsch.
- KI: Prompts bleiben deutsch (`src/services/prompts.ts`, Schema-Beschreibungen); der Chat-Prompt bekommt je
  App-Sprache eine Schlusszeile, damit das Modell in dieser Sprache antwortet. Der Rechnungs-Scan übernimmt Felder in
  der Sprache des Dokuments. `chat-guard.ts` erkennt Erfolgsbehauptungen in allen vier Sprachen.
- Fehlermeldungen des AI-Proxys sind deutsch; `userMessage` und die Bestellung ersetzen sie in anderen Sprachen durch
  eigene Texte.
- App duzt: fr «tu», it «tu», en neutral (britische Schreibweise). Schweizer Begriffe: MFK = fr «expertise (MFK)»,
  it «collaudo (MFK)», Kontrollschild = plaque/targa/number plate, Werkstatt = garage/officina/garage.

## Tests
- Jede Änderung an einem deutschen Text geht im selben Commit in alle drei Übersetzungen.
- `src/texte/texte.test.ts` prüft Form, Gliederung und Links der öffentlichen Texte, `src/texte/app-texte.test.ts`
  Form, leere Texte und ß der App-Texte, `src/texte/app-deutsch.test.ts` (Heuristik `deutsch-finden.ts`), dass in
  Seiten, Komponenten und Diensten der App kein deutscher Text fest steht; Fehlalarme mit Begründung in `AUSNAHMEN`.
- `e2e/languages.spec.ts` prüft Sprache, Links und 390px der öffentlichen Seiten, `e2e/app-sprache.spec.ts` die
  Sprachwahl der App. E2E läuft deutsch: ohne gespeicherte Wahl ist die App deutsch, deutsche Texte also nur bewusst ändern.

## Texte und Hauptknopf
- Hauptknopf überall «30 Tage gratis testen» (führt zum Login, der Klick zählt in `events` über `useEventsStore`).
- Kein Lead-Formular: Fragen gehen per mailto an `info@wartungsheft.ch` (Footer aller Landing Pages, auf `/betrieb`
  zusätzlich unter dem Knopf mit Betreff).
- Kein Pilotangebot, keine Einrichtung vor Ort. Du-Form auch für Betriebe, bewusst.
- Persona-Durchgänge (Neulenker, Rentner, CEO, Fahrer) mit Screenshots auf 390px, bevor UI-Texte als fertig gelten.
