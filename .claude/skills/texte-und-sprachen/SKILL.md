---
name: texte-und-sprachen
description: >
  Sprachen der öffentlichen Seiten (de ohne Präfix, /fr, /it, /en), Übersetzungen, Texte der Landing Pages und der Hauptknopf. Use when Texte in src/texte/, Ratgeber, Landing Pages, Rechtstexte, sprache.ts, page-meta.ts, hreflang oder UI-Texte geändert oder übersetzt werden.
---

## Sprachen der öffentlichen Seiten
- Öffentlich sind Landing Pages, Hilfe, Rechtstexte, Login und Ratgeber. Deutsch ohne Präfix, damit bestehende Links
  gelten, Französisch, Italienisch und Englisch unter `/fr`, `/it`, `/en` mit denselben Pfaden (`src/lib/sprache.ts`,
  der Router legt jede öffentliche Route pro Präfix an, `page-meta.ts` setzt `lang`, canonical und hreflang mit
  x-default Deutsch).
- Die App hinter der Anmeldung bleibt deutsch, der Fuss der Übersetzungen sagt das. App-Knöpfe in übersetzten Texten
  deutsch mit Übersetzung in Klammern.
- Texte in `src/texte/<seite>.ts` (je Sprache ein Objekt gleicher Form, `useSprache(texte)`), lange Seiten als
  `src/texte/<seite>/<fr|it|en>.vue` neben dem deutschen Inhalt der Seite, Ratgeber unter `content/ratgeber/<fr|it|en>/`.
- Jede Änderung an einem deutschen Text geht im selben Commit in alle drei Übersetzungen. `src/texte/texte.test.ts`
  prüft Form, Gliederung und Links, `e2e/languages.spec.ts` Sprache, Links und 390px.
- Rechtstexte verweisen auf die massgebende deutsche Fassung. Anrede fr «vous», it «tu», en «you».

## Texte und Hauptknopf
- Hauptknopf überall «30 Tage gratis testen» (führt zum Login, der Klick zählt in `events` über `useEventsStore`).
- Kein Lead-Formular: Fragen gehen per mailto an `info@wartungsheft.ch` (Footer aller Landing Pages, auf `/betrieb`
  zusätzlich unter dem Knopf mit Betreff).
- Kein Pilotangebot, keine Einrichtung vor Ort. Du-Form auch für Betriebe, bewusst.
- Persona-Durchgänge (Neulenker, Rentner, CEO, Fahrer) mit Screenshots auf 390px, bevor UI-Texte als fertig gelten.
