# todo.md

- [ ] **Service Worker aktualisiert sich nicht:** Ein Browser mit altem SW (Bundle index-D7ygi0QE) blieb über drei Deploys hinweg auf dem alten Stand, obwohl `registerType: 'autoUpdate'` gesetzt ist und Caddy `sw.js` mit `max-age=0, must-revalidate` liefert; `registration.update()` fand keinen neuen SW, erst Unregister plus Cache-Löschen half. Folge: bestehende Nutzer sehen neue Routen (etwa `/anlagen`) nicht und landen auf `/login`. Ursache finden (Precache-Manifest, `clientsClaim`/`skipWaiting`, Update-Prüfung bei Navigation) und mit zwei Deploys nachweisen, dass ein installierter Browser den zweiten Stand ohne manuelles Eingreifen bekommt.
Reihenfolge, nicht Themen. Erst produktiv verkaufen (Bestellung und Rechnung für Betriebe), dann messen
(business-plan/09-validierung.md), dann alles andere. Direktansprache ist erlaubt: E-Mails an Betriebe, Verbände
und Multiplikatoren, Forenbeiträge, alles, was zahlende Kunden bringt (Listen und Versand in `~/projects/wartungsplan`).

## Zuerst: mit echten Menschen testen

Bisher hat niemand ausser dem Entwickler die App benutzt. Werbung bleibt pausiert (Google, Bing), bis die groben
Stolperstellen behoben sind; sonst kosten Klicks Geld, die an der App scheitern.

### Vom Nutzer
- [ ] Fünf Nutzertests nach `../business/auto-service/nutzertest.md` mit Leuten aus dem Umfeld (drei Privathalter,
      zwei mit Firmenfahrzeugen), je rund 20 Minuten:
      lautes Denken, Bildschirm aufnehmen, nicht helfen. Persönlich oder per Mail fragen

### Danach
- [ ] Befunde nach Schwere ordnen und beheben, die schweren vor jeder Werbung
- [ ] UX- oder Design-Profi nur, wenn die Tests zeigen, dass Optik oder Aufbau bremsen, dann gezielt für diese Stellen
- [ ] Werbung wieder einschalten (`ads enable`, `bing enable`, IDs in `business-plan/05-go-to-market.md` Kanal 5)

## Jetzt: produktiv gehen

### Vom Nutzer
- [ ] Auslöser für den nächsten Punkt ist die erste Anmeldung (Mail «Wartungsheft: neue Anmeldung» an
      info@wartungsheft.ch, täglich 07:00 UTC)
- [ ] Geschäftskonto mit QR-IBAN und camt.054 eröffnen: `../business/geschaeftskonten-vergleich.md`. IBAN danach in
      die `.env` des AI-Proxys auf der Instanz, nicht ins Repo

### Von Claude
- [ ] QR-Rechnung einschalten, sobald die IBAN da ist: `deploy/.env` um `INVOICE_IBAN` und die übrigen `INVOICE_*`
      ergänzen, Proxy neu bauen, Testbestellung mit eigener Adresse, PDF gegen den SIX-Validator prüfen, danach stornieren
- [ ] Tagescheck um `billing.mjs open` ergänzen: überfällige Rechnungen melden, Zahlungseingänge mit
      `camt <datei.xml>` aus dem heruntergeladenen camt.054 buchen
- [ ] Fahrzeuggrenze wirklich sperren, sobald ein Zahlungsweg existiert: `vehicleLimit` meldet heute nur, solange
      `VITE_BILLING_ENABLED=true` gesetzt ist; ohne Kaufweg wäre eine Sperre bloss ein Ärgernis
- [ ] Fällt der Health-Workflow durch, ohne dass etwas kaputt ist (Wartungsfenster, kurzer Netzaussetzer), die
      Schwelle anheben: erst nach zwei Fehlläufen hintereinander mailen

### Ab 25.09.2026
- [ ] Kleininserat: Bestätigung des Verlags abwarten, ab Erscheinen `/tcs` auswerten: `business-plan/05-go-to-market.md` «Versuch: Kleininserat im TCS-Magazin»

### Google Play
- [ ] App in Google Play: `business-plan/05-go-to-market.md` «Kanal: Google Play»

### Marketing-Video
- [ ] **Filme je Sprache (DE, FR, IT, EN), YouTube mit eigener Untertitelspur.** Heute gibt es nur die deutschen Filme
      mit eingebrannten Untertiteln; auf YouTube (Kanal strainovic-it) sind bei allen vier Filmen die automatischen
      Untertitel abgeschaltet, damit sie nicht doppelt erscheinen. Ziel:
      - Voraussetzung: die im Film gezeigten App-Seiten (Dashboard, Fahrzeug, Rechnung, Chat) sprechen FR, IT und EN;
        heute ist nur die Landing-Seite übersetzt (`useSprache`), siehe «Sobald über die Schweiz hinaus verkauft wird»
      - je Sprache eigene Aufnahme (`npm run video`, Oberfläche in dieser Sprache), eigene Sprecherstimme und eigener
        Sprechertext in `video-scripts/`
      - Querformate ohne eingebrannte Untertitel bauen, `video-build.sh` schreibt dazu je Film eine SRT-Datei, die als
        Untertitelspur hochgeladen wird; Shorts behalten eingebrannte Untertitel
      - hochladen mit Titel und Beschreibung je Sprache, die bisherigen deutschen Querformate
        (gVyuTsk_LrI, CypEsJgVRC8) und Shorts ersetzen und löschen
      - `LandingVideo.vue` zeigt Film und YouTube-Link in der Sprache der Seite; der Hinweis «auf Deutsch» fällt weg.
        Der YouTube-Link liegt schon im Branch `youtube-link` (Tabelle `YOUTUBE`, Test in `landing-pages.spec.ts`),
        dort die IDs je Sprache nachtragen, dann nach `master`
- [ ] Kurzfassungen für Social veröffentlichen: `video-out/social-privat.webm` und `social-betrieb.webm` (je gut
      10 Sekunden) beim ersten Beitrag oder der ersten Anzeige einsetzen

### Auffindbar, wenn jemand eine KI fragt

Text, Metadaten, `robots.txt`, `sitemap.xml` und `llms.txt` stehen (Skill `app-hilfe`, Abschnitt «Hilfe und Auffindbarkeit»).
Google über die Search Console, Bing über die Bing Webmaster Tools (Import aus der Search Console, Sitemap
eingereicht) und IndexNow (`npm run indexnow`), search.ch per Add-URL. Einstiegsseiten und Ratgeber sind fertiges HTML.

- [ ] Einträge in Schweizer Verzeichnissen (`business-plan/verzeichnisse.md`): Nutzer meldet sich je
      Plattform an, Claude füllt das Formular aus den fertigen Texten und sendet nach Freigabe ab

### Messen, nebenbei
- [ ] Wöchentlich Zahlen ziehen (Caddy-Log, `events`, Anmeldungen, Bestellungen, Postfach, README Abschnitt 6) und in
      Kapitel 9 notieren, dazu die Tabelle Suchmaschinen und KI-Antworten («Was ist wartungsheft.ch?»); nach drei
      Monaten Auswertung gegen die Abbruchkriterien
- [ ] Beobachten (M1) ergänzen: Schweizer KMU-Stimmen (Gewerbeverbände, LinkedIn-Gruppen); Erstfassung steht in
      `business-plan/beobachtungen.md`

## Sobald über die Schweiz hinaus verkauft wird (DACH oder global)

Heute sind Währung (CHF), Zahlenformat (de-CH, `src/lib/locale.ts`) und Sprache (Deutsch) fest im Code. Vor dem ersten Kunden ausserhalb der Schweiz:
- [ ] Deploy-Standards pro Installation: Währung, Sprache, Zahlen- und Datumsformat, Kilometer/Meilen als Konfiguration (`VITE_*` oder Server-Einstellung), nicht als Konstante
- [ ] Nutzer-Einstellungen im Profil: eigene Währung, Sprache und Formate überschreiben die Deploy-Standards; Rechnungen behalten ihre Original-Währung
- [ ] Texte über i18n (vue-i18n oder gleichwertig), DE zuerst, EN als zweite Sprache; Landing Pages und Datenschutz je Sprache
- [ ] Preise und Pläne pro Land (`plans.ts`): Währung, MWST-Hinweis, Zahlungsanbieter je Region (Kapitel 4 und 6 im Businessplan: EU-Privatkunden nur mit OSS-Registrierung oder Merchant of Record)

## Nach dem Entscheid

Bei bestätigter Kleinbetriebs-Hypothese (H1):
- [ ] Mehrere Nutzer pro Konto (Fahrer wirft Rechnung ein, Inhaber sieht alles)

Bei bestätigter Privathalter-Hypothese (H2):
- [ ] Jahresabo 25 CHF per QR-Rechnung an die angemeldeten Nutzer nach der Testzeit, Kanäle aus Kapitel 5

Kartenzahlung, erst wenn die QR-Rechnung nicht mehr reicht (z. B. ein Kunde will monatlich per Karte zahlen; Abwägung und Preise in business-plan/04):
- [ ] Kartenanbieter wählen (Payrexx oder Stripe)
- [ ] Konto beim gewählten Anbieter anlegen, verifizieren, Testmodus, API-Key und Webhook-Secret notieren
- [ ] ai-proxy: austauschbare Billing-Schnittstelle, gewählten Anbieter anbinden (bei Payrexx: Gateway mit subscriptionState, Webhook X-Webhook-Signature HMAC-SHA256 hex, Status active/overdue/failed/cancelled/in_notice, Kundenportal POST /AuthToken, Kündigen DELETE /Subscription/{id}); Tests gegen dokumentierte Payloads
- [ ] App anbinden, Checkout und Kündigung im Testmodus durchspielen
- [ ] Preise je Plan beim Anbieter hinterlegen (`privat` 25 CHF im Jahr, `betrieb` 36 CHF pro Fahrzeug und Jahr mit Menge)
- [ ] Datenschutzerklärung: gewählten Anbieter ergänzen
- [ ] Settings: "Abo verwalten"-Button (`POST /billing/portal`), nach Rückkehr vom Checkout Nutzung neu laden und Toast zeigen
- [ ] Limit-Meldung im Chat mit Link zu den Einstellungen statt nur Text

## Geparkt

- [ ] InstantDB-Client auf 1.x heben (`@instantdb/core` + `@instantdb/admin` auf 0.22.121 gepinnt, lokaler Server-Checkout `~/instant` vom 02.02.2026; Produktion läuft schon mit Server-Image `latest`). Erst lokalen Server aktualisieren, dann beide Pakete gemeinsam, dann E2E + `npm run test:unit`. Nicht während eines laufenden Pilots.
