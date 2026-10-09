/**
 * Montiert die Werbefilme aus den Aufnahmen in video-out/roh/ (`npm run video`), mit Sprecher (ElevenLabs, eine
 * Stimme je Sprache, Rückfall Piper), Untertiteln (Website als WebVTT-Spur, Kurzfassungen als eingebrannte Kästen
 * im Stil der Plugin-Filme), Musik mit Absenkung unter der Stimme und Lautheit −16 LUFS. Skill `werbefilm`.
 *
 *   node scripts/werbefilm.ts                    # alles: Privat, Betrieb, Kurzfassungen in DE, FR, IT, EN
 *   node scripts/werbefilm.ts privat betrieb     # nur diese Filme
 *   node scripts/werbefilm.ts fr it              # nur diese Sprachen (mit Film-Wahl kombinierbar)
 *   node scripts/werbefilm.ts social             # nur die Kurzfassungen
 *   node scripts/werbefilm.ts sprecher           # nur Sprecher erzeugen und den besseren Durchlauf wählen
 *
 * Ergebnis (<name> ist privat oder betrieb, ausser Deutsch mit Sprachkürzel: privat-fr, src/lib/film-datei.ts):
 *   public/film-<name>.{mp4,webm}, -poster.jpg            Website, Handy 1080×1920, ohne eingebrannte Untertitel
 *   public/film-<name>-desktop.{mp4,webm}, -poster.jpg    Website, Desktop 1920×1080, ohne eingebrannte Untertitel
 *   public/film-<name>.vtt                                Untertitel beider Website-Fassungen (WebVTT)
 *   video-out/youtube-<name>.mp4, .srt                    YouTube 1920×1080 ohne Kästen, SRT als Untertitelspur
 *   video-out/social-<name>.{mp4,webm}                    Kurzfassung 1080×1920 für Social und Anzeigen
 *
 * H.264 entsteht mit libx264 im Docker-Image von HyperFrames (Fedoras ffmpeg hat nur libopenh264), VP9 und alles
 * andere mit dem ffmpeg des Systems. Musik: video-out/musik.mp3 (nicht im Git, Quelle im Skill).
 */
import type { Sprache } from '../src/lib/sprache.ts'
import type { Blick, Cue, Effekt, Zeitraum } from '../src/lib/werbefilm.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import { filmName } from '../src/lib/film-datei.ts'
import { sprechen } from '../src/lib/sprecher.ts'
import {
  abschnittDauer,
  ausschnitt,
  besterDurchlauf,
  durchlaeufe,
  effektZeiten,
  musikAusdruck,
  ohneRegie,
  saetze,
  satzGrenzen,
  sprechzeitenZusammenfassen,
  srt,
  startInAufnahme,
  stummeFassung,
  stummeLage,
  untertitelSpur,
  vtt,
  wortfehler,
  zeitplan,
} from '../src/lib/werbefilm.ts'
import { sprecherDeps } from './sprecher.ts'

const REPO = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '')
const OUT = join(REPO, 'video-out')
const ROH = join(OUT, 'roh')
const TMP = join(OUT, 'tmp')
const PUBLIC = join(REPO, 'public')
const AUSWAHL = join(REPO, 'video-scripts/sprecher-auswahl.json')
const WHISPER = join(OUT, 'sprecher/whisper.json')
const MUSIK = process.env.MUSIK ?? join(OUT, 'musik.mp3')
/** Effekte (Pixabay Content License) aus dem Skill media-use, wie in den Plugin-Filmen; fehlt der Ordner, ohne Effekte */
const SFX = process.env.SFX ?? join(process.env.HOME ?? '', '.claude/skills/media-use/audio/assets/sfx')
const SCHRIFT = join(REPO, 'video-scripts/schrift/ibm-plex-sans-latin-600-normal.woff2')
const DOCKER_BILD = 'hyperframes-renderer:0.8.98'

/** Überblendung zwischen zwei Abschnitten */
const BLENDE = 0.45
/** Einsatz des Sprechers nach Abschnittsbeginn */
const VORLAUF = 0.3
/** Luft nach dem letzten Laut, bevor der Schnitt kommt */
const NACHLAUF = 1.2
/** Musik: Grundpegel und Pegel unter der Stimme (linear), Rampe in Sekunden */
const MUSIK_PEGEL = { grund: 0.2, unter: 0.05, rampe: 0.5 }

interface Abschnitt {
  /** Ordner unter video-out/roh/ (ohne -desktop) */
  clip: string
  /** Sekunde in der Aufnahme, ab der der Abschnitt läuft */
  start: number
  /** Stattdessen Sekunden vor dem Ende der Aufnahme (Szenen mit Scan, dessen Dauer je Lauf schwankt) */
  vorEnde?: number
  /** Mindestlänge; mit langem Sprechertext wird der Abschnitt länger */
  minimum: number
  /** Sprechertext mit Regieanweisungen für ElevenLabs */
  sprechen: string
  /** Untertitel, falls die Schrift anders lauten muss als die Aussprache (gleiche Zahl Sätze) */
  untertitel?: string
  quer?: Blick
  hoch?: Blick
  /** Geräusche zu Aktionen im Bild (Klick beim Speichern, Glocke bei der Antwort) */
  effekte?: Effekt[]
}

// Titelkarten sind im Desktop-Layout klein: mittig vergrössert zeigen
const TITEL_QUER: Blick = { x: 0.5, y: 0.5, s: 1.6 }
// Der Rechnungsdialog steht im Desktop-Layout mittig und schmal: näher heran, damit die Felder lesbar sind
const DIALOG_QUER: Blick = { x: 0.5, y: 0.62, s: 1.35 }
// Übersicht («Fällig», Fahrzeuge) und Tabelle «Kosten pro Fahrzeug und Jahr» gehen im Desktop-Layout über die
// ganze Breite und sind klein: näher heran und ruhig von links (Namen) nach rechts (Stand, Beträge) fahren
const UEBERSICHT_QUER: Blick = { x: 0.3, y: 0.4, s: 1.4, bisX: 0.7 }
const KOSTEN_QUER: Blick = { x: 0.3, y: 0.55, s: 1.4, bisX: 0.7 }
// Klick auf «Speichern» am Ende der Rechnungsszene, Glocke, wenn die Frage vom Anfang beantwortet ist
const SPEICHERN: Effekt = { datei: 'click-soft.mp3', bei: 0.8, vonEnde: true, pegel: 0.7 }
const ANTWORT: Effekt = { datei: 'chime.mp3', bei: 1, pegel: 0.45 }

type Bild = Omit<Abschnitt, 'sprechen' | 'untertitel'>
type Text = Pick<Abschnitt, 'sprechen' | 'untertitel'>

/** Bildfolge des Privatfilms (Drehbuch video-scripts/privat-video-script.md); die Clips gibt es je Sprache */
const PRIVAT_BILD: Bild[] = [
  { clip: 'szene-privat-kaeufer-fragt-nach-dem-serviceheft', start: 0, minimum: 6 },
  { clip: 'szene-privat-zettelwirtschaft-in-der-schachtel', start: 0.6, minimum: 4 },
  { clip: 'szene-2-rechnung-fotografieren-felder-fuellen-sich', start: 6.5, vorEnde: 10.5, minimum: 8, quer: DIALOG_QUER, effekte: [SPEICHERN] },
  { clip: 'szene-3-faelligkeit-auf-dem-dashboard-und-erledigt-eintragen', start: 0.5, minimum: 6.5, quer: UEBERSICHT_QUER },
  // Ende der Aufnahme: Klick auf «Serviceheft für den Verkauf», danach die erste Seite des echten PDFs
  { clip: 'szene-4-kosten-und-pdf-dossier-fuer-den-verkauf', start: 3.5, vorEnde: 7, minimum: 6.5 },
  { clip: 'szene-privat-kaeufer-bekommt-die-antwort', start: 0, minimum: 4.5, effekte: [ANTWORT] },
  { clip: 'titel-6-abspann', start: 0.3, minimum: 5.5, quer: TITEL_QUER },
]

/** Bildfolge des Betriebsfilms (Drehbuch video-scripts/betrieb-video-script.md) */
const BETRIEB_BILD: Bild[] = [
  { clip: 'szene-betrieb-montagmorgen-welcher-muss-zum-service', start: 0, minimum: 6 },
  { clip: 'szene-2-fuhrpark-auf-einen-blick-was-ist-faellig', start: 0.5, minimum: 7, quer: UEBERSICHT_QUER },
  { clip: 'szene-3-rechnung-vom-fahrer-ein-foto-genuegt', start: 4.5, vorEnde: 7.5, minimum: 7.5, quer: DIALOG_QUER, effekte: [SPEICHERN] },
  { clip: 'szene-4-kosten-pro-fahrzeug-und-jahr-export-fuer-die-buchhaltung', start: 1.5, minimum: 6.5, quer: KOSTEN_QUER },
  { clip: 'szene-betrieb-auf-einen-blick-beantwortet', start: 0, minimum: 5, effekte: [ANTWORT] },
  { clip: 'titel-6-abspann', start: 0.3, minimum: 5, quer: TITEL_QUER },
]

/** Französische Typografie: geschütztes Leerzeichen vor ? ! : (der Untertitel bricht dort nicht um) */
function franz(text: string): string {
  return text.replace(/ ([?!:])/g, ' $1')
}
function franzTexte(texte: Text[]): Text[] {
  return texte.map(t => ({ sprechen: franz(t.sprechen), ...(t.untertitel ? { untertitel: franz(t.untertitel) } : {}) }))
}

/**
 * Sprechertexte je Sprache, ein Eintrag je Bild. Deutsch: Drehbuch wörtlich, nur Regie und Ausrufezeichen ergänzt.
 * Die Übersetzungen stehen mit Begründung in video-scripts/sprechertexte.md; der Betriebstext ist die freigegebene
 * Hörprobe aus dem Skill `werbefilm`. Anrede wie die App: Du, tu, tu, englisch neutral.
 */
const PRIVAT_TEXT: Record<Sprache, Text[]> = {
  de: [
    { sprechen: '[excited] Du willst dein Auto verkaufen. [curious] Der Käufer fragt: Gibt es ein Serviceheft?', untertitel: 'Du willst dein Auto verkaufen. Der Käufer fragt: «Gibt es ein Serviceheft?»' },
    { sprechen: '[sighs] Und du suchst.' },
    { sprechen: '[excited] Ab heute nicht mehr: Rechnung fotografieren genügt! [enthusiastic] Werkstatt, Datum, Betrag und Arbeiten stehen drin!' },
    { sprechen: '[enthusiastic] Wartungsheft meldet sich, bevor die nächste Arbeit fällig ist!' },
    { sprechen: '[excited] Und beim Verkauf liegt alles auf dem Tisch: das vollständige Serviceheft als PDF!' },
    { sprechen: '[delighted] Alles da!', untertitel: '«Alles da!»' },
    { sprechen: '[excited] 25 Franken im Jahr. 30 Tage gratis testen, auf wartungsheft punkt c h!', untertitel: '25 Franken im Jahr. 30 Tage gratis testen, auf wartungsheft.ch!' },
  ],
  fr: franzTexte([
    { sprechen: '[excited] Tu veux vendre ta voiture. [curious] L\'acheteur demande : il y a un carnet d\'entretien ?' },
    { sprechen: '[sighs] Et tu cherches.' },
    { sprechen: '[excited] À partir d\'aujourd\'hui, c\'est fini : une photo de la facture suffit ! [enthusiastic] Garage, date, montant et travaux, tout est rempli !' },
    { sprechen: '[enthusiastic] Wartungsheft te prévient avant la prochaine échéance !' },
    { sprechen: '[excited] Et au moment de vendre, tout est sur la table : le carnet d\'entretien complet en PDF !' },
    { sprechen: '[delighted] Tout est là !' },
    { sprechen: '[excited] 25 francs par an. 30 jours d\'essai gratuit, sur wartungsheft point c h !', untertitel: '25 francs par an. 30 jours d\'essai gratuit, sur wartungsheft.ch !' },
  ]),
  it: [
    { sprechen: '[excited] Vuoi vendere la tua auto. [curious] L\'acquirente chiede: c\'è il libretto di manutenzione?', untertitel: 'Vuoi vendere la tua auto. L\'acquirente chiede: «C\'è il libretto di manutenzione?»' },
    { sprechen: '[sighs] E tu cerchi.' },
    { sprechen: '[excited] Da oggi non più: basta una foto della fattura! [enthusiastic] Officina, data, importo e lavori sono già compilati!' },
    { sprechen: '[enthusiastic] Wartungsheft ti avvisa prima della prossima scadenza!' },
    { sprechen: '[excited] E quando vendi, è tutto sul tavolo: il libretto di manutenzione completo in PDF!' },
    { sprechen: '[delighted] C\'è tutto!', untertitel: '«C\'è tutto!»' },
    { sprechen: '[excited] 25 franchi all\'anno. Prova gratis per 30 giorni, su wartungsheft punto ci acca!', untertitel: '25 franchi all\'anno. Prova gratis per 30 giorni, su wartungsheft.ch!' },
  ],
  en: [
    { sprechen: '[excited] You want to sell your car. [curious] The buyer asks: is there a service book?', untertitel: 'You want to sell your car. The buyer asks: “Is there a service book?”' },
    { sprechen: '[sighs] And you start searching.' },
    { sprechen: '[excited] Not any more: a photo of the invoice is all it takes! [enthusiastic] Garage, date, amount and work, all filled in!' },
    { sprechen: '[enthusiastic] Wartungsheft reminds you before the next job is due!' },
    { sprechen: '[excited] And when you sell, everything\'s on the table: the complete service book as a PDF!' },
    { sprechen: '[delighted] It\'s all here!', untertitel: '“It\'s all here!”' },
    { sprechen: '[excited] 25 francs a year. Try it free for 30 days, at wartungsheft dot c h!', untertitel: '25 francs a year. Try it free for 30 days, at wartungsheft.ch!' },
  ],
}

const BETRIEB_TEXT: Record<Sprache, Text[]> = {
  de: [
    { sprechen: '[warm] Ein ganz normaler Montagmorgen im Betrieb. Welcher Lieferwagen muss zum Service?' },
    { sprechen: '[enthusiastic] Ein Blick auf die Übersicht, und schon ist klar: was ansteht, für jedes Fahrzeug!' },
    { sprechen: '[excited] Der Fahrer fotografiert die Werkstattrechnung. Erfasst ist sie damit auch!' },
    { sprechen: '[enthusiastic] Am Jahresende: Kosten pro Fahrzeug, als Datei für die Buchhaltung.' },
    { sprechen: '[delighted] Und die Frage vom Montagmorgen? Beantwortet sich selbst!' },
    { sprechen: '[excited] 36 Franken pro Fahrzeug und Jahr. 30 Tage gratis testen!' },
  ],
  fr: franzTexte([
    { sprechen: '[warm] Un lundi matin comme les autres dans l\'entreprise. Quelle camionnette doit passer au service ?' },
    { sprechen: '[enthusiastic] Un coup d\'œil sur l\'aperçu, et tout est clair : ce qui est à faire, pour chaque véhicule !' },
    { sprechen: '[excited] Le chauffeur photographie la facture du garage. Et elle est déjà saisie !' },
    { sprechen: '[enthusiastic] En fin d\'année : les coûts par véhicule, en fichier pour la comptabilité.' },
    { sprechen: '[delighted] Et la question du lundi matin ? Elle se règle toute seule !' },
    { sprechen: '[excited] 36 francs par véhicule et par an. 30 jours d\'essai gratuit !' },
  ]),
  it: [
    { sprechen: '[warm] Un lunedì mattina come tanti in azienda. Quale furgone deve andare in officina?' },
    { sprechen: '[enthusiastic] Uno sguardo alla panoramica, ed è tutto chiaro: cosa è in scadenza, per ogni veicolo!' },
    { sprechen: '[excited] L\'autista fotografa la fattura dell\'officina. Ed è già registrata!' },
    { sprechen: '[enthusiastic] A fine anno: i costi per veicolo, in un file per la contabilità.' },
    { sprechen: '[delighted] E la domanda del lunedì mattina? Si risolve da sola!' },
    { sprechen: '[excited] 36 franchi per veicolo all\'anno. 30 giorni di prova gratuita!' },
  ],
  en: [
    { sprechen: '[warm] Just another Monday morning at the company. Which van is due for a service?' },
    { sprechen: '[enthusiastic] One look at the overview, and it\'s all clear: what\'s coming up, for every vehicle!' },
    { sprechen: '[excited] The driver snaps a photo of the garage invoice. And it\'s already recorded!' },
    { sprechen: '[enthusiastic] At year end: costs per vehicle, as a file for the accountant.' },
    { sprechen: '[delighted] And Monday\'s question? It answers itself!' },
    { sprechen: '[excited] 36 francs per vehicle per year. Try it free for 30 days!' },
  ],
}

/**
 * Tutorial (Drehbuch video-scripts/tutorial-video-script.md), nur deutsch und hochkant, Clips aus
 * e2e/video/tutorial.video.ts. Jede Szene ist in Teile mit eigenem Satz zerlegt; `ab` ist eine Marke der Aufnahme
 * (marken.json), ein Teil läuft bis zur Marke des nächsten Teils im selben Clip. `bogen`: Stelle (Anteil des Teils)
 * für das Standbild der Szene im Kontaktbogen.
 */
interface TutorialTeil { szene: number, clip: string, ab?: string, text: string, hoch?: Blick, bogen?: number }
const TUTORIAL: TutorialTeil[] = [
  { szene: 1, clip: 'tutorial-1-fahrzeug-anlegen', ab: 'uebersicht', text: '[warm] So startest du mit Wartungsheft, in ein paar Minuten. Zuerst «Fahrzeug hinzufügen».' },
  { szene: 1, clip: 'tutorial-1-fahrzeug-anlegen', ab: 'formular', text: 'Am schnellsten geht es mit «Fahrzeugausweis fotografieren»: Die App füllt Marke, Modell und Kontrollschild aus.', bogen: 0.85 },
  { szene: 1, clip: 'tutorial-1-fahrzeug-anlegen', ab: 'selbst', text: 'Du kannst die Felder auch selbst ausfüllen. Dann «Speichern».' },
  { szene: 2, clip: 'tutorial-2-erste-werkstattrechnung', ab: 'checkliste', text: '[enthusiastic] Jetzt der wichtigste Schritt: die erste Werkstattrechnung. Auf der Fahrzeugseite tippst du auf «Rechnung fotografieren» und fotografierst den Beleg.', bogen: 0.2 },
  { szene: 2, clip: 'tutorial-2-erste-werkstattrechnung', ab: 'gelesen', text: '[warm] Die KI liest Werkstatt, Datum, Kilometerstand, Betrag und die einzelnen Arbeiten heraus. Du prüfst kurz, dann «1 Rechnung speichern».' },
  { szene: 2, clip: 'tutorial-2-erste-werkstattrechnung', ab: 'plan', text: 'Aus jeder Arbeit wird eine Wartung, und Wartungsheft rechnet aus, wann sie das nächste Mal fällig ist.' },
  { szene: 3, clip: 'tutorial-3-checkliste-einrichten', ab: 'checkliste', text: '[warm] Die Checkliste «Einrichten» zeigt, was noch fehlt: Fahrzeugausweis, Serviceheft, letzte Wartungen. Jeder Schritt ist freiwillig, du kannst ihn später machen oder überspringen.', hoch: { x: 0.5, y: 0.5, s: 1.3 }, bogen: 0.3 },
  { szene: 4, clip: 'tutorial-4-faelligkeit-und-erinnerung', ab: 'uebersicht', text: '[warm] Wird eine Arbeit fällig, steht sie in der Übersicht, und Wartungsheft schickt dir eine E-Mail.', bogen: 0.7 },
  { szene: 4, clip: 'tutorial-4-faelligkeit-und-erinnerung', ab: 'erledigt', text: 'Ist sie gemacht, tippst du auf «Erledigt eintragen». Datum und Kilometerstand sind schon ausgefüllt, nur noch «Speichern».' },
  { szene: 5, clip: 'tutorial-5-hilfe-und-rueckmeldung', ab: 'uebersicht', text: '[warm] Noch Fragen? Im Menü findest du «Hilfe» und «Fehler melden oder Wunsch». Dort kannst du auch eine Sprachnachricht aufnehmen.', bogen: 0.45 },
  { szene: 5, clip: 'tutorial-6-schlussbild', text: '' },
]
/** Stumme Fassung: geschätztes Sprechtempo statt Sprecheraufnahme */
const WOERTER_PRO_SEKUNDE = 2.3

/** Bild und Text zusammen, die Clips mit dem Sprachkürzel der Aufnahme (szene-…-fr) */
function film(bilder: Bild[], texte: Text[], sprache: Sprache): Abschnitt[] {
  return bilder.map((b, i) => ({ ...b, ...texte[i]!, clip: filmName(b.clip, sprache) }))
}

/** Kurzfassungen: Problem, Beweis, Angebot; dieselben Sprecheraufnahmen, keine neuen Credits */
function kurz(abschnitte: Abschnitt[], wahl: [index: number, minimum: number][]): Abschnitt[] {
  return wahl.map(([i, minimum]) => ({ ...abschnitte[i]!, minimum }))
}
const KURZ_PRIVAT: [number, number][] = [[1, 3], [2, 6], [6, 4.5]]
const KURZ_BETRIEB: [number, number][] = [[0, 4], [1, 5], [5, 4.5]]

const FORMATE = {
  quer: { w: 1920, h: 1080, suffix: '-desktop' },
  hoch: { w: 1080, h: 1920, suffix: '' },
} as const
type Format = keyof typeof FORMATE

// ---------- Werkzeuge ----------

/** ffmpeg des Systems; bei einem Fehler mit dem Ende der Meldung */
function ffmpegMessen(args: string[]): string {
  try {
    execFileSync('ffmpeg', ['-hide_banner', '-nostdin', ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 })
    return ''
  }
  catch (e) {
    throw new Error(`ffmpeg: ${(e as { stderr?: string }).stderr?.slice(-2000)}`)
  }
}

function stderrVon(args: string[]): string {
  const r = execFileSync('bash', ['-c', 'ffmpeg -hide_banner -nostdin "$@" 2>&1 >/dev/null', '--', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return r
}

/** ffmpeg mit libx264: im Docker-Image von HyperFrames, Repo unter demselben Pfad eingehängt */
function ffmpegX264(args: string[]): void {
  execFileSync('docker', ['run', '--rm', '--user', `${process.getuid!()}:${process.getgid!()}`, '-v', `${REPO}:${REPO}`, '-w', REPO, '--entrypoint', 'ffmpeg', DOCKER_BILD, '-hide_banner', '-nostdin', '-v', 'error', '-y', ...args], { stdio: ['ignore', 'inherit', 'inherit'] })
}

function dauer(datei: string): number {
  return Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', datei], { encoding: 'utf8' }).trim())
}

function stillen(datei: string): Zeitraum[] {
  const log = stderrVon(['-i', datei, '-af', 'silencedetect=noise=-40dB:d=0.15', '-f', 'null', '-'])
  const ergebnis: Zeitraum[] = []
  let von: number | undefined
  for (const zeile of log.split('\n')) {
    const s = zeile.match(/silence_start: ([\d.]+)/)
    const e = zeile.match(/silence_end: ([\d.]+)/)
    if (s)
      von = Number(s[1])
    if (e && von !== undefined) {
      ergebnis.push({ von, bis: Number(e[1]) })
      von = undefined
    }
  }
  if (von !== undefined)
    ergebnis.push({ von, bis: dauer(datei) })
  return ergebnis
}

function lautheitsSpanne(datei: string): number {
  const log = stderrVon(['-i', datei, '-af', 'ebur128', '-f', 'null', '-'])
  const lra = log.match(/LRA:\s+([\d.]+) LU/g)?.at(-1)
  return lra ? Number(lra.match(/[\d.]+/)![0]) : 0
}

function jsonLesen<T>(pfad: string, standard: T): T {
  return existsSync(pfad) ? JSON.parse(readFileSync(pfad, 'utf8')) as T : standard
}

// ---------- Sprecher ----------

/**
 * Je Sprechertext zwei Durchläufe (eleven_v3 betont jedes Mal anders), messen, den besseren in
 * video-scripts/sprecher-auswahl.json festhalten. Liegt video-out/sprecher/whisper.json vor (Transkripte je Datei),
 * zählen falsch gehörte Wörter mit. Fehlt dort ein Transkript eines neuen Texts, bleibt die Wahl offen (erst
 * Spracherkennung laufen lassen, Skill `werbefilm`). Ohne ElevenLabs-Schlüssel spricht Piper, ein Durchlauf.
 */
async function sprecherWaehlen(texte: { text: string, sprache: Sprache }[]): Promise<Record<string, number>> {
  const deps = sprecherDeps()
  const auswahl = jsonLesen<Record<string, number>>(AUSWAHL, {})
  const whisper = jsonLesen<Record<string, string>>(WHISPER, {})
  if (!deps.schluessel) {
    console.warn('Kein ElevenLabs-Schlüssel (~/.config/elevenlabs/key): Piper spricht')
    return {}
  }
  let geaendert = false
  const gesehen = new Set<string>()
  for (const { text, sprache } of texte) {
    if (gesehen.has(text))
      continue
    gesehen.add(text)
    const dateien: string[] = []
    for (const n of durchlaeufe(auswahl[text]))
      dateien.push(await sprechen(text, n, deps, sprache))
    if (auswahl[text])
      continue
    if (dateien.some(d => whisper[basename(d)] === undefined)) {
      console.warn(`Spracherkennung fehlt, Wahl offen (Durchlauf 1): ${dateien.map(d => basename(d)).join(' ')} «${ohneRegie(text)}»`)
      continue
    }
    const messungen = dateien.map((d) => {
      const st = stillen(d)
      const lang = dauer(d)
      const innen = st.filter(s => s.von > 0.05 && s.bis < lang - 0.05)
      const erkannt = whisper[basename(d)]
      return {
        laengsteStille: Math.max(0, ...innen.map(s => s.bis - s.von)),
        lautheitsSpanne: lautheitsSpanne(d),
        wortfehler: erkannt === undefined ? undefined : wortfehler(text, erkannt),
      }
    })
    auswahl[text] = besterDurchlauf(messungen) + 1
    console.log(`Durchlauf ${auswahl[text]} für «${ohneRegie(text)}»`, JSON.stringify(messungen))
    geaendert = true
  }
  // Geschützte Leerzeichen (Französisch) als Escape, sonst meldet ESLint unsichtbare Zeichen
  if (geaendert)
    writeFileSync(AUSWAHL, `${JSON.stringify(auswahl, null, 2).replace(/\u00A0/g, '\\u00a0')}\n`)
  return auswahl
}

// ---------- Plan ----------

interface Geplant {
  abschnitte: Abschnitt[]
  stimmen: string[]
  dauern: number[]
  starts: number[]
  laenge: number
  cues: Cue[]
  sprechzeiten: Zeitraum[]
}

async function planen(abschnitte: Abschnitt[], auswahl: Record<string, number>, sprache: Sprache): Promise<Geplant> {
  const deps = sprecherDeps()
  const stimmen: string[] = []
  const lagen: Cue[][] = []
  const dauern: number[] = []
  for (const a of abschnitte) {
    const stimme = await sprechen(a.sprechen, auswahl[a.sprechen] ?? 1, deps, sprache)
    const lang = dauer(stimme)
    const texte = saetze(a.untertitel ?? a.sprechen)
    const grenzen = satzGrenzen(texte, lang, stillen(stimme))
    lagen.push(grenzen.map((g, i) => ({ ...g, text: texte[i]! })))
    stimmen.push(stimme)
    dauern.push(abschnittDauer(grenzen.at(-1)!.bis, a.minimum, VORLAUF, NACHLAUF))
  }
  const { starts, laenge } = zeitplan(dauern, BLENDE)
  const ton = abschnitte.map((_, i) => ({ start: starts[i]!, vorlauf: VORLAUF, saetze: lagen[i]! }))
  const cues = untertitelSpur(ton, { nachhalten: 0.4, mindestens: 1.2 })
  const sprechzeiten = sprechzeitenZusammenfassen(ton.map(t => ({
    von: t.start + t.vorlauf + t.saetze[0]!.von,
    bis: t.start + t.vorlauf + t.saetze.at(-1)!.bis,
  })), 1.5)
  return { abschnitte, stimmen, dauern, starts, laenge, cues, sprechzeiten }
}

// ---------- Ton ----------

/** Stimme und Musik mischen, auf −16 LUFS bringen (zwei Durchgänge loudnorm) */
function tonMischen(p: Geplant, ziel: string): void {
  const roh = `${ziel}.roh.wav`
  const eingaben: string[] = []
  const filter: string[] = []
  p.stimmen.forEach((s, i) => {
    eingaben.push('-i', s)
    const ms = Math.round((p.starts[i]! + VORLAUF) * 1000)
    filter.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${ms}|${ms}[v${i}]`)
  })
  const n = p.stimmen.length
  const effekte = existsSync(SFX) ? effektZeiten(p.abschnitte, p.starts, p.dauern) : []
  if (!existsSync(SFX))
    console.warn(`Keine Effekte (${SFX})`)
  effekte.forEach((e, k) => {
    eingaben.push('-i', join(SFX, e.datei))
    const ms = Math.round(e.sekunde * 1000)
    filter.push(`[${n + k}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${e.pegel},adelay=${ms}|${ms}[e${k}]`)
  })
  filter.push(`${[...p.stimmen.map((_, i) => `[v${i}]`), ...effekte.map((_, k) => `[e${k}]`)].join('')}amix=inputs=${n + effekte.length}:normalize=0:duration=longest[stimme]`)
  let ausgang = '[stimme]'
  if (existsSync(MUSIK)) {
    eingaben.push('-stream_loop', '-1', '-i', MUSIK)
    const ende = p.laenge
    filter.push(`[${n + effekte.length}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:${ende},asetpts=PTS-STARTPTS,`
      + `volume='${musikAusdruck(p.sprechzeiten, MUSIK_PEGEL)}':eval=frame,afade=t=in:d=1,afade=t=out:st=${Math.max(0, ende - 2.5)}:d=2.5[musik]`)
    filter.push(`[stimme][musik]amix=inputs=2:normalize=0:duration=longest[mix]`)
    ausgang = '[mix]'
  }
  else {
    console.warn(`Keine Musik (${MUSIK}): Film nur mit Stimme`)
  }
  filter.push(`${ausgang}apad,atrim=0:${p.laenge}[aus]`)
  ffmpegMessen(['-y', ...eingaben, '-filter_complex', filter.join(';'), '-map', '[aus]', '-ar', '48000', roh])
  const log = stderrVon(['-i', roh, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'])
  const m = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1)) as Record<string, string>
  ffmpegMessen(['-y', '-i', roh, '-af', `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`, '-ar', '48000', ziel])
  rmSync(roh)
}

// ---------- Bild ----------

interface ClipInfo { liste: string, laenge: number, breite: number, hoehe: number }

function clipInfo(name: string): ClipInfo {
  const liste = join(ROH, name, 'liste.txt')
  if (!existsSync(liste))
    throw new Error(`fehlt: ${liste} (zuerst npm run video)`)
  const zeilen = readFileSync(liste, 'utf8').split('\n')
  const laenge = zeilen.filter(z => z.startsWith('duration ')).reduce((s, z) => s + Number(z.slice(9)), 0)
  const erstes = zeilen[0]!.match(/^file '(.+)'$/)![1]!
  const [breite, hoehe] = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', erstes], { encoding: 'utf8' }).trim().split(',').map(Number)
  return { liste, laenge, breite: breite!, hoehe: hoehe! }
}

/** Bild ohne Untertitel und Ton: Abschnitte zuschneiden, skalieren, überblenden. Schwerster Schritt (4K-Quellen) */
function bildBauen(p: Geplant, format: Format, ziel: string): void {
  const f = FORMATE[format]
  const eingaben: string[] = []
  const filter: string[] = []
  p.abschnitte.forEach((a, i) => {
    const info = clipInfo(`${a.clip}${f.suffix}`)
    const d = p.dauern[i]!
    let start = startInAufnahme(a, info.laenge)
    // Passt der Ausschnitt nicht in die Aufnahme, rückt der Start vor; reicht sie trotzdem nicht, steht das letzte Bild
    if (start + d > info.laenge)
      start = Math.max(0, info.laenge - d)
    eingaben.push('-f', 'concat', '-safe', '0', '-i', info.liste)
    let kette = `[${i}:v]fps=30,trim=start=${start.toFixed(3)},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${(d + 1).toFixed(3)},`
      + `trim=duration=${d.toFixed(3)},${ausschnitt(info.breite, info.hoehe, a[format], f.w, f.h, d)},scale=${f.w}:${f.h}:flags=lanczos,setsar=1,format=yuv420p`
    if (i === 0)
      kette += ',fade=t=in:st=0:d=0.4'
    if (i === p.abschnitte.length - 1)
      kette += `,fade=t=out:st=${(d - 0.6).toFixed(3)}:d=0.6`
    filter.push(`${kette}[s${i}]`)
  })
  let vorher = '[s0]'
  for (let k = 1; k < p.abschnitte.length; k++) {
    const aus = k === p.abschnitte.length - 1 ? '[bild]' : `[x${k}]`
    filter.push(`${vorher}[s${k}]xfade=transition=fade:duration=${BLENDE}:offset=${p.starts[k]!.toFixed(3)}${aus}`)
    vorher = aus
  }
  ffmpegX264([...eingaben, '-filter_complex', filter.join(';'), '-map', '[bild]', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '12', '-pix_fmt', 'yuv420p', ziel])
}

// ---------- Untertitel-Kästen ----------

interface Kasten { datei: string, x: number, y: number, cue: Cue }

const KASTEN_STIL: Record<Format, string> = {
  quer: 'left:96px;bottom:72px;max-width:1500px;font-size:40px;padding:22px 34px;border-left-width:8px;',
  hoch: 'left:56px;right:56px;bottom:170px;font-size:44px;padding:24px 32px;border-left-width:8px;',
}

/** Kästen wie im Plugin-Film: weiss, Farbrand in Wartungsheft-Grün, IBM Plex Sans; als PNG mit Alpha */
async function kaestenRendern(cues: Cue[], format: Format, ordner: string): Promise<Kasten[]> {
  const f = FORMATE[format]
  const schrift = readFileSync(SCHRIFT).toString('base64')
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 })
  const kaesten: Kasten[] = []
  for (const [i, cue] of cues.entries()) {
    const text = cue.text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    await page.setContent(`<style>
      @font-face { font-family: Plex; font-weight: 600; src: url(data:font/woff2;base64,${schrift}) format('woff2'); }
      html, body { margin: 0; background: transparent; }
      .ut { position: absolute; ${KASTEN_STIL[format]} box-sizing: border-box; background: #fff; color: #16202b;
        border: 1.5px solid #d5dde4; border-left: 8px solid #059669; border-radius: 12px;
        font-family: Plex, sans-serif; font-weight: 600; line-height: 1.3; }
    </style><div class="ut">${text}</div>`)
    await page.evaluate(() => document.fonts.ready)
    const el = page.locator('.ut')
    const box = (await el.boundingBox())!
    const datei = join(ordner, `kasten-${format}-${i}.png`)
    await el.screenshot({ path: datei, omitBackground: true })
    kaesten.push({ datei, x: Math.round(box.x), y: Math.round(box.y), cue })
  }
  await browser.close()
  return kaesten
}

/** Eingaben und Filter, die die Kästen über das Bild legen (weich ein- und ausgeblendet) */
function kaestenFilter(kaesten: Kasten[], ersterIndex: number): { eingaben: string[], filter: string } {
  const eingaben: string[] = []
  const teile: string[] = []
  let vorher = '[0:v]'
  kaesten.forEach((k, i) => {
    const n = ersterIndex + i
    const { von, bis } = k.cue
    eingaben.push('-loop', '1', '-framerate', '30', '-t', (bis + 0.1).toFixed(3), '-i', k.datei)
    const aus = i === kaesten.length - 1 ? '[mitkasten]' : `[k${i}]`
    teile.push(`[${n}:v]format=rgba,fade=t=in:st=${von.toFixed(3)}:d=0.25:alpha=1,fade=t=out:st=${(bis - 0.25).toFixed(3)}:d=0.25:alpha=1[p${i}]`)
    teile.push(`${vorher}[p${i}]overlay=${k.x}:${k.y}:eof_action=pass:format=auto${aus}`)
    vorher = aus
  })
  return { eingaben, filter: `${teile.join(';')};[mitkasten]format=yuv420p[v]` }
}

// ---------- Ausgabe ----------

/**
 * Website- oder Social-Fassung: MP4 (H.264 High, faststart, für Safari/iPhone) und WebM (VP9 Profil 0). Social
 * brennt die Kästen ein; die Website bekommt keine (`kaesten` leer), dort laufen die Untertitel als WebVTT-Spur.
 */
function webFassung(bild: string, ton: string, kaesten: Kasten[], ziel: string): void {
  const { eingaben, filter } = kaesten.length ? kaestenFilter(kaesten, 2) : { eingaben: [], filter: '[0:v]format=yuv420p[v]' }
  const gemeinsam = ['-i', bild, '-i', ton, ...eingaben, '-filter_complex', filter, '-map', '[v]', '-map', '1:a']
  ffmpegX264([...gemeinsam, '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-profile:v', 'high', '-level', '4.1', '-pix_fmt', 'yuv420p', '-g', '60', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-movflags', '+faststart', `${ziel}.mp4`])
  ffmpegMessen(['-v', 'error', '-y', ...gemeinsam, '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '4', '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-b:a', '96k', `${ziel}.webm`])
}

function youtubeFassung(bild: string, ton: string, cues: Cue[], ziel: string): void {
  ffmpegX264(['-i', bild, '-i', ton, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-g', '60', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', `${ziel}.mp4`])
  writeFileSync(`${ziel}.srt`, srt(cues))
}

function poster(film: string, sekunde: number): void {
  ffmpegMessen(['-v', 'error', '-y', '-ss', sekunde.toFixed(2), '-i', `${film}.mp4`, '-frames:v', '1', '-q:v', '3', `${film}-poster.jpg`])
}

function bericht(datei: string): void {
  const info = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height', '-show_entries', 'format=duration,size', '-of', 'compact=p=0:nk=1', datei], { encoding: 'utf8' })
  console.log(`${datei.replace(`${REPO}/`, '')}: ${info.trim().split('\n').join(' · ')}`)
}

async function filmBauen(name: string, abschnitte: Abschnitt[], auswahl: Record<string, number>, sprache: Sprache): Promise<void> {
  const tmp = join(TMP, name)
  rmSync(tmp, { recursive: true, force: true })
  mkdirSync(tmp, { recursive: true })
  const p = await planen(abschnitte, auswahl, sprache)
  const ton = join(tmp, 'ton.wav')
  tonMischen(p, ton)
  // Poster aus dem dritten Abschnitt: die App mitten in der Arbeit
  const posterZeit = p.starts[2]! + 3
  // Untertitel als abschaltbare Spur statt eingebrannt (LandingVideo.vue), eine Datei für beide Formate
  writeFileSync(join(PUBLIC, `film-${name}.vtt`), vtt(p.cues))
  for (const format of ['quer', 'hoch'] as const) {
    const bild = join(tmp, `bild-${format}.mkv`)
    bildBauen(p, format, bild)
    const ziel = join(PUBLIC, `film-${name}${FORMATE[format].suffix}`)
    webFassung(bild, ton, [], ziel)
    poster(ziel, posterZeit)
    bericht(`${ziel}.mp4`)
    bericht(`${ziel}.webm`)
    if (format === 'quer') {
      youtubeFassung(bild, ton, p.cues, join(OUT, `youtube-${name}`))
      bericht(join(OUT, `youtube-${name}.mp4`))
    }
  }
  rmSync(tmp, { recursive: true, force: true })
}

async function kurzfassungBauen(name: string, abschnitte: Abschnitt[], auswahl: Record<string, number>, sprache: Sprache): Promise<void> {
  const tmp = join(TMP, `social-${name}`)
  rmSync(tmp, { recursive: true, force: true })
  mkdirSync(tmp, { recursive: true })
  const p = await planen(abschnitte, auswahl, sprache)
  const ton = join(tmp, 'ton.wav')
  tonMischen(p, ton)
  const bild = join(tmp, 'bild-hoch.mkv')
  bildBauen(p, 'hoch', bild)
  const ziel = join(OUT, `social-${name}`)
  webFassung(bild, ton, await kaestenRendern(p.cues, 'hoch', tmp), ziel)
  bericht(`${ziel}.mp4`)
  rmSync(tmp, { recursive: true, force: true })
}

/** Plan des stummen Tutorials: Teile ab ihren Marken, Länge aus Wortzahl oder Clip, Untertitel über die Szene verteilt */
function tutorialPlanen(): Geplant {
  const abschnitte: Abschnitt[] = []
  const dauern: number[] = []
  const lagen: Cue[][] = []
  TUTORIAL.forEach((t, i) => {
    const info = clipInfo(t.clip)
    const marken = jsonLesen<Record<string, number>>(join(ROH, t.clip, 'marken.json'), {})
    const marke = (name: string): number => {
      if (marken[name] === undefined)
        throw new Error(`Marke «${name}» fehlt in ${t.clip}/marken.json (Aufnahme e2e/video/tutorial.video.ts)`)
      return marken[name]
    }
    const start = t.ab ? marke(t.ab) : 0.3
    const naechster = TUTORIAL[i + 1]
    const ende = naechster?.clip === t.clip && naechster.ab ? marke(naechster.ab) : info.laenge
    const lage = stummeLage(t.text, ende - start, { woerterProSekunde: WOERTER_PRO_SEKUNDE, vorlauf: VORLAUF, nachlauf: NACHLAUF })
    abschnitte.push({ clip: t.clip, start, minimum: 0, sprechen: t.text, ...(t.hoch ? { hoch: t.hoch } : {}) })
    dauern.push(lage.dauer)
    lagen.push(lage.saetze)
  })
  const { starts, laenge } = zeitplan(dauern, BLENDE)
  const cues = untertitelSpur(lagen.map((saetze, i) => ({ start: starts[i]!, vorlauf: VORLAUF, saetze })), { nachhalten: 0.4, mindestens: 1.2 })
  return { abschnitte, stimmen: [], dauern, starts, laenge, cues, sprechzeiten: [] }
}

/**
 * Stumme Fassung des Tutorials zur Freigabe von Bild und Text: Sprechertext als abschaltbare Untertitelspur (nie
 * eingebrannt), keine Tonspur, kein Sprecher (keine Credits). Dazu ein Kontaktbogen mit einem Standbild je Szene.
 */
function tutorialStummBauen(): void {
  const tmp = join(TMP, 'tutorial-stumm')
  rmSync(tmp, { recursive: true, force: true })
  mkdirSync(tmp, { recursive: true })
  const p = tutorialPlanen()
  const bild = join(tmp, 'bild-hoch.mkv')
  bildBauen(p, 'hoch', bild)
  // Untertitel nie eingebrannt: abschaltbare Spur in der MP4, VTT und SRT daneben
  const fassung = stummeFassung(bild, join(OUT, 'tutorial-stumm'), p.cues)
  for (const [datei, inhalt] of Object.entries(fassung.dateien))
    writeFileSync(datei, inhalt)
  ffmpegX264(fassung.ffmpeg)
  const ziel = join(OUT, 'tutorial-stumm.mp4')
  bericht(ziel)
  // Kontaktbogen: je Szene das Bild an der Stelle `bogen` ihres Teils, nebeneinander
  const zeiten = TUTORIAL.flatMap((t, i) => t.bogen === undefined ? [] : [p.starts[i]! + p.dauern[i]! * t.bogen])
  const bilder = zeiten.map((z, k) => {
    const datei = join(tmp, `bogen-${k}.png`)
    ffmpegMessen(['-v', 'error', '-y', '-ss', z.toFixed(2), '-i', ziel, '-frames:v', '1', '-vf', 'scale=432:768', datei])
    return datei
  })
  ffmpegMessen(['-v', 'error', '-y', ...bilder.flatMap(b => ['-i', b]), '-filter_complex', `${bilder.map((_, k) => `[${k}:v]`).join('')}hstack=inputs=${bilder.length}`, '-q:v', '3', join(OUT, 'tutorial-stumm-kontaktbogen.jpg')])
  console.log(`Kontaktbogen: Szenen bei ${zeiten.map(z => `${z.toFixed(1)} s`).join(', ')}`)
  rmSync(tmp, { recursive: true, force: true })
}

const ALLE_SPRACHEN: Sprache[] = ['de', 'fr', 'it', 'en']
const argumente = process.argv.slice(2)
const sprachen = ALLE_SPRACHEN.filter(s => argumente.includes(s))
const wahl = argumente.filter(a => !ALLE_SPRACHEN.includes(a as Sprache))
const alles = wahl.length === 0
const filme = (sprachen.length ? sprachen : ALLE_SPRACHEN).map(sprache => ({
  sprache,
  privat: film(PRIVAT_BILD, PRIVAT_TEXT[sprache], sprache),
  betrieb: film(BETRIEB_BILD, BETRIEB_TEXT[sprache], sprache),
}))
// Tutorial nur stumm: ohne Sprecher, darum vor der Sprecherwahl (kein ElevenLabs-Aufruf)
const auswahl = wahl.includes('tutorial') ? {} : await sprecherWaehlen(filme.flatMap(f => [...f.privat, ...f.betrieb].map(a => ({ text: a.sprechen, sprache: f.sprache }))))
if (wahl.includes('tutorial')) {
  tutorialStummBauen()
}
else if (!wahl.includes('sprecher')) {
  for (const f of filme) {
    if (alles || wahl.includes('privat'))
      await filmBauen(filmName('privat', f.sprache), f.privat, auswahl, f.sprache)
    if (alles || wahl.includes('betrieb'))
      await filmBauen(filmName('betrieb', f.sprache), f.betrieb, auswahl, f.sprache)
    if (alles || wahl.includes('social')) {
      await kurzfassungBauen(filmName('privat', f.sprache), kurz(f.privat, KURZ_PRIVAT), auswahl, f.sprache)
      await kurzfassungBauen(filmName('betrieb', f.sprache), kurz(f.betrieb, KURZ_BETRIEB), auswahl, f.sprache)
    }
  }
}
