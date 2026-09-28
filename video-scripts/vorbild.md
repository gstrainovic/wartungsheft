# Vorbild für die Werbefilme

Beim nächsten Überarbeiten der Filme (`betrieb-video-script.md`, `privat-video-script.md`) am Video
«UID-Check für bexio» orientieren und Ideen übernehmen; Goran gefällt es besser als die bisherigen
Wartungsheft-Filme, vor allem wegen der Zooms und der Untertitel.

- Quellen: `~/projects/zefix-uid-check/video/` (`drehbuch.md`, Aufnahmeskript `aufnahme/aufnahme.mjs`,
  HyperFrames-Komposition `komposition/`), fertiges Video auf strainovic-it.ch/zefix-uid-check/.
- Werkzeug: HeyGen HyperFrames (Apache-2.0, HTML-Kompositionen → Video), Skills `hyperframes`,
  `product-launch-video`, `hyperframes-creative`, `hyperframes-keyframes`.
- Was dort besser wirkt: gezielte Zooms auf die entscheidende Stelle der echten Aufnahme (Fehlermeldung, Box
  mit dem Ergebnis), Ken-Burns-Zoom auf Standbilder, kurze Untertitel und Erklärtexte im Bild statt Sprecher,
  SVG-Skizze für den Ablauf, Frage am Anfang und Angebot mit Preis am Schluss.
- Aufnahme: Chrome-Screencast statt des Playwright-Videomitschnitts, weil der für Oberflächentext zu unscharf
  ist; Rendern im Docker-Image von HyperFrames, weil das Fedora-ffmpeg kein libx264 hat.
