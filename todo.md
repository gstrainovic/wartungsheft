# todo.md

- [ ] **Beim nächsten Deploy Service-Worker-Update prüfen:** Der Fix (registerSW lädt neu, Update-Prüfung beim
      Zurückkehren) ist seit 11.10. live. In einem Browser mit installiertem Stand prüfen, dass schon die erste
      Navigation nach dem Deploy den neuen Stand zeigt.
Reihenfolge, nicht Themen. Erst produktiv verkaufen (Bestellung und Rechnung für Betriebe), dann messen
(business-plan/09-validierung.md), dann alles andere. Direktansprache ist erlaubt: E-Mails an Betriebe, Verbände
und Multiplikatoren, Forenbeiträge, alles, was zahlende Kunden bringt (Listen und Versand in `~/projects/wartungsplan`).

## Zuerst: mit echten Menschen testen

Bisher hat ein fremdes Konto die App benutzt (italienisch, Android): Fahrzeug per Formular angelegt, danach keine
Rechnung und keine Wartung erfasst. Werbung bleibt pausiert (Google, Bing), bis die groben
Stolperstellen behoben sind; sonst kosten Klicks Geld, die an der App scheitern.

### Vom Nutzer
- [ ] Fünf Nutzertests nach `../business/auto-service/nutzertest.md` mit Leuten aus dem Umfeld (drei Privathalter,
      zwei mit Firmenfahrzeugen), je rund 20 Minuten:
      lautes Denken, Bildschirm aufnehmen, nicht helfen. Persönlich oder per Mail fragen
- [ ] App-Texte in FR und IT (`src/texte/app/`) von je einer welschen und Tessiner Person gegenlesen lassen,
      besonders Fachbegriffe (expertise/collaudo, bouclement, train roulant) und Bestell- und Rechnungstexte

### Danach
- [ ] Befunde nach Schwere ordnen und beheben, die schweren vor jeder Werbung
- [ ] UX- oder Design-Profi nur, wenn die Tests zeigen, dass Optik oder Aufbau bremsen, dann gezielt für diese Stellen
- [ ] Werbung wieder einschalten (`ads enable`, `bing enable`, IDs in `business-plan/05-go-to-market.md` Kanal 5)

## Jetzt: produktiv gehen

### Vom Nutzer
- [ ] Auslöser für den nächsten Punkt ist die erste Anmeldung (Mail «Wartungsheft: neue Anmeldung» an
      info@wartungsheft.ch, täglich 07:00 UTC)
- [ ] Geschäftskonto mit QR-IBAN und camt.054 eröffnen: `../business/geschaeftskonten-vergleich.md`. Bis dahin stellt
      der Proxy QR-Rechnungen auf Gorans Swissquote-IBAN (SCOR-Referenz); danach `INVOICE_IBAN` in der `.env` des
      AI-Proxys auf der Instanz tauschen, nicht ins Repo. Beide Konten gehören Goran, Kunden brauchen keinen Hinweis.
- [ ] Muster-QR-Rechnung (Swissquote-IBAN, SCOR-Referenz) vor der ersten echten Bestellung mit der Banking-App
      scannen: Betrag, Referenz und Empfänger müssen stimmen (bisher nicht mit einem Bankprogramm geprüft)

### Von Claude
- [ ] Sobald das Geschäftskonto camt.054 liefert: Zahlungseingänge regelmässig mit `billing.mjs camt <datei.xml>`
      buchen (Abruf der Datei und Platz im Tagescheck festlegen)
- [ ] Fahrzeuggrenze wirklich sperren, sobald ein Zahlungsweg existiert: `vehicleLimit` meldet heute nur, solange
      `VITE_BILLING_ENABLED=true` gesetzt ist; ohne Kaufweg wäre eine Sperre bloss ein Ärgernis
- [ ] Fällt der Health-Workflow durch, ohne dass etwas kaputt ist (Wartungsfenster, kurzer Netzaussetzer), die
      Schwelle anheben: erst nach zwei Fehlläufen hintereinander mailen

### Ab 25.09.2026
- [ ] Kleininserat: Bestätigung des Verlags abwarten, ab Erscheinen `/tcs` auswerten: `business-plan/05-go-to-market.md` «Versuch: Kleininserat im TCS-Magazin»

### Google Play
- [ ] App in Google Play: `business-plan/05-go-to-market.md` «Kanal: Google Play»

### Marketing-Video
- [ ] **Alle Filme auf YouTube**, sobald Goran die deutschen Fassungen auf wartungsheft.ch durchgesehen hat (nur zum
      Gefundenwerden, kein Link von den Seiten): `video-out/youtube-<name>.mp4` mit SRT je Sprache, die vier alten
      deutschen Fassungen vom 30.09. ersetzen.
- [ ] Sprechertexte FR, IT, EN von Muttersprachlern prüfen lassen (`video-scripts/sprechertexte.md`, letzter
      Abschnitt); geänderte Sätze kosten neue Credits, das ElevenLabs-Abo läuft bis 04.11.2026
- [ ] Kurzfassungen für Social veröffentlichen: `video-out/social-<name>.mp4` (je rund 20 Sekunden, 1080×1920) beim
      ersten Beitrag oder der ersten Anzeige einsetzen

### Auffindbar, wenn jemand eine KI fragt

Text, Metadaten, `robots.txt`, `sitemap.xml` und `llms.txt` stehen (Skill `app-hilfe`, Abschnitt «Hilfe und Auffindbarkeit»).
Google über die Search Console, Bing über die Bing Webmaster Tools (Import aus der Search Console, Sitemap
eingereicht) und IndexNow (`npm run indexnow`), search.ch per Add-URL. Einstiegsseiten und Ratgeber sind fertiges HTML.

- [ ] Einträge in Schweizer Verzeichnissen (`business-plan/verzeichnisse.md`): Nutzer meldet sich je
      Plattform an, Claude füllt das Formular aus den fertigen Texten und sendet nach Freigabe ab
- [ ] **Deutsche Ratgeber nicht im Index:** `gsc inspect` meldet für `/ratgeber/mfk-aufgebot` und
      `/ratgeber/wartungsintervalle` «Gecrawlt – zurzeit nicht indexiert», für `/ratgeber/serviceheft-verloren`
      «Gefunden – zurzeit nicht indexiert»; die englische und italienische Fassung bekommen dagegen Impressionen.
      Kanonisch und hreflang stimmen, der Text hat rund 1000 Wörter. Ursache klären (Vermutung: junge Domain, deutsche
      Seiten gegen starke Konkurrenz zu dünn oder zu ähnlich), bevor weitere deutsche Ratgeber geschrieben werden.
      Entscheid Goran, ab 14.10. (nach dem Reset des Wochenlimits): je Ratgeber Text mit den Top-Treffern bei Google
      vergleichen, nachbessern und in der Search Console «Indexierung beantragen» (geht nur in der Oberfläche)
- [ ] **Ratgeber billig schreiben:** `scripts/exa-recherche.py SLUG "Anfrage" …` speichert Exa-Ausschnitte in
      `content/recherche/`. Goran prüft `content/recherche/serviceheft-vorlage{,-fr,-it}.md` (Thema «serviceheft auto
      pdf», Platz 10). Ab 14.10.: Ratgeber auf FR, IT und EN (DE erst nach Klärung des Index), Entwurf durch einen
      Haiku-Subagenten aus der Recherche, Claude prüft Fakten und Ton. Mistral-Guthaben bleibt für Interessenten.
      Mehrwert gegen die Konkurrenz (französische und italienische PDF-Vorlagen ohne Schweizbezug): eigene
      Vorlage als PDF mit Schweizer Begriffen (MFK/expertise/collaudo)
- [ ] Offene Frage 6: übersetzte Ratgeber-URLs (`/fr/ratgeber/carnet-entretien` statt deutschem Slug). Heute ist der
      Dateiname der Slug und verbindet die Sprachfassungen (`vite.config.ts`, `ratgeberPlugin`); übersetzte Slugs
      brauchen einen eigenen Schlüssel je Artikel, bestehende URLs eine 301-Weiterleitung
- [ ] **MFK-Ratgeber ausbauen** (Keyword-Planer, Schweiz Deutsch, Suchen/Monat, alle Wettbewerb tief): «mfk termin»
      210, «mfk kosten» 170, «mfk verschieben» 110, «mfk vorbereitung» 110, «mfk checkliste» 50. Heute steht
      `content/ratgeber/mfk-aufgebot.md` für «mfk kosten» und «mfk check» auf Platz 58 bis 78. Abschnitte (oder eigene
      Seiten) zu Termin, Verschieben, Kosten je Kanton und Checkliste, in allen vier Sprachen
- [ ] **«servicebuch auto» nach oben bringen:** 2400 Suchen/Monat, Wettbewerb tief, Platz 9,7 bei nur 9 Impressionen in
      90 Tagen. Steht schon im Titel der Startseite; Ratgeber «Serviceheft verloren» und «Occasion verkaufen» intern
      auf die Startseite mit Ankertext «Servicebuch» verlinken und die Platzierung nach vier Wochen mit
      `gsc queries --days 28` prüfen

### Messen, nebenbei
- [ ] Wöchentlich Zahlen ziehen (Caddy-Log, `events`, Anmeldungen, Bestellungen, Postfach, README Abschnitt 6) und in
      Kapitel 9 notieren, dazu die Tabelle Suchmaschinen und KI-Antworten («Was ist wartungsheft.ch?»); nach drei
      Monaten Auswertung gegen die Abbruchkriterien
- [ ] Beobachten (M1) ergänzen: Schweizer KMU-Stimmen (Gewerbeverbände, LinkedIn-Gruppen); Erstfassung steht in
      `business-plan/beobachtungen.md`

## Sobald über die Schweiz hinaus verkauft wird (DACH oder global)

Sprache (DE, FR, IT, EN) und Format je Sprache sind wählbar (Skill `texte-und-sprachen`); Währung (CHF als Standard)
und Kilometer sind fest im Code. Vor dem ersten Kunden ausserhalb der Schweiz:
- [ ] Deploy-Standards pro Installation: Währung, Zahlen- und Datumsformat, Kilometer/Meilen als Konfiguration (`VITE_*` oder Server-Einstellung), nicht als Konstante
- [ ] Nutzer-Einstellungen im Profil: Formate (heute an die Sprache gebunden, de-CH-Format auch für fr/it) überschreiben die Deploy-Standards; Rechnungen behalten ihre Original-Währung
- [ ] Mail mit dem Anmelde-Code kommt deutsch (Vorlage des InstantDB-Servers): je Sprache, falls der Server das kann
- [ ] Preise und Pläne pro Land (`plans.ts`): Währung, MWST-Hinweis, Zahlungsanbieter je Region (Kapitel 4 und 6 im Businessplan: EU-Privatkunden nur mit OSS-Registrierung oder Merchant of Record)

## Nach dem Entscheid

Bei bestätigter Kleinbetriebs-Hypothese (H1):
- [ ] Mehrere Nutzer pro Konto (Fahrer wirft Rechnung ein, Inhaber sieht alles)

Bei bestätigter Privathalter-Hypothese (H2):
- [ ] Jahresabo 25 CHF per QR-Rechnung an die angemeldeten Nutzer nach der Testzeit, Kanäle aus Kapitel 5

Kartenzahlung, erst wenn die QR-Rechnung nicht mehr reicht; nur als einmalige Zahlung pro Jahr, keine Kartenabos mit
automatischer Abbuchung (`~/projects/find-jobs/akquise/abo-regeln.md`; Abwägung und Preise in business-plan/04):
- [ ] Kartenanbieter wählen (Payrexx oder Stripe)
- [ ] Konto beim gewählten Anbieter anlegen, verifizieren, Testmodus, API-Key und Webhook-Secret notieren
- [ ] ai-proxy: austauschbare Billing-Schnittstelle, gewählten Anbieter als einmalige Jahreszahlung anbinden (Stripe
      Checkout ohne `mode: 'subscription'`, Payrexx Gateway ohne Abo); die Zahlung trägt das Jahr ein wie `paid`; Tests
      gegen dokumentierte Payloads
- [ ] App anbinden, Checkout im Testmodus durchspielen
- [ ] Preise je Plan beim Anbieter hinterlegen (`privat` 25 CHF im Jahr, `betrieb` 36 CHF pro Fahrzeug und Jahr mit Menge)
- [ ] Datenschutzerklärung: gewählten Anbieter ergänzen
- [ ] Settings: nach Rückkehr vom Checkout Nutzung neu laden und Toast zeigen
- [ ] Limit-Meldung im Chat mit Link zu den Einstellungen statt nur Text

## Geparkt

- [ ] InstantDB-Client auf 1.x heben (`@instantdb/core` + `@instantdb/admin` auf 0.22.121 gepinnt, lokaler Server-Checkout `~/instant` vom 02.02.2026; Produktion läuft schon mit Server-Image `latest`). Erst lokalen Server aktualisieren, dann beide Pakete gemeinsam, dann E2E + `npm run test:unit`. Nicht während eines laufenden Pilots.
