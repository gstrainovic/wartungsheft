---
name: auswertungen-export
description: >
  Auswertungen und Exporte (Kosten, Fuhrpark, CSV, PDF-Dossier), Jahresabschluss als ZIP, Serviceheft für den Verkauf, Kostentabelle und Fremdwährungen. Use when an report.ts, pdf-report.ts, service-record.ts, year-export.ts, zip.ts, fx.ts, dem Tab «Kosten» oder der Fuhrpark-Tabelle gearbeitet wird.
---

## Auswertungen und Exporte
- `src/services/report.ts`: Kosten pro Jahr und Kategorie, Fuhrpark pro Fahrzeug und Jahr, CSV mit BOM und Semikolon
  für Excel de-CH, reine Funktionen.
- `src/services/pdf-report.ts` (jsPDF + jspdf-autotable): Dossier pro Fahrzeug mit Stammdaten, Wartungen, Kosten,
  Rechnungen; Fuhrpark-Übersicht = Übersichtsseite plus dieselben Abschnitte je Fahrzeug über `renderVehicle`.
- UI: Tab «Kosten» auf der Fahrzeugseite (CSV, PDF-Dossier), Fuhrpark-Tabelle auf dem Dashboard (CSV, PDF-Übersicht),
  Downloads über Blob-Links. E2E `report-export.spec.ts` und `fleet-costs.spec.ts` prüfen Tabellen und Dateien.

## Kostentabelle
- `total` ist der Rechnungsbetrag (brutto), Positionen sind oft netto; die Differenz erscheint als Kategorie
  `nicht_zugeordnet` («Nicht zugeordnet / MwSt.»), damit die Zeilen zur Total-Zeile addieren.

## Jahresabschluss
- `src/services/year-export.ts` baut CSV und Belegbilder eines Jahres, `src/services/zip.ts` packt sie ungepackt in ein
  ZIP (keine Abhängigkeit, Bilder sind schon komprimiert).

## Serviceheft für den Verkauf
- `buildServiceRecord` (`pdf-report.ts`) mit Kennzahlen aus `service-record.ts` (Zeitraum, Anzahl, Laufleistung,
  lückenlos ja/nein), Belegbildern als eigene Seiten und einer Schlussseite über Wartungsheft; Preise nur mit `withPrices`.

## Fremde Währungen
- `src/services/fx.ts` holt EZB-Referenzkurse zum Rechnungsdatum von `api.frankfurter.dev` (kein Schlüssel, Cache im
  localStorage) und rechnet in die Heimwährung aus den Einstellungen um (`settings.homeCurrency`, CHF oder EUR).
- Ohne Kurs bleibt die Rechnung in ihrer Währung, sichtbar als «nicht umgerechnet».
- In E2E-Tests die API mit `page.route` mocken, und zwar **vor** `clearInstantDB`, sonst holt das Dashboard beim
  Aufräumen den echten Kurs in den Cache.
