---
name: scan-und-chat
description: >
  Rechnungs-Scan (Foto, PDF, Sammel-PDF), Nachkontrolle der Positionen, Fahrzeugausweis-Scan, Chat mit Tools, System-Prompt und AI SDK v6. Use when an useInvoiceScan, parseInvoice(sPdf), mergePdfPages, invoice-items.ts, useVehicleScan, chat.ts, chat-guard.ts, ToolResultCard, Prompts oder category-correction.ts gearbeitet wird.
---

## Rechnungs-Scan im Formular «+ Rechnung hinzufügen»
- `src/composables/useInvoiceScan.ts`: Foto verkleinern und ausrichten (`autoRotateForDocument`, Regel in
  `src/lib/orientation.ts`: Querformat immer drehen, Hochformat nur ab OSD-Sicherheit 2), dann `parseInvoice`.
- PDF über `parseInvoicesPdf`: OCR aller Seiten, dann **jede Seite einzeln** auswerten (Art rechnung/fortsetzung/andere)
  und mit `mergePdfPages` zusammenführen; ein einziger Aufruf fürs ganze PDF lässt Rechnungen aus und überträgt die
  Werkstatt falsch. Mistral ordnet die Seitenart nicht stabil zu, darum feste Regeln in `mergePdfPages`: das Total einer
  Fortsetzung gilt (Kopfseiten ohne Total bekommen sonst die Summe ihrer Positionen), gleiche Werkstatt und gleiches
  Datum wie die Vorseite bei anderem Betrag = Fortsetzung, andere Werkstatt = neue Rechnung.
- Eine Rechnung füllt nur leere Formularfelder (`fillEmptyFields`), mehrere (Sammel-PDF oder mehrere Fotos) erscheinen
  als Prüfliste (`buildBatch`): Duplikat = gleicher Betrag und Datum höchstens 14 Tage auseinander. Datum der Rechnung
  ist das Reparaturdatum, falls vorhanden.
- PDF-Upload: max 50 MB, OCR pro Seite, Duplikat-Erkennung bei identischen Seiten.
- Offline siehe AGENTS.md (`scanPending`, `useOfflineScanQueue`).
- Tests: E2E fängt Mistral mit `mockInvoiceScan` ab. Echter Test gegen Mistral mit den Sollwerten aus `testdateien/`
  (Schweizer Rechnung als PNG und PDF, Sammel-PDF; läuft überall mit `.env`) und zusätzlich mit Fotos und 9-Seiten-PDF
  aus `tmp/`, wo vorhanden: `npx playwright test e2e/invoice-scan-real.spec.ts --project=ai-soft`. Nach Änderungen an
  Prompts oder `mergePdfPages` mit `--repeat-each=3` laufen lassen, ein einzelner grüner Lauf beweist bei Mistral wenig.

## Nachkontrolle der Positionen
- `src/services/invoice-items.ts`, für Chat, Formular und Sammel-PDF: ergeben die Positionen mehr als das Total, werden
  aufeinanderfolgende Positionen mit gleichem Betrag zusammengefasst (typisch: mehrere Beschreibungszeilen unter einer
  Arbeitszeile), nur wenn die Summe danach passt. Bleibt die Summe zu hoch, zeigt das Formular einen Hinweis.
- Wartungen aus einer Rechnung: eine pro Kategorie (`maintenancesFromItems`).
- Regelbasierte Kategorie-Korrektur: Keywords überschreiben die AI-Zuordnung (z.B. "Auspuff" → auspuff), einzige Quelle
  `src/services/category-correction.ts` (Chat und Formular).
- `z.enum(MAINTENANCE_CATEGORIES)` erzwingt gültige Kategorien in den AI-Schemas.

## Fahrzeugausweis-Scan
- Im Formular «Neues Fahrzeug» und beim Bearbeiten (füllt nur leere Felder): `src/composables/useVehicleScan.ts`,
  Bereinigung in `src/services/vehicle-scan.ts`.
- Foto nicht pauschal hochkant drehen (`expectPortrait: false`, der Ausweis liegt quer). Der Prompt kennt die
  nummerierten Felder des Schweizer Ausweises (15 Schild, 21 Marke und Typ, 23 Fahrgestell-Nr., 36 1. Inverkehrsetzung).
- Test-Bild ist der gemeinfreie Ausweis von Wikimedia (`testdateien/README.md`).

## Chat und Tools
- Chat-Tools schreiben direkt in InstantDB, ohne REST-Schicht; Chat-Verlauf liegt in der Entität `chatmessages`.
- `sendChatMessage` gibt `{ text, toolResults? }` zurück, `ToolResultCard` zeigt sie als PrimeVue Panel.
- Schritte: `stepCountIs(5)`, bei PDFs mit vielen Seiten dynamisch höher.
- Mehr als 8 Bilder: der OCR-Text wird verwendet, die Bilder gehen nicht ans Vision-Modell.
- `scan_document` wird ausgeblendet, wenn Bilder in der Nachricht sind (das Modell sieht sie direkt).
- `add_maintenance`: Wartung OHNE Rechnung eintragen (z.B. manuell berichtete Arbeiten).
- UI: Kamera-Button (`capture="environment"`), Drag & Drop, Multi-PDF-Upload, Maximize mit 30/70 Split.
- Guard `claimsActionWithoutTool` (`src/services/chat-guard.ts`, reine Funktion mit Unit-Test) in `sendChatMessage`:
  behauptet das Modell «eingetragen» ohne Aufruf eines **schreibenden** Tools (`WRITE_TOOLS`; ein `list_vehicles` allein
  zählt nicht), wird einmal mit `toolChoice: 'required'` nachgefasst, und zwar nur im ersten Schritt (`prepareStep`): nach
  dem Tool-Ergebnis antwortet Mistral auf `tool_choice: "any"` nie. Muster: Partizip mit Hilfsverb, vor `:`/`.`/Ende, oder ✅.
- System-Prompt: keine wörtlichen Erfolgssätze als Beispiele, Mistral kopiert sie sonst ohne Tool-Aufruf (nur das Format beschreiben).

## AI SDK v6
- `inputSchema` (nicht `parameters`), `stopWhen: stepCountIs(n)` (nicht `maxSteps`).
- Tool-Ergebnisse in `tr.output` (nicht `tr.result`), `tr.toolName` für den Tool-Namen.
- Alle Modell-Aufrufe mit `temperature: 0` (Tool-Entscheidungen reproduzierbarer) und `maxRetries: 0`.
