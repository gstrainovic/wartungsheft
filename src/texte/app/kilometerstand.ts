import type { Sprache } from '../../lib/sprache'

// Kilometerstand nachführen (MileageDialog.vue)
const de = {
  titel: 'Kilometerstand',
  bisher: (fahrzeug: string, km: string) => `${fahrzeug}, bisher ${km} km.`,
  niedriger: 'Niedriger als bisher. Nur eintragen, wenn der alte Stand falsch war.',
}

export default {
  de,
  fr: {
    titel: 'Kilométrage',
    bisher: (fahrzeug: string, km: string) => `${fahrzeug}, jusqu'ici ${km} km.`,
    niedriger: 'Inférieur à l\'actuel. Ne saisis-le que si l\'ancien kilométrage était faux.',
  },
  it: {
    titel: 'Chilometraggio',
    bisher: (fahrzeug: string, km: string) => `${fahrzeug}, finora ${km} km.`,
    niedriger: 'Più basso di prima. Inseriscilo solo se il valore precedente era sbagliato.',
  },
  en: {
    titel: 'Mileage',
    bisher: (fahrzeug: string, km: string) => `${fahrzeug}, previously ${km} km.`,
    niedriger: 'Lower than before. Only enter it if the old reading was wrong.',
  },
} satisfies Record<Sprache, typeof de>
