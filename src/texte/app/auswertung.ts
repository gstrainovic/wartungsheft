import type { Sprache } from '../../lib/sprache'

// CSV-Export der Rechnungen (services/report.ts)
const de = {
  csv: {
    fahrzeug: 'Fahrzeug',
    kontrollschild: 'Kennzeichen',
    datum: 'Datum',
    werkstatt: 'Werkstatt',
    kilometerstand: 'Kilometerstand',
    kategorie: 'Kategorie',
    beschreibung: 'Beschreibung',
    betrag: 'Betrag',
    waehrung: 'Währung',
    kurs: 'Kurs',
  },
  differenz: 'Differenz zum Rechnungstotal',
}

export default {
  de,
  fr: {
    csv: {
      fahrzeug: 'Véhicule',
      kontrollschild: 'Plaque',
      datum: 'Date',
      werkstatt: 'Garage',
      kilometerstand: 'Kilométrage',
      kategorie: 'Catégorie',
      beschreibung: 'Description',
      betrag: 'Montant',
      waehrung: 'Monnaie',
      kurs: 'Cours',
    },
    differenz: 'Différence avec le total de la facture',
  },
  it: {
    csv: {
      fahrzeug: 'Veicolo',
      kontrollschild: 'Targa',
      datum: 'Data',
      werkstatt: 'Officina',
      kilometerstand: 'Chilometraggio',
      kategorie: 'Categoria',
      beschreibung: 'Descrizione',
      betrag: 'Importo',
      waehrung: 'Valuta',
      kurs: 'Cambio',
    },
    differenz: 'Differenza rispetto al totale della fattura',
  },
  en: {
    csv: {
      fahrzeug: 'Vehicle',
      kontrollschild: 'Number plate',
      datum: 'Date',
      werkstatt: 'Garage',
      kilometerstand: 'Mileage',
      kategorie: 'Category',
      beschreibung: 'Description',
      betrag: 'Amount',
      waehrung: 'Currency',
      kurs: 'Rate',
    },
    differenz: 'Difference to the invoice total',
  },
} satisfies Record<Sprache, typeof de>
