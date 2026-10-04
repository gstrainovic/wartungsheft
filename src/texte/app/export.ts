import type { Sprache } from '../../lib/sprache'

// Jahresabschluss (services/year-export.ts), Datensicherung (db-export.ts) und Kontolöschung (account-delete.ts).
// Datei- und Ordnernamen ohne Akzente und Leerzeichen.
const de = {
  datei: {
    kosten: 'kosten',
    belege: 'belege',
    beleg: 'beleg',
    jahresabschluss: 'jahresabschluss',
  },
  formatUngueltig: 'Ungültiges Export-Format',
  offline: 'Offline: Zum Löschen des Kontos braucht es eine Verbindung.',
}

export default {
  de,
  fr: {
    datei: {
      kosten: 'couts',
      belege: 'justificatifs',
      beleg: 'justificatif',
      jahresabschluss: 'bouclement',
    },
    formatUngueltig: 'Format d\'exportation non valable',
    offline: 'Hors ligne : pour supprimer le compte, il faut une connexion.',
  },
  it: {
    datei: {
      kosten: 'costi',
      belege: 'giustificativi',
      beleg: 'giustificativo',
      jahresabschluss: 'chiusura-annuale',
    },
    formatUngueltig: 'Formato di esportazione non valido',
    offline: 'Offline: per eliminare l\'account serve una connessione.',
  },
  en: {
    datei: {
      kosten: 'costs',
      belege: 'receipts',
      beleg: 'receipt',
      jahresabschluss: 'year-end',
    },
    formatUngueltig: 'Invalid export format',
    offline: 'Offline: deleting the account needs a connection.',
  },
} satisfies Record<Sprache, typeof de>
