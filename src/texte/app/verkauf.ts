import type { Sprache } from '../../lib/sprache'

// Verkauft oder abgegeben (components/SellVehicleDialog.vue, Vermerk aus services/vehicle-status.ts)
const de = {
  titel: 'Verkauft oder abgegeben',
  einleitung: 'verschwindet damit aus den Fälligkeiten und bekommt keine Erinnerungen mehr. Rechnungen, Wartungen und Kosten bleiben erhalten, auch in den Exporten und im Dossier.',
  datum: 'Datum der Übergabe',
  kilometerstand: 'Kilometerstand',
  kmBeiUebergabe: 'Kilometerstand bei der Übergabe',
  tipp: 'Tipp: Das PDF-Dossier im Tab «Kosten» ist die Übergabemappe für den Käufer.',
  eintragen: 'Als verkauft eintragen',
  vermerk: {
    uebergabeAm: (datum: string) => `Übergabe am ${datum}`,
    verkauftAm: (datum: string) => `Verkauft am ${datum}`,
    verkauftAmBei: (datum: string, km: string) => `Verkauft am ${datum} bei ${km} km`,
  },
}

export default {
  de,
  fr: {
    titel: 'Vendu ou cédé',
    einleitung: 'disparaît ainsi des échéances et ne reçoit plus de rappels. Les factures, les entretiens et les coûts sont conservés, aussi dans les exports et le dossier.',
    datum: 'Date de remise',
    kilometerstand: 'Kilométrage',
    kmBeiUebergabe: 'Kilométrage à la remise',
    tipp: 'Astuce : le dossier PDF de l’onglet « Coûts » sert de dossier de remise pour l’acheteur.',
    eintragen: 'Marquer comme vendu',
    vermerk: {
      uebergabeAm: (datum: string) => `Remise le ${datum}`,
      verkauftAm: (datum: string) => `Vendu le ${datum}`,
      verkauftAmBei: (datum: string, km: string) => `Vendu le ${datum} à ${km} km`,
    },
  },
  it: {
    titel: 'Venduto o ceduto',
    einleitung: 'sparisce così dalle scadenze e non riceve più promemoria. Fatture, manutenzioni e costi restano conservati, anche negli export e nel dossier.',
    datum: 'Data della consegna',
    kilometerstand: 'Chilometraggio',
    kmBeiUebergabe: 'Chilometraggio alla consegna',
    tipp: 'Consiglio: il dossier PDF nella scheda «Costi» è la cartella di consegna per l\'acquirente.',
    eintragen: 'Segna come venduto',
    vermerk: {
      uebergabeAm: (datum: string) => `Consegna il ${datum}`,
      verkauftAm: (datum: string) => `Venduto il ${datum}`,
      verkauftAmBei: (datum: string, km: string) => `Venduto il ${datum} a ${km} km`,
    },
  },
  en: {
    titel: 'Sold or handed over',
    einleitung: 'will no longer appear in the due list and gets no more reminders. Invoices, maintenance and costs are kept, including in the exports and the dossier.',
    datum: 'Handover date',
    kilometerstand: 'Mileage',
    kmBeiUebergabe: 'Mileage at handover',
    tipp: 'Tip: the PDF dossier in the «Costs» tab is the handover folder for the buyer.',
    eintragen: 'Mark as sold',
    vermerk: {
      uebergabeAm: (datum: string) => `Handover on ${datum}`,
      verkauftAm: (datum: string) => `Sold on ${datum}`,
      verkauftAmBei: (datum: string, km: string) => `Sold on ${datum} at ${km} km`,
    },
  },
} satisfies Record<Sprache, typeof de>
