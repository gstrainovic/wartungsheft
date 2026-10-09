# Drehbuch: Tutorial «So startest du mit Wartungsheft»

Bedienanleitung am Handy, kein Werbefilm. Ziel: Ein neuer Privathalter sieht, wie er sich anmeldet, ein Fahrzeug
anlegt und vor allem die erste Werkstattrechnung fotografiert, damit er nicht nach dem Fahrzeug aufhört.
Rund 189 Wörter, etwa 85 bis 90 Sekunden. Ton ruhig und erklärend, Du-Form wie die App, Regie nur `[warm]` und
einmal `[enthusiastic]`, keine Ausrufezeichen. Aufnahme wie die Werbefilme (Skill `werbefilm`): echte App,
390 × 693, Musterdaten, Knöpfe vor dem Tipp in die Bildmitte rollen.

Stand: Entwurf, wartet auf Gorans Freigabe des Texts (Skill `produktvideos`, «Reihenfolge»).

## Szene 1: Anmelden (rund 15 s)

**Bild:** `/login`, Hinweis «Neu hier? 30 Tage alles gratis. Kein Passwort — wir schicken dir einen Code.»
E-Mail-Adresse eintippen, **«Code senden»**, Meldung «Code wurde an … gesendet.», Feld «6-stelliger Code»,
**«Anmelden»**. Die Mail selbst nicht zeigen. Übergang in die leere Übersicht.

**Sprecher:** [warm] So startest du mit Wartungsheft, in ein paar Minuten. Auf wartungsheft punkt c h gibst du
deine E-Mail-Adresse ein und tippst auf «Code senden». Der Code kommt per Mail, ein Passwort brauchst du nicht.

## Szene 2: Fahrzeug anlegen (rund 12 s)

**Bild:** leere Übersicht mit «Leg dein erstes Fahrzeug an. Mit dem Fahrzeugausweis geht es am schnellsten.»,
**«Fahrzeug hinzufügen»**, im Formular Zoom auf **«Fahrzeugausweis fotografieren»**; nach dem Scan füllen sich
Marke, Modell, Kontrollschild, Meldung «Felder aus dem Dokument ausgefüllt. Bitte prüfen.», **«Speichern»**,
Fahrzeugseite.

**Sprecher:** [warm] Dann «Fahrzeug hinzufügen». Am schnellsten geht es mit «Fahrzeugausweis fotografieren»: Die App
füllt Marke, Modell und Kontrollschild aus. Du kannst die Felder auch selbst ausfüllen. Dann «Speichern».

## Szene 3: Erste Werkstattrechnung (Kern, rund 25 s)

**Bild:** Checkliste «Einrichten, 0 von 4», erster Schritt «Rechnungen» mit Hauptknopf **«Rechnung fotografieren»**
(Zoom, Tipp). Dialog «Neue Rechnung», **«Rechnung fotografieren oder PDF wählen»**, Musterrechnung (Muster-Garage),
«Rechnung wird ausgerichtet und gelesen …», dann füllen sich Werkstatt, Datum, Kilometerstand, Betrag und
«Erkannte Positionen»; «Felder aus der Rechnung ausgefüllt. Bitte prüfen.», Schwenk über die Felder,
**«1 Rechnung speichern»**. Danach Tab «Wartungsplan» mit «Zuletzt: …, bei … km» und nächstem Termin; Checkliste
«1 von 4».

**Sprecher:** [enthusiastic] Jetzt der wichtigste Schritt: die erste Werkstattrechnung. Auf der Fahrzeugseite
tippst du auf «Rechnung fotografieren» und fotografierst den Beleg. [warm] Die KI liest Werkstatt, Datum,
Kilometerstand, Betrag und die einzelnen Arbeiten heraus. Du prüfst kurz, dann «1 Rechnung speichern». Aus jeder
Arbeit wird eine Wartung, und Wartungsheft rechnet aus, wann sie das nächste Mal fällig ist.

## Szene 4: Checkliste «Einrichten» (rund 12 s)

**Bild:** Zoom auf die Checkliste, «Rechnungen» abgehakt, nächster Schritt «Fahrzeugausweis» mit «Fehlt noch:
Fahrgestellnummer, Baujahr», darunter **«Serviceheft fotografieren»** und **«Letzte Wartungen eintragen»**; Finger
auf «Ausblenden», ohne zu tippen.

**Sprecher:** [warm] Die Checkliste «Einrichten» zeigt, was noch fehlt: Fahrzeugausweis, Serviceheft, letzte
Wartungen. Jeder Schritt ist freiwillig, du kannst ihn später machen oder überspringen.

## Szene 5: Fälligkeit und Erinnerung (rund 15 s)

**Bild:** Übersicht mit «Fällige Arbeiten», eine Arbeit «Bald fällig»; eingeblendet die Erinnerungsmail
(Betreff «Wartungsheft: 1 Arbeit fällig beim …», Musteradresse). **«Erledigt eintragen»**, Dialog mit vorbelegtem
Datum und Kilometerstand, **«Speichern»**, Arbeit steht auf «OK».

**Sprecher:** [warm] Wird eine Arbeit fällig, steht sie in der Übersicht, und Wartungsheft schickt dir eine
E-Mail. Ist sie gemacht, tippst du auf «Erledigt eintragen». Datum und Kilometerstand sind schon ausgefüllt, nur
noch «Speichern».

## Szene 6: Hilfe und Rückmeldung (rund 10 s)

**Bild:** Menüknopf, Zoom auf **«Hilfe»** und **«Fehler melden oder Wunsch»**, Dialog mit **«Sprachnachricht
aufnehmen»**; Schlussbild Logo und `wartungsheft.ch/hilfe`.

**Sprecher:** [warm] Noch Fragen? Im Menü findest du «Hilfe» und «Fehler melden oder Wunsch». Dort kannst du auch
eine Sprachnachricht aufnehmen.

## Belege

Knopfnamen und Abläufe aus `src/texte/login.ts`, `src/texte/app/` (uebersicht, fahrzeugformular, einrichtung,
rechnungsformular, fahrzeugseite, wartungsplan, erinnerung, allgemein, rueckmeldung), Reihenfolge der Checkliste
aus `src/services/vehicle-setup.ts`, Testzeit aus `../ai-proxy/src/trial.ts`. Nicht behauptet: Zeitersparnis,
Wiederverkaufswert, Kundenstimmen, Preis.
