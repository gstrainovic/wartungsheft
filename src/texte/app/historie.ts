import type { Sprache } from '../../lib/sprache'

// Hinweise zur Wartungshistorie in der Übergabemappe (services/service-record.ts)
const de = {
  keine: 'noch keine Wartungen erfasst',
  bis: (von: string, bis: string) => `${von} bis ${bis}`,
  nurEiner: 'nur ein Eintrag',
  luecke: (zeitraeume: string) => `Lücke ${zeitraeume}`,
  langeHer: 'letzter Eintrag liegt lange zurück',
}

export default {
  de,
  fr: {
    keine: 'aucun entretien saisi pour l\'instant',
    bis: (von: string, bis: string) => `${von} à ${bis}`,
    nurEiner: 'une seule entrée',
    luecke: (zeitraeume: string) => `lacune ${zeitraeume}`,
    langeHer: 'la dernière entrée remonte à longtemps',
  },
  it: {
    keine: 'nessuna manutenzione registrata finora',
    bis: (von: string, bis: string) => `${von} – ${bis}`,
    nurEiner: 'una sola voce',
    luecke: (zeitraeume: string) => `lacuna ${zeitraeume}`,
    langeHer: 'l\'ultima voce risale a molto tempo fa',
  },
  en: {
    keine: 'no maintenance recorded yet',
    bis: (von: string, bis: string) => `${von} to ${bis}`,
    nurEiner: 'only one entry',
    luecke: (zeitraeume: string) => `gap ${zeitraeume}`,
    langeHer: 'last entry was a long time ago',
  },
} satisfies Record<Sprache, typeof de>
