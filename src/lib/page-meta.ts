/**
 * Titel und Beschreibung pro öffentlicher Seite, einzige Quelle für den Kopf der HTML-Seite. Der Router setzt sie
 * im Browser (`applyMetaToDocument` in `page-meta-document.ts`), das Vite-Plugin in `vite.config.ts` schreibt beim Build `dist/<pfad>/index.html`
 * mit demselben Kopf, damit Crawler ohne JavaScript (search.ch, GPTBot) pro Seite den richtigen Titel sehen.
 * «Serviceheft» ist das geläufige Schweizer Wort (business-plan/05 Kanal 1), «Werkstattrechnung» statt «Garagenrechnung».
 * Jede Seite gibt es auch unter /fr, /it und /en (src/lib/sprache.ts); Sprache, kanonische Adresse und hreflang
 * kommen von hier. Bewusst ohne Browser- und Vite-Abhängigkeit, `vite.config.ts` importiert die Datei.
 */
import type { Sprache } from './sprache.ts'
import { alleFassungen, mitSprache, ohneSprache, spracheAusPfad, SPRACHEN, sprachTag } from './sprache.ts'

export interface PageMeta {
  title: string
  description: string
}

export const SITE_URL = 'https://wartungsheft.ch'

export const PAGE_META: Record<string, PageMeta> = {
  '/': {
    title: 'Wartungsheft: digitales Serviceheft und Servicebuch fürs Auto',
    // Ein Satz, der «Was ist wartungsheft.ch?» beantwortet: Suchmaschinen und KI-Antworten zitieren ihn.
    // «Servicebuch» sucht die Schweiz zwanzigmal häufiger als «Serviceheft» (business-plan/ads/keyword-analyse.md)
    description: 'Wartungsheft ist das digitale Servicebuch aus der Schweiz: Werkstattrechnung fotografieren, Serviceheft, Service und MFK im Blick. Ab 25 CHF im Jahr.',
  },
  '/privathalter': {
    title: 'Servicebuch und Serviceheft fürs Auto als App | Wartungsheft',
    description: 'Dein Servicebuch auf dem Handy: Werkstattrechnung fotografieren, Serviceheft lückenlos, Erinnerung vor Service und MFK. 25 CHF im Jahr.',
  },
  '/betrieb': {
    title: 'Fuhrpark-App: Serviceheft pro Firmenfahrzeug | Wartungsheft',
    description: 'Digitales Serviceheft für Firmenfahrzeuge: Werkstattrechnung fotografieren, Service und MFK pro Fahrzeug, Kosten für den Treuhänder. 36 CHF pro Fahrzeug.',
  },
  '/anlagen': {
    title: 'Wartungsplan für Liegenschaften und Anlagen | Wartungsheft',
    description: 'Wartungsintervalle und Prüffristen pro Objekt, Erinnerung per E-Mail, Rechnung fotografieren, Protokoll als PDF. 36 CHF pro Objekt und Jahr.',
  },
  '/hilfe': {
    title: 'Hilfe: digitales Serviceheft führen | Wartungsheft',
    description: 'So führst du dein Serviceheft mit Wartungsheft: Fahrzeug erfassen, Rechnung fotografieren, Intervalle hinterlegen, Kosten exportieren, Fahrzeug verkaufen.',
  },
}

export const PAGE_META_SPRACHEN: Record<Sprache, Record<string, PageMeta>> = {
  de: PAGE_META,
  fr: {
    '/': {
      title: 'Wartungsheft : carnet d’entretien numérique pour la voiture',
      description: 'Wartungsheft est le carnet d’entretien numérique suisse : photographiez la facture du garage, service et expertise sous contrôle. Dès 25 CHF par an.',
    },
    '/privathalter': {
      title: 'Carnet d’entretien de la voiture en app | Wartungsheft',
      description: 'Votre carnet d’entretien sur le téléphone : facture du garage en photo, historique complet, rappel avant le service et l’expertise. 25 CHF par an.',
    },
    '/betrieb': {
      title: 'App parc de véhicules : carnet d’entretien | Wartungsheft',
      description: 'Carnet d’entretien numérique des véhicules d’entreprise : facture en photo, service et expertise par véhicule, coûts pour la fiduciaire. 36 CHF par véhicule.',
    },
    '/anlagen': {
      title: 'Plan d’entretien pour immeubles et installations | Wartungsheft',
      description: 'Intervalles d’entretien et délais de contrôle par objet, rappel par e-mail, facture en photo, procès-verbal en PDF. 36 CHF par objet et par an.',
    },
    '/hilfe': {
      title: 'Aide : tenir un carnet d’entretien numérique | Wartungsheft',
      description: 'Tenir votre carnet d’entretien avec Wartungsheft : saisir un véhicule, photographier une facture, définir les intervalles, exporter les coûts, vendre.',
    },
  },
  it: {
    '/': {
      title: 'Wartungsheft: libretto di manutenzione digitale per l\'auto',
      description: 'Wartungsheft è il libretto di manutenzione digitale svizzero: fotografa la fattura dell\'officina, tieni d\'occhio servizio e collaudo. Da 25 CHF all\'anno.',
    },
    '/privathalter': {
      title: 'Libretto di manutenzione dell\'auto come app | Wartungsheft',
      description: 'Il tuo libretto di manutenzione sul telefono: fotografa la fattura, storico completo, promemoria prima del servizio e del collaudo. 25 CHF all\'anno.',
    },
    '/betrieb': {
      title: 'App parco veicoli: libretto per veicolo aziendale | Wartungsheft',
      description: 'Libretto di manutenzione digitale per veicoli aziendali: fattura in foto, servizio e collaudo per veicolo, costi per il fiduciario. 36 CHF per veicolo.',
    },
    '/anlagen': {
      title: 'Piano di manutenzione per immobili e impianti | Wartungsheft',
      description: 'Intervalli di manutenzione e scadenze dei controlli per oggetto, promemoria via e-mail, fattura in foto, verbale in PDF. 36 CHF per oggetto e anno.',
    },
    '/hilfe': {
      title: 'Aiuto: tenere il libretto di manutenzione | Wartungsheft',
      description: 'Come tenere il libretto con Wartungsheft: registrare un veicolo, fotografare una fattura, impostare gli intervalli, esportare i costi, vendere.',
    },
  },
  en: {
    '/': {
      title: 'Wartungsheft: digital service book for your car',
      description: 'Wartungsheft is the Swiss digital service book: photograph the garage invoice, keep servicing and the MFK inspection in view. From CHF 25 a year.',
    },
    '/privathalter': {
      title: 'Car service book as an app | Wartungsheft',
      description: 'Your service book on your phone: photograph the garage invoice, complete history, reminders before servicing and the MFK inspection. CHF 25 a year.',
    },
    '/betrieb': {
      title: 'Fleet app: service book per company vehicle | Wartungsheft',
      description: 'Digital service book for company vehicles: photograph the invoice, servicing and MFK per vehicle, costs for your accountant. CHF 36 per vehicle.',
    },
    '/anlagen': {
      title: 'Maintenance plan for buildings and equipment | Wartungsheft',
      description: 'Maintenance intervals and inspection deadlines per property, email reminders, photograph the invoice, report as PDF. CHF 36 per property and year.',
    },
    '/hilfe': {
      title: 'Help: keeping a digital service book | Wartungsheft',
      description: 'How to keep your service book with Wartungsheft: add a vehicle, photograph an invoice, set intervals, export costs, sell a vehicle.',
    },
  },
}

/** Jede öffentliche Seite in jeder Sprache, Deutsch zuerst: Vorrendern, Build und Sitemap */
export const OEFFENTLICHE_SEITEN = alleFassungen(Object.keys(PAGE_META))

export interface Alternate { hreflang: string, href: string }

export function pageMeta(path: string): PageMeta & { canonical: string, lang: string, alternates: Alternate[] } {
  const sprache = spracheAusPfad(path)
  const basis = ohneSprache(path)
  const known = PAGE_META_SPRACHEN[sprache][basis]
  const lang = sprachTag(sprache)
  if (!known)
    return { ...PAGE_META_SPRACHEN[sprache]['/']!, canonical: `${SITE_URL}${mitSprache(sprache, '/')}`, lang, alternates: [] }
  const alternates = [
    ...SPRACHEN.map(s => ({ hreflang: s.tag as string, href: `${SITE_URL}${mitSprache(s.code, basis)}` })),
    { hreflang: 'x-default', href: `${SITE_URL}${basis}` },
  ]
  return { ...known, canonical: `${SITE_URL}${mitSprache(sprache, basis)}`, lang, alternates }
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

function setTag(html: string, pattern: RegExp, tag: string): string {
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

export function applyMetaToHtml(html: string, path: string): string {
  const meta = pageMeta(path)
  const title = escapeAttr(meta.title)
  const description = escapeAttr(meta.description)
  let out = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
  out = out.replace(/<html lang="[^"]*"/, `<html lang="${meta.lang}"`)
  out = setTag(out, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`)
  out = setTag(out, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`)
  out = setTag(out, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`)
  out = setTag(out, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${meta.canonical}" />`)
  out = setTag(out, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${meta.canonical}" />`)
  out = out.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>/g, '')
  const alternates = meta.alternates.map(a => `    <link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />\n`).join('')
  return out.replace('</head>', `${alternates}  </head>`)
}
