---
name: werbefilm
description: Werbefilme und Tutorial von Wartungsheft neu aufnehmen, montieren und ausliefern (Playwright mit Chrome-Screencast, Sprecher ElevenLabs, ffmpeg mit Musik, Untertitel als WebVTT-Spur bzw. Kästen in den Kurzfassungen). Nur das Wartungsheft-Spezifische; die Regeln für alle Produktvideos stehen im User-Skill produktvideos.
---

Die Filme auf `/`, `/privathalter` und `/betrieb` (und das Tutorial für `/hilfe`) entstehen vollständig im Repo:
keine Kamera, kein fremdes Bildmaterial. Ändert sich die Oberfläche oder ein Satz, wird neu aufgenommen bzw. neu
montiert statt neu gefilmt.

**Regeln** (Reihenfolge der Freigaben, Stimmen, Untertitel, −16 LUFS, Formate Handy und Desktop, Gegenhören mit
Whisper) stehen nur im User-Skill `produktvideos`; hier steht, wie Wartungsheft sie umsetzt. Geprüft werden sie über
`video-scripts/produktvideo.toml` (Filme, Dateien, Lücken mit Grund, Freigaben mit Datum):
`cd video-scripts && uv run --with pytest --with-editable ~/projects/produktvideo pytest produktvideo.toml`.

## Ablauf in zwei Befehlen

```bash
npm run video                       # nimmt alle Szenen deutsch auf, Handy und Desktop (rund 7 Minuten, braucht InstantDB)
VIDEO_SPRACHE=fr npm run video      # dieselben Szenen auf Französisch (fr, it, en), Clips heissen szene-…-fr
npm run video:film                  # Sprecher, Montage, alle Fassungen in allen vier Sprachen
npm run video:film -- fr betrieb    # Teile: Sprachen de|fr|it|en, Filme privat|betrieb|social, oder sprecher
```

Die Aufnahme setzt die App-Sprache vor dem Laden (`localStorage.sprache`, wie nach `/fr/login`), nimmt Knopfnamen
aus `src/texte/app/` und Musterdaten je Sprache (`DATEN` in `e2e/video/*.video.ts`); die Musterrechnung trägt
Beschriftungen in der Sprache der Werkstatt. Gezeichnete Szenen lesen `?sprache=fr`.

Danach liegen bereit (`<name>` ist `privat`, `betrieb`, in anderen Sprachen `privat-fr`, `betrieb-it` usw.,
`src/lib/film-datei.ts`):

| Datei | Zweck |
|---|---|
| `public/film-<name>.{mp4,webm}` | Website Handy, 1080×1920, ohne eingebrannte Untertitel |
| `public/film-<name>-desktop.{mp4,webm}` | Website ab 760 px, 1920×1080, ohne eingebrannte Untertitel |
| `public/film-<name>.vtt` | Untertitel beider Website-Fassungen (WebVTT, gleiche Zeiten wie die SRT) |
| `public/film-<name>-poster.jpg`, `-desktop-poster.jpg` | Standbild vor dem Start |
| `video-out/youtube-<name>.mp4` und `.srt` | YouTube 1920×1080 ohne Kästen, SRT als Untertitelspur hochladen |
| `video-out/social-<name>.{mp4,webm}` | Kurzfassungen 1080×1920 (rund 20 s) für Social, Shorts und Anzeigen, Untertitel-Kästen eingebrannt |

`LandingVideo.vue` wählt den Film in der Sprache der Seite (`/fr/privathalter` → `film-privat-fr`) und hängt die
VTT als `<track kind="subtitles" default>` an: Untertitel an, über den Untertitel-Knopf des Players abschaltbar
(z. B. für Zuschauer ohne Ton). Safari/WebKit übergeht `default`, darum schaltet `untertitelAn` die Spur beim
Laden der Metadaten ein. WebKit prüfen: im Docker-Image `mcr.microsoft.com/playwright:v<Version>-noble`, auf Fedora
fehlen WebKit die Bibliotheken. Die Kästen tragen nur Sprechertext; Szenentitel und Botschaften sind Teil der
gezeichneten Szenen und Titelkarten und bleiben im Bild. Caddy liefert `.vtt` als `text/vtt` (mime.types im
Container), E2E prüft Spur und Datei (`untertitelPruefen` in `e2e/landing-pages.spec.ts`).

MP4 ist H.264 High, Level 4.1, yuv420p, faststart, dazu WebM VP9 Profil 0 mit Opus; Spitzen unter −1 dBFS.
Ausliefern wie der Rest der App: `npm run deploy` (`public/` wandert ins `dist/`).

## Wo was steht

| Thema | Datei |
|---|---|
| Drehbücher: Szenenplan, belegbare Aussagen, Wortwahl | `video-scripts/privat-video-script.md`, `betrieb-video-script.md` |
| Sprechertexte FR, IT, EN mit Begründung und Prüfpunkten | `video-scripts/sprechertexte.md` |
| Bildfolge (Clip, Start, Mindestlänge, Ausschnitt), Sprechertexte je Sprache, Kurzfassungen | `scripts/werbefilm.ts` (`PRIVAT_BILD`, `PRIVAT_TEXT`, `BETRIEB_*`, `KURZ_*`) |
| Rechenschritte: Satzgrenzen, Zeitplan, Untertitel, SRT und VTT, Musikpegel, Wahl des Durchlaufs | `src/lib/werbefilm.ts` (Tests daneben) |
| Sprecher: ElevenLabs-Aufruf, Zwischenspeicher, Piper nur als Entwurf | `src/lib/sprecher.ts`, `scripts/sprecher.ts` |
| Filme, Dateien, Lücken und Freigaben für die Regeltests | `video-scripts/produktvideo.toml` |
| Gewählter Durchlauf je Sprechertext | `video-scripts/sprecher-auswahl.json` |
| App-Szenen (was die Aufnahme klickt und scrollt), Screencast | `e2e/video/*.video.ts`, `e2e/video/szenen.ts` |
| Gezeichnete Szenen und Titelkarten | `video-scripts/szenen/*.html`, aufgenommen von `e2e/video/zeichnung.video.ts` |
| Schrift der Untertitel-Kästen (IBM Plex Sans, OFL) | `video-scripts/schrift/` |
| Einbindung auf der Seite | `src/components/LandingVideo.vue` |

`video-out/` ist gitignored (Aufnahmen in `video-out/roh/`, Sprecher in `video-out/sprecher/`, Musik), `public/film-*`
ist eingecheckt.

## Etwas ändern

- **Reihenfolge** wie im Skill `produktvideos`; hier heisst jede weitere Sprache 4 Echtzeit-Aufnahmen plus Rendern.
  Eine Freigabe trägt Claude mit Datum in `video-scripts/produktvideo.toml` ein.
- **Satz umformulieren:** `sprechen` (und bei abweichender Schreibweise `untertitel`) in `PRIVAT_TEXT` bzw.
  `BETRIEB_TEXT` in `scripts/werbefilm.ts`, dann Sprecher, Spracherkennung und `npm run video:film`. Neue Texte kosten Credits (zwei Durchläufe), alles andere
  kommt aus dem Zwischenspeicher. Abschnittslänge und Untertitelzeiten folgen der Sprechdauer.
- **Anderer Bildausschnitt:** `start` (Sekunde in der Aufnahme; bei Szenen mit Scan `vorEnde`, Sekunden vor dem
  Clip-Ende, weil der Scan je Lauf und Sprache verschieden lang braucht) oder `quer`/`hoch` (`{ x, y, s }`: Mittelpunkt
  relativ, Vergrösserung) im Abschnitt. Desktop-Aufnahmen haben dreifache Pixel, bis `s` 2 bleibt das Bild scharf.
  Übersicht und Kostentabelle gehen im Desktop-Layout über die ganze Breite: dort fährt der Ausschnitt mit `bisX`
  über die Abschnittsdauer von links (Namen) nach rechts (Stand, Beträge) (`ausschnitt()` in `src/lib/werbefilm.ts`).
  Die Handy-Fassung zeigt die App in Originalgrösse und braucht keinen Zoom.
  Startpunkte findet man über einen Kontaktbogen:
  `ffmpeg -f concat -safe 0 -i video-out/roh/<clip>/liste.txt -vf "fps=1,scale=480:-2,tile=4x5" -frames:v 1 bogen.jpg`
  (Kachel n = Sekunde n).
- **Andere Stelle der App zeigen:** Szene in `e2e/video/*.video.ts`, dann `npm run video -- <datei> -g "<Szene>"`.
  `aufnahmeStarten(page, testInfo)` erst aufrufen, wenn die Seite steht.
- **Neue gezeichnete Szene:** HTML nach `video-scripts/szenen/` mit Texten je Sprache (Tabelle `TEXTE`, Parameter
  `?sprache=`), in `e2e/video/zeichnung.video.ts` eintragen. Titel der Szenen folgen dem Sprechertext.

## Sprecher

Stimmen, Modell und Einstellungen wie im Skill `produktvideos` (`ELEVEN` und `STIMMEN` in `src/lib/sprecher.ts`).
Natürlich, aber begeistert: Regieanweisungen in eckigen Klammern (`[excited]`, `[enthusiastic]`, `[delighted]`,
`[curious]`, `[sighs]`, `[warm]`) und Ausrufezeichen; die Tags werden nicht gesprochen und fallen aus den Untertiteln.
Der erste Satz eines Films steigt ruhig ein (`[warm]`, ohne Ausrufezeichen), sonst wirkt der Anfang abrupt und laut.
Freigegebene Fassung des Betriebstexts (so in `BETRIEB_TEXT`, je Szene ein Aufruf):

```text
[warm] Ein ganz normaler Montagmorgen im Betrieb. Welcher Lieferwagen muss zum Service? [enthusiastic] Ein Blick auf die Übersicht,
und schon ist klar: was ansteht, für jedes Fahrzeug! [excited] Der Fahrer fotografiert die Werkstattrechnung.
Erfasst ist sie damit auch! [enthusiastic] Am Jahresende: Kosten pro Fahrzeug, als Datei für die Buchhaltung.
[delighted] Und die Frage vom Montagmorgen? Beantwortet sich selbst! [excited] 36 Franken pro Fahrzeug und Jahr.
30 Tage gratis testen!
```

Der Privatfilm spricht den Drehbuchtext wörtlich (Du-Form), nur mit Regie und Ausrufezeichen. Die Webadresse geht
als «wartungsheft punkt c h» an die Stimme, der Untertitel zeigt `wartungsheft.ch`.

Freigegebene Hörproben des Betriebstexts, ohne Anrede (die Anrede tu/vous bzw. tu/Lei richtet sich nach der
Übersetzung der App), Vorlage für die Sprechertexte:

```text
FR: [warm] Un lundi matin comme les autres dans l'entreprise. Quelle camionnette doit passer au service ? [enthusiastic] Un coup d'œil
sur l'aperçu, et tout est clair : ce qui est à faire, pour chaque véhicule ! [excited] Le chauffeur photographie la
facture du garage. Et elle est déjà saisie ! [enthusiastic] En fin d'année : les coûts par véhicule, en fichier pour
la comptabilité. [delighted] Et la question du lundi matin ? Elle se règle toute seule ! [excited] 36 francs par
véhicule et par an. 30 jours d'essai gratuit !

IT: [warm] Un lunedì mattina come tanti in azienda. Quale furgone deve andare in officina? [enthusiastic] Uno sguardo alla
panoramica, ed è tutto chiaro: cosa è in scadenza, per ogni veicolo! [excited] L'autista fotografa la fattura
dell'officina. Ed è già registrata! [enthusiastic] A fine anno: i costi per veicolo, in un file per la contabilità.
[delighted] E la domanda del lunedì mattina? Si risolve da sola! [excited] 36 franchi per veicolo all'anno. 30 giorni
di prova gratuita!

EN: [warm] Just another Monday morning at the company. Which van is due for a service? [enthusiastic] One look at the overview,
and it's all clear: what's coming up, for every vehicle! [excited] The driver snaps a photo of the garage invoice.
And it's already recorded! [enthusiastic] At year end: costs per vehicle, as a file for the accountant. [delighted]
And Monday's question? It answers itself! [excited] 36 francs per vehicle per year. Try it free for 30 days!
```

Die Sprechertexte aller Sprachen stehen in `scripts/werbefilm.ts`, die Übersetzungen mit Begründung in
`video-scripts/sprechertexte.md`. Der Zwischenspeicher-Name enthält die Stimme; die deutschen Dateien behalten
ihren Namen.

**Zwei Durchläufe, der bessere gewinnt:** `eleven_v3` betont jedes Mal anders und verschluckt gelegentlich ein Wort
(«und ja» statt «und Jahr», «ein Auto» statt «dein Auto»). Ablauf für neue Texte:
1. `npm run video:film -- sprecher` erzeugt je Text Durchlauf 1 und 2 und meldet «Spracherkennung fehlt».
2. Transkripte nach `video-out/sprecher/whisper.json` (`{ "<datei>.mp3": "erkannter Text" }`), nur für fehlende
   Dateien, lokal und gratis (Paket `~/projects/produktvideo`, im Ordner `~/projects/produktvideo`):
   `HF_HUB_OFFLINE=1 uv run --extra hoeren produktvideo hoeren --whisper-json ../wartungsheft/video-out/sprecher/whisper.json ../wartungsheft/video-out/sprecher/*.mp3`
3. `npm run video:film -- sprecher` noch einmal: wählt nach Wortfehlern (Zahlwörter in allen vier Sprachen),
   Aussetzern (Pause über 0,8 s) und Lautheitsspanne (LRA), die Wahl steht in `video-scripts/sprecher-auswahl.json`.
Für eine neue Wahl den Eintrag in der JSON löschen. Steht die Wahl fest, holt die Pipeline nur diesen Durchlauf
(`durchlaeufe`). Einzelnen Text testen: `node scripts/sprecher.ts "[excited] Text!" 1 [de|fr|it|en]` (gibt den Pfad
aus; Französisch mit geschütztem Leerzeichen vor `? ! :` wie `franz()`, sonst stimmt der Schlüssel nicht).

**Sparsam mit Zeichen:** Für einen einzelnen neuen Satz nur Durchlauf 1 erzeugen, per Spracherkennung prüfen und bei
sauberer Aussprache in `sprecher-auswahl.json` mit `1` eintragen; Durchlauf 2 nur bei Fehlaussprache. Whisper hört
«furgone» als «forgone», das ist kein Sprecherfehler. **Eine schon angehörte Aufnahme übernehmen** (z. B. eine von
Goran abgenommene Probe): Schlüssel mit `sprecherSchluessel(text, 1, sprache)` aus `src/lib/sprecher.ts` berechnen,
die MP3 als `video-out/sprecher/<schluessel>.mp3` ablegen und den Text mit `1` in die Auswahl eintragen.

Schlüssel in `~/.config/elevenlabs/key` (Konto g.strainovic@gmail.com, Plan Creator mit kommerzieller Lizenz,
Bibliotheksstimmen gehen über die API nur mit bezahltem Plan). Verbrauch: `GET /v1/user/subscription`, Feld
`character_count`; beide Filme einer Sprache mit neuen Texten kosten rund 2000 Zeichen.

**Ohne Schlüssel** bricht der Sprecher ab. Piper (`de_DE-thorsten-high`, lokal) nur für einen ausdrücklichen
Entwurf mit `SPRECHER_ENTWURF=1`, nie für eine Auslieferung; `piperText` schreibt dafür Zahlen aus und
«Serviceheft» als «Serwis-Heft». Installation: `pipx install piper-tts`, Stimme von
huggingface.co/rhasspy/piper-voices nach `~/.local/share/piper-voices/`. Andere Stimme: `PIPER_VOICE=/pfad.onnx`.

## Bild, Untertitel, Musik

- **Aufnahme per Chrome-Screencast** (`aufnahmeStarten`/`clipSpeichern` in `e2e/video/szenen.ts`): JPEG-Bilder in
  Gerätepixeln plus concat-Liste mit Standzeiten, ohne Zwischenkodierung. Desktop 1280×720 CSS bei Pixeldichte 3
  (3840×2160), Handy 390×693 bei 3 (1170×2079, 9:16).
- **Untertitel:** je Satz ein Eintrag, Satzgrenzen aus den Sprechpausen (`silencedetect`), Einsatz 0,3 s nach
  Abschnittsbeginn, Überblendung 0,45 s. Daraus entstehen VTT (Website), SRT (YouTube) und in den Kurzfassungen
  eingebrannte Kästen im Stil der Plugin-Filme: weiss, Rand 8 px in `#059669`, IBM Plex Sans 600, unten links,
  gerendert als PNG mit Chromium und weich eingeblendet. Nur Untertitel ändern (ohne neues Bild): nur
  `npm run video:film -- privat betrieb`, Sprecher kommen aus dem Zwischenspeicher.
- **Musik:** «Corporate Background» von The_Mountain (Pixabay Content License, kommerziell ohne Namensnennung,
  pixabay.com/music/corporate-corporate-background-576564) als `video-out/musik.mp3`, nicht im Git (Pixabay erlaubt
  keine Weitergabe der Datei allein). Grundpegel 0,2, unter der Stimme 0,05 mit Rampen von 0,5 s, Ein- und
  Ausblenden; fehlt die Datei, gibt es nur Stimme. Andere Datei: `MUSIK=/pfad.mp3`.
- **Effekte:** `effekte` im Abschnitt (`{ datei, bei, vonEnde?, pegel }`, Sekunden ab Beginn bzw. vor Ende), Dateien
  aus `~/.claude/skills/media-use/audio/assets/sfx` (Pixabay Content License, andere Quelle `SFX=/ordner`): Klick beim
  «Speichern» der Rechnung, Glocke, wenn die Frage vom Anfang beantwortet ist. Fehlt der Ordner, ohne Effekte.
- **H.264** kodiert ffmpeg im Docker-Image `hyperframes-renderer:0.8.98` (libx264), weil Fedoras ffmpeg nur
  libopenh264 hat; VP9 und Messungen laufen mit dem System-ffmpeg.

## Regeln für den Inhalt

- **Die App wird nie generiert.** Nur echte Aufnahmen; eine gemalte Oberfläche in der Werbung wäre irreführend.
- Nur behaupten, was der Film zeigt oder was in `plans.ts`, `trial.ts` und den AGB steht. Keine Zeitersparnis in
  Stunden, kein Wiederverkaufswert in Franken, keine erfundenen Kundenstimmen.
- Alle Daten in den Aufnahmen sind erfunden und entstehen bei jedem Lauf neu; Werkstätten heissen «Muster-…»
  (`musterRechnungFoto` in `e2e/video/szenen.ts` rendert dazu ein Rechnungsbild mit den Angaben des gemockten Scans).
- Der Sprecher duzt wie die App. Figuren im Bild reden neutral, damit kein Sie/Du-Bruch entsteht.
- «Lieferwagen», nicht «Bus»: in der Schweiz ist ein Bus das Postauto.
- Dramaturgie: Frage am Anfang, dieselbe Szene am Ende mit der Antwort. Keine Funktionsliste.
- Bild und Sprecher sagen dasselbe: verspricht der Satz das Serviceheft als PDF, klickt die Szene «Serviceheft für
  den Verkauf» und zeigt danach die erste Seite des echten PDFs (`pdfZeigen` in `e2e/video/szenen.ts`, PDF und
  Bild unter `video-out/pdf/`). Die Musterrechnungen tragen ihr Foto (`musterRechnungJpeg`), sonst meldet das PDF
  «0 von 3 Rechnungen mit Foto».
- Gezeichnete Szenen skalieren mit der Fläche (`vmin`, `vw`, `vh`), damit sie hochkant und quer gleich gross
  wirken; Sprechblasen nie leer, Markenfarbe `#059669`/`#10b981` als Akzent. Vor dem Aufnehmen fotografieren:
  `npx playwright screenshot --wait-for-timeout=4500 --viewport-size=390,693 "file://$PWD/video-scripts/szenen/<datei>?sprache=fr" bild.png`
  (und 1280,720).
- Wichtige Knöpfe vor dem Klick in die Bildmitte rollen (`scrollIntoView({ block: 'center' })`): unten liegen am
  Handy die Untertitel.

## Fallstricke, die schon einmal Zeit gekostet haben

- **Ohne `--force-device-scale-factor` liefert der Screencast nur CSS-Pixel**, egal was `deviceScaleFactor` sagt.
  Steht in `playwright.config.ts` bei beiden Video-Projekten.
- **Ein stehendes Bild löst keinen Screencast-Rahmen aus.** `aufnahmeStarten` zwingt deshalb ein Neuzeichnen.
- **Zuschnitt aufrunden sprengt die Aufnahme** (2080 Zeilen bei 2079 vorhandenen): Masse immer auf gerade Werte
  abrunden.
- **Mausrad-Schritte schiessen im Desktop-Layout am Ziel vorbei.** Für eine bestimmte Stelle
  `scrollIntoView({ behavior: 'smooth', block: 'center' })` auf das Element.
- **Reicht eine Aufnahme nicht für den Abschnitt**, rückt der Start nach vorn und danach steht das letzte Bild.
  Dann die Szene verlängern statt den Start zu verschieben.
- **Die Szenen einer Geschichte müssen dieselben Daten zeigen.** Sonst meldet das Dashboard in einer Szene
  «nichts fällig», während der Film von einem überfälligen Fahrzeug erzählt.
- **Die Dateien `.video.ts` sind keine Tests** und laufen nicht in `online`/`offline` mit; sie hängen an den
  Projekten `video` und `video-desktop`.
