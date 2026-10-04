---
name: werbefilm
description: Werbefilme für die Landing Pages neu aufnehmen, montieren und ausliefern (Playwright mit Chrome-Screencast, Sprecher ElevenLabs Andres bzw. Piper, ffmpeg mit Untertitel-Kästen und Musik)
---

Die Filme auf `/`, `/privathalter` und `/betrieb` entstehen vollständig im Repo: keine Kamera, kein fremdes
Bildmaterial. Ändert sich die Oberfläche oder ein Satz, wird neu aufgenommen bzw. neu montiert statt neu gefilmt.

## Ablauf in zwei Befehlen

```bash
npm run video        # nimmt alle Szenen auf, Handy- und Desktop-Layout (rund 7 Minuten, braucht npm run dev-Umgebung)
npm run video:film   # Sprecher, Montage, alle Fassungen (rund 9 Minuten); Teile: -- privat | betrieb | social | sprecher
```

Danach liegen bereit:

| Datei | Zweck |
|---|---|
| `public/film-privat.{mp4,webm}`, `film-betrieb.*` | Website Handy, 1080×1920, Untertitel-Kästen eingebrannt |
| `public/film-*-desktop.{mp4,webm}` | Website ab 760 px, 1920×1080, Untertitel-Kästen eingebrannt |
| `public/film-*-poster.jpg` | Standbild vor dem Start |
| `video-out/youtube-<film>.mp4` und `.srt` | YouTube 1920×1080 ohne Kästen, SRT als Untertitelspur hochladen |
| `video-out/social-<film>.{mp4,webm}` | Kurzfassungen 1080×1920 (rund 20 s) für Social, Shorts und Anzeigen |

MP4 ist H.264 High, Level 4.1, yuv420p, faststart (spielt in Safari und auf dem iPhone), WebM VP9 Profil 0 mit Opus.
Ton −16 LUFS, Spitzen unter −1 dBFS. Ausliefern wie der Rest der App: `npm run deploy` (`public/` wandert ins `dist/`).

## Wo was steht

| Thema | Datei |
|---|---|
| Drehbücher: Szenenplan, belegbare Aussagen, Wortwahl | `video-scripts/privat-video-script.md`, `betrieb-video-script.md` |
| Abschnitte (Clip, Start, Mindestlänge, Sprechertext mit Regie, Ausschnitt), Kurzfassungen | `scripts/werbefilm.ts` (`PRIVAT`, `BETRIEB`, `SOCIAL_*`) |
| Rechenschritte: Satzgrenzen, Zeitplan, Untertitel, SRT, Musikpegel, Wahl des Durchlaufs | `src/lib/werbefilm.ts` (Tests daneben) |
| Sprecher: ElevenLabs-Aufruf, Zwischenspeicher, Piper-Rückfall | `src/lib/sprecher.ts`, `scripts/sprecher.ts` |
| Gewählter Durchlauf je Sprechertext | `video-scripts/sprecher-auswahl.json` |
| App-Szenen (was die Aufnahme klickt und scrollt), Screencast | `e2e/video/*.video.ts`, `e2e/video/szenen.ts` |
| Gezeichnete Szenen und Titelkarten | `video-scripts/szenen/*.html`, aufgenommen von `e2e/video/zeichnung.video.ts` |
| Schrift der Untertitel-Kästen (IBM Plex Sans, OFL) | `video-scripts/schrift/` |
| Einbindung auf der Seite | `src/components/LandingVideo.vue` |

`video-out/` ist gitignored (Aufnahmen in `video-out/roh/`, Sprecher in `video-out/sprecher/`, Musik), `public/film-*`
ist eingecheckt.

## Etwas ändern

- **Satz umformulieren:** `sprechen` (und bei abweichender Schreibweise `untertitel`) im Abschnitt in
  `scripts/werbefilm.ts`, dann `npm run video:film`. Neue Texte kosten Credits (zwei Durchläufe), alles andere
  kommt aus dem Zwischenspeicher. Abschnittslänge und Untertitelzeiten folgen der Sprechdauer.
- **Anderer Bildausschnitt:** `start` (Sekunde in der Aufnahme) oder `quer`/`hoch` (`{ x, y, s }`: Mittelpunkt
  relativ, Vergrösserung) im Abschnitt. Desktop-Aufnahmen haben dreifache Pixel, bis `s` 2 bleibt das Bild scharf.
  Startpunkte findet man über einen Kontaktbogen:
  `ffmpeg -f concat -safe 0 -i video-out/roh/<clip>/liste.txt -vf "fps=1,scale=480:-2,tile=4x5" -frames:v 1 bogen.jpg`
  (Kachel n = Sekunde n).
- **Andere Stelle der App zeigen:** Szene in `e2e/video/*.video.ts`, dann `npm run video -- <datei> -g "<Szene>"`.
  `aufnahmeStarten(page, testInfo)` erst aufrufen, wenn die Seite steht.
- **Neue gezeichnete Szene:** HTML nach `video-scripts/szenen/`, in `e2e/video/zeichnung.video.ts` eintragen.

## Sprecher

**Deutsch: ElevenLabs, Stimme «Andres»** (Bibliothek, Schweizerdeutsch gefärbt, `voice_id` `BfwuiKSWxqDOcSYQr6EC`),
Modell `eleven_v3`, `voice_settings` `{"stability": 0.5, "similarity_boost": 0.75}`, Ausgabe `mp3_44100_192`.
Natürlich, aber begeistert: Regieanweisungen in eckigen Klammern (`[excited]`, `[enthusiastic]`, `[delighted]`,
`[curious]`, `[sighs]`) und Ausrufezeichen; die Tags werden nicht gesprochen und fallen aus den Untertiteln.
Freigegebene Fassung des Betriebstexts (so in `BETRIEB`, je Szene ein Aufruf):

```text
[excited] Montagmorgen im Betrieb. Welcher Lieferwagen muss zum Service? [enthusiastic] Ein Blick auf die Übersicht,
und schon ist klar: was ansteht, für jedes Fahrzeug! [excited] Der Fahrer fotografiert die Werkstattrechnung.
Erfasst ist sie damit auch! [enthusiastic] Am Jahresende: Kosten pro Fahrzeug, als Datei für die Buchhaltung.
[delighted] Und die Frage vom Montagmorgen? Beantwortet sich selbst! [excited] 36 Franken pro Fahrzeug und Jahr.
30 Tage gratis testen!
```

Der Privatfilm spricht den Drehbuchtext wörtlich (Du-Form), nur mit Regie und Ausrufezeichen. Die Webadresse geht
als «wartungsheft punkt c h» an die Stimme, der Untertitel zeigt `wartungsheft.ch`.

**Weitere Sprachen**, gewählt, gleiche Einstellungen und begeisterte Regie wie Andres (alle im Konto):

| Sprache | Stimme | `voice_id` |
|---|---|---|
| FR | Nathan, Westschweiz | `6HYJeW6WLg97b4ika29W` |
| IT | Valentino | `lJylpTXX0sNdqq5EUv4M` |
| EN | Adam Stone, britisch | `DEFpwxCUkrj3WAbTDRTZ` |

Freigegebene Hörproben des Betriebstexts, ohne Anrede (die Anrede tu/vous bzw. tu/Lei richtet sich nach der
Übersetzung der App), Vorlage für die Sprechertexte:

```text
FR: [excited] Lundi matin dans l'entreprise. Quelle camionnette doit passer au service ? [enthusiastic] Un coup d'œil
sur l'aperçu, et tout est clair : ce qui est à faire, pour chaque véhicule ! [excited] Le chauffeur photographie la
facture du garage. Et elle est déjà saisie ! [enthusiastic] En fin d'année : les coûts par véhicule, en fichier pour
la comptabilité. [delighted] Et la question du lundi matin ? Elle se règle toute seule ! [excited] 36 francs par
véhicule et par an. 30 jours d'essai gratuit !

IT: [excited] Lunedì mattina in azienda. Quale furgone deve andare in officina? [enthusiastic] Uno sguardo alla
panoramica, ed è tutto chiaro: cosa è in scadenza, per ogni veicolo! [excited] L'autista fotografa la fattura
dell'officina. Ed è già registrata! [enthusiastic] A fine anno: i costi per veicolo, in un file per la contabilità.
[delighted] E la domanda del lunedì mattina? Si risolve da sola! [excited] 36 franchi per veicolo all'anno. 30 giorni
di prova gratuita!

EN: [excited] Monday morning at the company. Which van is due for a service? [enthusiastic] One look at the overview,
and it's all clear: what's coming up, for every vehicle! [excited] The driver snaps a photo of the garage invoice.
And it's already recorded! [enthusiastic] At year end: costs per vehicle, as a file for the accountant. [delighted]
And Monday's question? It answers itself! [excited] 36 francs per vehicle per year. Try it free for 30 days!
```

`src/lib/sprecher.ts` kennt heute nur Andres; für eine weitere Sprache die Stimme dort als Parameter ergänzen.

**Zwei Durchläufe, der bessere gewinnt:** `eleven_v3` betont jedes Mal anders und verschluckt gelegentlich ein Wort
(«und ja» statt «und Jahr», «ein Auto» statt «dein Auto»). `npm run video:film -- sprecher` erzeugt je Text
Durchlauf 1 und 2 und wählt nach Wortfehlern, Aussetzern (Pause über 0,8 s) und Lautheitsspanne (LRA); die Wahl
steht in `video-scripts/sprecher-auswahl.json`. Wortfehler zählen nur, wenn `video-out/sprecher/whisper.json` die
Transkripte enthält (`{ "<datei>.mp3": "erkannter Text" }`, erzeugt mit faster-whisper, Modell `medium`, Sprache
`de`; Audio vorher mit ffmpeg zu 16 kHz mono dekodieren, das `av`-Paket der Fedora-Python passt nicht zu
faster-whisper). Für eine neue Wahl den Eintrag in der JSON löschen. Einzelnen Text testen:
`node scripts/sprecher.ts "[excited] Text!" 1` (gibt den Pfad aus).

Schlüssel in `~/.config/elevenlabs/key` (Konto g.strainovic@gmail.com, Plan Creator mit kommerzieller Lizenz,
Bibliotheksstimmen gehen über die API nur mit bezahltem Plan). Verbrauch: `GET /v1/user/subscription`, Feld
`character_count`; ein kompletter Neubau beider Filme mit neuen Texten kostet rund 2000 Zeichen.

**Rückfall ohne Schlüssel:** Piper mit `de_DE-thorsten-high` (lokal, gratis), `scripts/sprecher.ts` schreibt dafür
Zahlen aus und «Serviceheft» als «Serwis-Heft». Installation: `pipx install piper-tts`, Stimme von
huggingface.co/rhasspy/piper-voices nach `~/.local/share/piper-voices/`. Andere Stimme: `PIPER_VOICE=/pfad.onnx`.

## Bild, Untertitel, Musik

- **Aufnahme per Chrome-Screencast** (`aufnahmeStarten`/`clipSpeichern` in `e2e/video/szenen.ts`): JPEG-Bilder in
  Gerätepixeln plus concat-Liste mit Standzeiten, ohne Zwischenkodierung. Desktop 1280×720 CSS bei Pixeldichte 3
  (3840×2160), Handy 390×693 bei 3 (1170×2079, 9:16).
- **Untertitel-Kästen** im Stil der Plugin-Filme: weiss, Rand 8 px in `#059669`, IBM Plex Sans 600, unten links;
  je Satz ein Kasten, gerendert als PNG mit Chromium und weich eingeblendet. Satzgrenzen aus den Sprechpausen
  (`silencedetect`), Einsatz 0,3 s nach Abschnittsbeginn, Überblendung 0,45 s.
- **Musik:** «Corporate Background» von The_Mountain (Pixabay Content License, kommerziell ohne Namensnennung,
  pixabay.com/music/corporate-corporate-background-576564) als `video-out/musik.mp3`, nicht im Git (Pixabay erlaubt
  keine Weitergabe der Datei allein). Grundpegel 0,2, unter der Stimme 0,05 mit Rampen von 0,5 s, Ein- und
  Ausblenden; fehlt die Datei, gibt es nur Stimme. Andere Datei: `MUSIK=/pfad.mp3`.
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
