import type { Sprache } from '../../lib/sprache'

// Einrichtungs-Checkliste pro Fahrzeug (services/vehicle-setup.ts, components/SetupChecklist.vue)
const de = {
  titel: 'Einrichten',
  bereich: 'Einrichtung',
  zaehler: (fertig: number, alle: number) => `${fertig} von ${alle}`,
  ausblenden: 'Ausblenden',
  felder: {
    kontrollschild: 'Kontrollschild',
    fahrgestellnummer: 'Fahrgestellnummer',
    baujahr: 'Baujahr',
  },
  fehltNoch: (felder: string) => `Fehlt noch: ${felder}`,
  ausweis: {
    label: 'Fahrzeugausweis',
    action: 'Fahrzeugausweis fotografieren',
    vollstaendig: 'Stammdaten vollständig',
  },
  serviceheft: {
    label: 'Serviceheft',
    action: 'Serviceheft fotografieren',
    hint: 'Intervalle des Herstellers und Stempel, damit die Termine für genau dieses Fahrzeug stimmen',
  },
  wartungen: {
    label: 'Letzte Wartungen',
    action: 'Letzte Wartungen eintragen',
    hint: 'Wann wurden Service, Öl und MFK zuletzt gemacht? Ohne das gibt es keine Erinnerung',
  },
  rechnungen: {
    label: 'Rechnungen',
    action: 'Rechnung fotografieren',
    hint: 'Werkstattrechnungen für Kosten und lückenlose Historie',
  },
}

export default {
  de,
  fr: {
    titel: 'Configurer',
    bereich: 'Configuration',
    zaehler: (fertig: number, alle: number) => `${fertig} sur ${alle}`,
    ausblenden: 'Masquer',
    felder: {
      kontrollschild: 'plaque',
      fahrgestellnummer: 'numéro de châssis',
      baujahr: 'année de construction',
    },
    fehltNoch: (felder: string) => `Il manque encore : ${felder}`,
    ausweis: {
      label: 'Permis de circulation',
      action: 'Photographier le permis de circulation',
      vollstaendig: 'Données du véhicule complètes',
    },
    serviceheft: {
      label: 'Carnet d\'entretien',
      action: 'Photographier le carnet d\'entretien',
      hint: 'Intervalles du constructeur et tampons, pour que les échéances correspondent exactement à ce véhicule',
    },
    wartungen: {
      label: 'Derniers entretiens',
      action: 'Saisir les derniers entretiens',
      hint: 'Quand le service, la vidange et l\'expertise ont-ils été faits la dernière fois ? Sans cela, pas de rappel',
    },
    rechnungen: {
      label: 'Factures',
      action: 'Photographier une facture',
      hint: 'Factures du garage pour les coûts et un historique complet',
    },
  },
  it: {
    titel: 'Configura',
    bereich: 'Configurazione',
    zaehler: (fertig: number, alle: number) => `${fertig} di ${alle}`,
    ausblenden: 'Nascondi',
    felder: {
      kontrollschild: 'targa',
      fahrgestellnummer: 'numero di telaio',
      baujahr: 'anno di costruzione',
    },
    fehltNoch: (felder: string) => `Manca ancora: ${felder}`,
    ausweis: {
      label: 'Licenza di circolazione',
      action: 'Fotografa la licenza di circolazione',
      vollstaendig: 'Dati del veicolo completi',
    },
    serviceheft: {
      label: 'Libretto di manutenzione',
      action: 'Fotografa il libretto di manutenzione',
      hint: 'Intervalli del costruttore e timbri, così le scadenze valgono proprio per questo veicolo',
    },
    wartungen: {
      label: 'Ultime manutenzioni',
      action: 'Registra le ultime manutenzioni',
      hint: 'Quando sono stati fatti l\'ultima volta servizio, olio e collaudo? Senza questo non ci sono promemoria',
    },
    rechnungen: {
      label: 'Fatture',
      action: 'Fotografa una fattura',
      hint: 'Fatture dell\'officina per i costi e una cronologia completa',
    },
  },
  en: {
    titel: 'Set up',
    bereich: 'Setup',
    zaehler: (fertig: number, alle: number) => `${fertig} of ${alle}`,
    ausblenden: 'Hide',
    felder: {
      kontrollschild: 'number plate',
      fahrgestellnummer: 'chassis number',
      baujahr: 'year of manufacture',
    },
    fehltNoch: (felder: string) => `Still missing: ${felder}`,
    ausweis: {
      label: 'Vehicle registration document',
      action: 'Photograph the registration document',
      vollstaendig: 'Vehicle data complete',
    },
    serviceheft: {
      label: 'Service book',
      action: 'Photograph the service book',
      hint: 'Manufacturer intervals and stamps, so the due dates match exactly this vehicle',
    },
    wartungen: {
      label: 'Last maintenance',
      action: 'Record last maintenance',
      hint: 'When were the service, oil and vehicle inspection last done? Without this there are no reminders',
    },
    rechnungen: {
      label: 'Invoices',
      action: 'Photograph an invoice',
      hint: 'Garage invoices for costs and a complete history',
    },
  },
} satisfies Record<Sprache, typeof de>
