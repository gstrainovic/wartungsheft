---
name: wartungsplan
description: >
  Fälligkeit und Wartungsplan, Fahrzeugseite mit Tabs, Einrichtung (SetupChecklist), Serviceheft-Scan und E-Mail-Erinnerungen. Use when an maintenance-schedule.ts, dueForVehicle, fleetDueList, VehicleDetailPage, SetupChecklist, vehicle-setup.ts, ServiceBookDialog, service-book.ts, reminders.ts oder signup-notice.ts gearbeitet wird.
---

## Fälligkeit (`src/services/maintenance-schedule.ts`)
- Pro Typ zählt nur der neueste Eintrag mit `status === 'done'`. Status `unknown` (nie erfasst, neutral), `due`
  (30 Tage oder 1'000 km vor dem Termin), `overdue`, `done`. Datumsrechnung ohne `Date`-Zeitzonen (`addMonths` mit
  Tagesklammerung).
- Dashboard und Fahrzeugkarte rechnen live aus `useMaintenancesStore`; `fleetDueList` (Fälligkeitsliste oben im
  Dashboard), `dueDescription` («fällig seit …»), `vehicleDueStatus` (Karte, `unknown` = «Noch keine Wartung erfasst»).
  Deep-Link `/dashboard#fahrzeug-<id>`.
- Fälligkeiten pro Fahrzeug immer über `dueForVehicle`, Status-Darstellung über `DUE_STATUS_VIEW` (beide
  `maintenance-schedule.ts`, auch im Dashboard).
- Status «Geplant» (gespeichert als `due`) ist ein vereinbarter Termin: über `plannedMaintenances` wird daraus
  `plannedAt` (nächster Termin in der Zukunft), die Erinnerung lässt solche Arbeiten aus.
- Jeder Plan-Eintrag hat einen eigenen `key` (Art plus Bezeichnung); kommt eine Art mehrfach vor (Getriebeöl und
  Differentialöl als `sonstiges`), entscheidet die Beschreibung der Wartung, zu welchem Eintrag sie gehört.

## Fahrzeugseite
- Tabs Wartungsplan (Standard), Verlauf (erfasste Wartungen), Rechnungen, Kosten; auf 390px passen die vier Tabs nur
  mit den kurzen Namen und der Handy-Schrift aus `VehicleDetailPage.vue`.
- Ein Weg pro Aufgabe: «wann zuletzt» fragt jede Zeile des Wartungsplans selbst («Eintragen», Vorbelegung
  `doneFormInitial`: nie erfasst = Datum leer, sonst heute; Bezeichnung des Plans als Beschreibung), neue Arbeiten über
  «Wartung hinzufügen» im Verlauf.
- Verkauft oder abgegeben statt gelöscht (`src/services/vehicle-status.ts`): `soldAt` und `soldMileage` am Fahrzeug,
  `activeVehicles` filtert Dashboard, Karten und Erinnerungen, Kosten und Exporte enthalten das Fahrzeug weiter.

## Einrichtung statt Wizard
- «Fahrzeug speichern» führt auf die Fahrzeugseite, dort `SetupChecklist.vue` mit den Schritten aus
  `src/services/vehicle-setup.ts` (Fahrzeugausweis, Serviceheft, letzte Wartungen, Rechnungen).
- Haken folgen aus den Daten, nicht aus Klicks; der erste offene Schritt ist der Hauptknopf, jeder ist überspringbar,
  «Ausblenden» setzt `setupHidden` am Fahrzeug.

## Serviceheft ohne Chat
- `ServiceBookDialog.vue` (Wartungsplan «Serviceheft fotografieren», Checkliste, Dashboard-Hinweis) mit
  `useServiceBookScan` (Fotos oder PDF) und reiner Logik in `src/services/service-book.ts` (Intervall-Zeilen,
  Hersteller-Intervalle einmischen, Stempel als Vorschläge mit Duplikatprüfung 14 Tage). Speichert `customSchedule` komplett.

## E-Mail-Erinnerungen
- Reine Logik in `src/services/reminders.ts` (pro Nutzer eine Mail mit `due`/`overdue`, Schlüssel gegen Wiederholung,
  30 Tage), Server-Job `scripts/reminders.ts` (Admin-API + Resend, gebündelt nach `deploy/reminders.mjs`, Cron auf der
  Instanz, README «7. E-Mail-Erinnerungen»).
- Nutzer-Schalter im Store `src/stores/reminders.ts` (Entität `settings`, ein Dokument pro `creatorId`, fehlt = eingeschaltet).
- Derselbe Job meldet neue Anmeldungen an `info@wartungsheft.ch` (`src/services/signup-notice.ts`, Merker
  `settings.signupNoticeAt`) und verschickt die Testzeit-Mail (Skill `abo-rechnung`).
