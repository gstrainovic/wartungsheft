import type { Sprache } from '../../lib/sprache'

// Fahrzeugliste (VehiclesPage.vue), Fahrzeugkarte (VehicleCard.vue) und Fahrzeuggrenze (services/vehicle-limit.ts)
const DE_ZAHLWOERTER = ['', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn']

const de = {
  titel: 'Fahrzeuge',
  hinzufuegen: 'Hinzufügen',
  keine: 'Keine Fahrzeuge',
  keineText: 'Füge dein erstes Fahrzeug hinzu.',
  fahrzeugHinzufuegen: 'Fahrzeug hinzufügen',
  verkaufte: (n: number) => `${n} ${n === 1 ? 'verkauftes Fahrzeug' : 'verkaufte Fahrzeuge'}`,
  neu: 'Neues Fahrzeug',
  karte: {
    ueberfaellig: (arbeit: string) => `${arbeit ? `${arbeit} ` : ''}überfällig`,
    baldFaellig: (arbeit: string) => `${arbeit ? `${arbeit} ` : ''}bald fällig`,
    keineWartung: 'Noch keine Wartung erfasst',
    ok: 'OK',
    imJahr: (betrag: string, jahr: number) => `${betrag} in ${jahr}`,
  },
  grenze: (max: number, preis: string, total: string, naechstes: number) =>
    `Dein Privatplan deckt ${max} ${max === 1 ? 'Fahrzeug' : 'Fahrzeuge'}. Ab dem ${max === 5 ? 'sechsten' : 'nächsten'} gilt der Betriebspreis: ${preis} pro Fahrzeug und Jahr, also ${total} für ${DE_ZAHLWOERTER[naechstes] ?? String(naechstes)}.`,
}

export default {
  de,
  fr: {
    titel: 'Véhicules',
    hinzufuegen: 'Ajouter',
    keine: 'Aucun véhicule',
    keineText: 'Ajoute ton premier véhicule.',
    fahrzeugHinzufuegen: 'Ajouter un véhicule',
    verkaufte: (n: number) => `${n} ${n === 1 ? 'véhicule vendu' : 'véhicules vendus'}`,
    neu: 'Nouveau véhicule',
    karte: {
      ueberfaellig: (arbeit: string) => arbeit ? `${arbeit} en retard` : 'En retard',
      baldFaellig: (arbeit: string) => arbeit ? `${arbeit} bientôt dû` : 'Bientôt dû',
      keineWartung: 'Aucun entretien saisi',
      ok: 'OK',
      imJahr: (betrag: string, jahr: number) => `${betrag} en ${jahr}`,
    },
    grenze: (max: number, preis: string, total: string, naechstes: number) =>
      `Ton plan Particulier couvre ${max} ${max === 1 ? 'véhicule' : 'véhicules'}. À partir du ${max === 5 ? 'sixième' : 'suivant'}, le tarif Entreprise s’applique : ${preis} par véhicule et par an, soit ${total} pour ${naechstes}.`,
  },
  it: {
    titel: 'Veicoli',
    hinzufuegen: 'Aggiungi',
    keine: 'Nessun veicolo',
    keineText: 'Aggiungi il tuo primo veicolo.',
    fahrzeugHinzufuegen: 'Aggiungi veicolo',
    verkaufte: (n: number) => `${n} ${n === 1 ? 'veicolo venduto' : 'veicoli venduti'}`,
    neu: 'Nuovo veicolo',
    karte: {
      ueberfaellig: (arbeit: string) => arbeit ? `${arbeit} scaduto` : 'Scaduto',
      baldFaellig: (arbeit: string) => arbeit ? `${arbeit} in scadenza` : 'In scadenza',
      keineWartung: 'Nessuna manutenzione registrata',
      ok: 'OK',
      imJahr: (betrag: string, jahr: number) => `${betrag} nel ${jahr}`,
    },
    grenze: (max: number, preis: string, total: string, naechstes: number) =>
      `Il tuo piano Privato copre ${max} ${max === 1 ? 'veicolo' : 'veicoli'}. Dal ${max === 5 ? 'sesto' : 'successivo'} vale il prezzo Azienda: ${preis} per veicolo e anno, quindi ${total} per ${naechstes}.`,
  },
  en: {
    titel: 'Vehicles',
    hinzufuegen: 'Add',
    keine: 'No vehicles',
    keineText: 'Add your first vehicle.',
    fahrzeugHinzufuegen: 'Add vehicle',
    verkaufte: (n: number) => `${n} sold ${n === 1 ? 'vehicle' : 'vehicles'}`,
    neu: 'New vehicle',
    karte: {
      ueberfaellig: (arbeit: string) => arbeit ? `${arbeit} overdue` : 'Overdue',
      baldFaellig: (arbeit: string) => arbeit ? `${arbeit} due soon` : 'Due soon',
      keineWartung: 'No maintenance recorded yet',
      ok: 'OK',
      imJahr: (betrag: string, jahr: number) => `${betrag} in ${jahr}`,
    },
    grenze: (max: number, preis: string, total: string, naechstes: number) =>
      `Your Private plan covers ${max} ${max === 1 ? 'vehicle' : 'vehicles'}. From the ${max === 5 ? 'sixth' : 'next'} one, the Business price applies: ${preis} per vehicle and year, so ${total} for ${naechstes}.`,
  },
} satisfies Record<Sprache, typeof de>
