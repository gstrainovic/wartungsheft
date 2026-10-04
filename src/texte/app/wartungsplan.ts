import type { Sprache } from '../../lib/sprache'

// Status und Terminbeschreibung des Wartungsplans (services/maintenance-schedule.ts), gleich in Dashboard,
// Fahrzeugseite und Erinnerungsmail.
const de = {
  status: {
    overdue: 'Überfällig',
    due: 'Bald fällig',
    unknown: 'Kein Eintrag',
    done: 'OK',
  },
  termin: (datum: string) => `Termin am ${datum}`,
  nieErfasst: 'noch nie erfasst',
  faelligSeit: 'fällig seit',
  faelligAm: 'fällig am',
  naechsteAm: 'nächste am',
  beiKm: (km: string) => `bei ${km} km`,
  oder: 'oder',
}

export default {
  de,
  fr: {
    status: {
      overdue: 'En retard',
      due: 'Bientôt dû',
      unknown: 'Aucune entrée',
      done: 'OK',
    },
    termin: (datum: string) => `Rendez-vous le ${datum}`,
    nieErfasst: 'jamais saisi',
    faelligSeit: 'en retard depuis',
    faelligAm: 'à faire le',
    naechsteAm: 'prochain le',
    beiKm: (km: string) => `à ${km} km`,
    oder: 'ou',
  },
  it: {
    status: {
      overdue: 'Scaduto',
      due: 'In scadenza',
      unknown: 'Nessuna registrazione',
      done: 'OK',
    },
    termin: (datum: string) => `Appuntamento il ${datum}`,
    nieErfasst: 'mai registrato',
    faelligSeit: 'scaduto dal',
    faelligAm: 'da fare il',
    naechsteAm: 'prossimo il',
    beiKm: (km: string) => `a ${km} km`,
    oder: 'o',
  },
  en: {
    status: {
      overdue: 'Overdue',
      due: 'Due soon',
      unknown: 'No entry',
      done: 'OK',
    },
    termin: (datum: string) => `Appointment on ${datum}`,
    nieErfasst: 'never recorded',
    faelligSeit: 'overdue since',
    faelligAm: 'due on',
    naechsteAm: 'next on',
    beiKm: (km: string) => `at ${km} km`,
    oder: 'or',
  },
} satisfies Record<Sprache, typeof de>
