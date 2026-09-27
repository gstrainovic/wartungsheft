---
name: abo-rechnung
description: >
  Abo, Testzeit, Kaufweg, Jahresabo auf QR-Rechnung, AGB, Konto löschen sowie Bank und Zahlungsabgleich (PostFinance, camt.054). Use when an trial.ts, trialNotice, OrderDialog, /billing/*, invoice-*.ts, scripts/billing.ts, AgbPage, account-delete.ts, camt.ts oder der PostFinance-Testplattform gearbeitet wird.
---

## Zahlungsweg
- Zuerst QR-Rechnungen für Schweizer Kunden (Jahresabo auf Rechnung). Ob später Payrexx oder Stripe für Kartenzahlung
  dazukommt, ist offen. ai-proxy `billing.ts` enthält eine optionale Stripe-Anbindung (README «4. Stripe»).

## Abo und Testzeit
- Kein Gratis-Plan. Ohne Abo läuft eine Testzeit von 30 Tagen mit allen Funktionen und dem Kontingent des Privatplans
  (ai-proxy `trial.ts`, Beginn beim ersten Aufruf, Subscription mit `status: 'trial'`); danach antworten Scan und Chat
  mit 402 `trial_expired`, Lesen, Erfassen von Hand und Exporte bleiben frei.
- In der letzten Woche der Testzeit steht auf dem Dashboard ein Hinweis (`trialNotice`), sieben Tage vor Schluss geht
  eine Mail raus (`buildTrialReminders`, beide `src/services/trial-reminder.ts`, Versand im Job `scripts/reminders.ts`,
  ein Merker `lastTrialNoticeKey` je Testzeit).
- Preise in `yearlyPriceChf(n, audience)` (privat 25 CHF bis 5 Fahrzeuge, Betrieb 36 CHF pro Fahrzeug),
  `PriceTable.vue` mit Umschalter Privat/Betrieb rechnet damit; Fair-Use-Bremse 20 Anfragen pro Minute im Proxy (`rate-limit.ts`).

## Kaufweg
- `/me/usage` meldet `ordering`, sobald der Proxy Rechnungen ausstellt. Mit `INVOICE_IBAN` erzeugt und verschickt er
  die QR-Rechnung selbst; ohne IBAN, aber mit Postfach (`INVOICE_EMAIL`, ersatzweise `FEEDBACK_TO`), legt er das Abo
  gleich an (Nummer, SCOR-Referenz) und schickt nur den Auftrag «Rechnung schreiben» an `info@wartungsheft.ch`
  (ai-proxy `invoice-request.ts`, Antwort `manual: true`); Verlängerung und Storno ebenso.
- So läuft die Produktion, bis das Geschäftskonto da ist, und so laufen die E2E-Tests. Ohne beides zeigt die App weder
  Bestellknopf noch Testzeit-Hinweis.

## Jahresabo auf Rechnung (privat und Betriebe)
- `OrderDialog.vue` in den Einstellungen mit Umschalter Privat/Betrieb: privat ohne Firmenfeld, `Order.audience` steuert
  Pflichtfelder, Preis, Plan und die Texte auf Rechnung und Mail; die Zielgruppe steht am Abo und gilt bei jeder
  Verlängerung. Prüfung mit `parseOrder` aus `@strainovic/ai-proxy/invoice`, dieselbe wie im Proxy.
- Proxy `/billing/order|cancel|resume` erzeugt die QR-Rechnung (Regeln in ai-proxy `invoice-subscription.ts`,
  README «8. Jahresabo auf Rechnung»).
- Täglicher Job `scripts/billing.ts` zählt Fahrzeuge und ruft `/billing/renew`, `paid <Referenz>` trägt Zahlungen ein;
  beide internen Endpunkte nur mit `AI_PROXY_INTERNAL_TOKEN`.
- Absender «Goran Strainovic, Strainovic IT» (Einzelfirma ohne Handelsregister, darum der Name des Inhabers), ohne MWST.
- Frontend-Code aus dem ai-proxy läuft mit `lib` ES2020: kein `replaceAll`, kein `.at()`.

## AGB
- `/agb` (`AgbPage.vue`, Footer und Bestelldialog verlinken sie) gibt die Regeln aus `trial.ts`,
  `invoice-subscription.ts` und `plans.ts` wieder. Wer dort Testzeit, Fristen oder Preise ändert, passt die AGB mit an
  und kündigt die Änderung den Kunden 30 Tage vorher per Mail an (AGB Ziffer 13).

## Konto löschen
- Einstellungen, Karte «Konto», AGB Ziffer «Deine Daten»: `deleteWholeAccount` in `src/services/account-delete.ts`
  löscht erst die eigenen Entitäten (`OWNED_ENTITIES`) über den Client, dann ruft `deleteAccount` den Proxy
  `POST /me/delete` (Verbrauch, Testzeit, Login per Admin-SDK; ein Abo mit gestellten Rechnungen bleibt gekündigt als
  Beleg, `retireSubscription`).
- Reihenfolge fest: nach dem Login wäre keine Transaktion mehr möglich. Danach `signOut`, `forgetKnownAccount`,
  Startseite. Nur online.

## Bank und Zahlungseingänge: PostFinance
Geschäftskonto ist PostFinance. Auswahl, Marktvergleich und die technische Prüfung stehen in
`../business/geschaeftskonten-vergleich.md`, die Feldbelegung von camt.054 dort im Abschnitt «camt.054: Felder für den
eigenen Zahlungsabgleich». Bankdokument als Kopie in `../business/sgkb-cash-management-handbuch.pdf`.

- **Zahlungsabgleich über die Referenz**: Die Jahresrechnungen tragen eine QR- oder SCOR-Referenz aus
  `invoiceReference` (ai-proxy `src/invoice.ts`). Dieselbe Referenz steht im camt.054 unter
  `RmtInf/Strd/CdtrRefInf/Ref` und ist der Schlüssel für `markInvoicePaid`.
- **camt.054 einlesen**: Parser in ai-proxy `src/camt.ts` (`parseCamt054`, fast-xml-parser, reine Funktion),
  Zuordnung in `src/services/billing-job.ts` (`matchCredits`), Aufruf `billing.mjs camt <datei.xml> [--dry-run]`
  (README «8.»). Iteriert wird über `NtryDtls/TxDtls`, nicht über `Ntry`: ein Tag mit mehreren Zahlungen kommt als
  eine Sammelbuchung. Das Buchungsdatum steht als `Ntry/BookgDt/Dt` am Eintrag, nicht an der Zahlung.
  `markInvoicePaid` bucht nur den vollen Betrag und lehnt eine schon verbuchte `AcctSvcrRef` ab; der Endpunkt
  `/billing/paid` antwortet darauf mit 409, auf eine unbekannte Referenz mit 404.
- **Strasse und Hausnummer getrennt im QR-Zahlteil**: `splitStreet` (ai-proxy `src/invoice.ts`) zerlegt die eine
  Adresszeile aus Bestellung und Absender in `address` und `buildingNumber` (`qrBillData` in `invoice-pdf.ts`).
  Ohne Trennung erfasst die Post Einzahlungen am Schalter kostenpflichtig nach. Postfachzeilen bleiben ganz, die
  Zahl dahinter ist die Fachnummer.
- **Eine QR-Einzahlung hat keinen `Dbtr`**: Der Zahler steht dann nur unter `RltdPties/UltmtDbtr`, der Parser fällt
  darauf zurück. `AddtlRmtInf` kommt mehrfach, PostFinance stellt eigene Statusmeldungen (`?REJECT?0`, `?ERROR?000`)
  vor die Mitteilung des Zahlers; Zeilen mit `?` fallen weg. Gebühren (`Chrgs`) mindern den Betrag nicht.
- **Testen ohne Konto**: Die PostFinance-Testplattform (isotest.postfinance.ch, Benutzer `gst`, Passwort im
  Passwortmanager, Mails an `info@strainovic-it.ch`, lesbar mit `mailbox strainovic`) simuliert die ganze Kette.
  Eingerichtet sind Produktangebot 2 (ISO 2019, camt V08), Konto `CH2909000000250094239` in CHF mit festem Saldo und
  das virtuelle Konto QRR `CH7730000001250094239`; Avisierung: camt.054 getrennt je virtuellem Konto, Sammelbuchung,
  SCOR eingeschlossen. Ablauf: QR-Rechnung mit `renderInvoicePdf` auf die QR-IBAN erzeugen, unter «QR-Rechnung →
  QR-Rechnung verarbeiten» hochladen, **Kredit erzeugen** (Kreditorverarbeitung = Zahlungseingang), ZIP
  herunterladen. Neue Parser-Arbeit wird dort belegt, nicht am Produktivkonto.
- **Fixtures** (`ai-proxy/src/fixtures/`): `camt054-testplattform-qrr.xml` ist die Antwort der Testplattform auf eine
  echte Wartungsheft-Rechnung und die Messlatte. `camt054-postfinance-muster.xml` ist die Musterdatei von PostFinance
  (Gutschrift ohne Referenz). `camt054-qrr.xml` ist nachgebaut und deckt ab, was die Testplattform pro Lauf nicht
  liefert: mehrere `TxDtls` in einer Sammelbuchung, SCOR-Referenz und eine Belastung.
- **EBICS erst bei Menge**: Zu Beginn reicht der manuelle camt.054-Download im E-Banking. PostFinance spricht EBICS
  3.0 und 2.5; mit 2.5 läuft `node-ebics/node-ebics-client`, was zum Node-Stack passt.
