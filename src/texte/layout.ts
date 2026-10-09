import type { AuthEntry } from '../lib/known-account'
import type { Sprache } from '../lib/sprache'

// Kopf, Fuss und Einstiegsknopf aller öffentlichen Seiten (LandingHeader, LandingFooter, useAuthEntry)
const de = {
  einstieg: { app: 'Zur Übersicht', login: 'Anmelden', trial: '30 Tage gratis testen' } as Record<AuthEntry, string>,
  /** Testknopf im Kopf: muss auf 390px neben Logo, Sprachwahl und «Anmelden» passen */
  kopfTrial: '30 Tage gratis testen',
  menue: {
    features: 'Features',
    ablauf: 'So funktioniert\'s',
    preise: 'Preise',
    betrieb: 'Für Betriebe',
    privat: 'Für Privathalter',
  },
  sprachwahl: 'Sprache',
  dunkel: 'Dunkles Design',
  fuss: {
    hinweis: 'Schweizer Server, KI in der EU. Deine Daten gehören dir: jederzeit exportieren, auf Wunsch löschen wir das Konto.',
    fragen: 'Fragen?',
    betrieb: 'Betriebe',
    privat: 'Privathalter',
    hilfe: 'Hilfe',
    ratgeber: 'Ratgeber',
    impressum: 'Impressum',
    datenschutz: 'Datenschutz',
    agb: 'AGB',
  },
  /** Auf den Übersetzungen: auch die App hinter der Anmeldung spricht diese Sprache */
  appSprache: '',
}

export default {
  de,
  fr: {
    einstieg: { app: 'Vers l’aperçu', login: 'Se connecter', trial: 'Essayer 30 jours gratuitement' },
    kopfTrial: 'Essai gratuit',
    menue: {
      features: 'Fonctions',
      ablauf: 'Comment ça marche',
      preise: 'Prix',
      betrieb: 'Pour les entreprises',
      privat: 'Pour les particuliers',
    },
    sprachwahl: 'Langue',
    dunkel: 'Thème sombre',
    fuss: {
      hinweis: 'Serveurs en Suisse, IA dans l’UE. Vos données vous appartiennent : exportables à tout moment, nous supprimons le compte sur demande.',
      fragen: 'Des questions ?',
      betrieb: 'Entreprises',
      privat: 'Particuliers',
      hilfe: 'Aide',
      ratgeber: 'Guide',
      impressum: 'Mentions légales',
      datenschutz: 'Confidentialité',
      agb: 'CG',
    },
    appSprache: 'L’application elle-même est aussi en français.',
  },
  it: {
    einstieg: { app: 'Alla panoramica', login: 'Accedi', trial: 'Prova gratis per 30 giorni' },
    kopfTrial: 'Prova gratis',
    menue: {
      features: 'Funzioni',
      ablauf: 'Come funziona',
      preise: 'Prezzi',
      betrieb: 'Per le aziende',
      privat: 'Per i privati',
    },
    sprachwahl: 'Lingua',
    dunkel: 'Tema scuro',
    fuss: {
      hinweis: 'Server in Svizzera, IA nell\'UE. I tuoi dati sono tuoi: esportabili in ogni momento, su richiesta cancelliamo l\'account.',
      fragen: 'Domande?',
      betrieb: 'Aziende',
      privat: 'Privati',
      hilfe: 'Aiuto',
      ratgeber: 'Guida',
      impressum: 'Note legali',
      datenschutz: 'Privacy',
      agb: 'CG',
    },
    appSprache: 'Anche l\'app stessa è in italiano.',
  },
  en: {
    einstieg: { app: 'To the overview', login: 'Sign in', trial: 'Try free for 30 days' },
    kopfTrial: 'Try free',
    menue: {
      features: 'Features',
      ablauf: 'How it works',
      preise: 'Pricing',
      betrieb: 'For businesses',
      privat: 'For private owners',
    },
    sprachwahl: 'Language',
    dunkel: 'Dark theme',
    fuss: {
      hinweis: 'Servers in Switzerland, AI in the EU. Your data belongs to you: export it any time, and we delete the account on request.',
      fragen: 'Questions?',
      betrieb: 'Businesses',
      privat: 'Private owners',
      hilfe: 'Help',
      ratgeber: 'Guide',
      impressum: 'Legal notice',
      datenschutz: 'Privacy',
      agb: 'Terms',
    },
    appSprache: 'The app itself is in English too.',
  },
} satisfies Record<Sprache, typeof de>
