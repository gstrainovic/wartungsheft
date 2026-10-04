import type { Sprache } from '../../lib/sprache'

// Formular «Neue Wartung» (MaintenanceForm.vue, MaintenanceFormDialog.vue)
const de = {
  neueWartung: 'Neue Wartung',
  kategorie: 'Kategorie *',
  termin: 'Termin *',
  datum: 'Datum *',
  kilometerstand: 'Kilometerstand',
  status: 'Status',
  erledigt: 'Erledigt',
  geplant: 'Geplant (Termin vereinbart)',
  beschreibung: 'Beschreibung',
  diktieren: 'Beschreibung diktieren',
  validierung: {
    kategoriePflicht: 'Kategorie ist erforderlich',
    datumPflicht: 'Datum ist erforderlich',
    kmPositiv: 'Kilometerstand muss positiv sein',
  },
}

export default {
  de,
  fr: {
    neueWartung: 'Nouvel entretien',
    kategorie: 'Catégorie *',
    termin: 'Rendez-vous *',
    datum: 'Date *',
    kilometerstand: 'Kilométrage',
    status: 'Statut',
    erledigt: 'Fait',
    geplant: 'Planifié (rendez-vous pris)',
    beschreibung: 'Description',
    diktieren: 'Dicter la description',
    validierung: {
      kategoriePflicht: 'La catégorie est obligatoire',
      datumPflicht: 'La date est obligatoire',
      kmPositiv: 'Le kilométrage doit être positif',
    },
  },
  it: {
    neueWartung: 'Nuova manutenzione',
    kategorie: 'Categoria *',
    termin: 'Appuntamento *',
    datum: 'Data *',
    kilometerstand: 'Chilometraggio',
    status: 'Stato',
    erledigt: 'Fatto',
    geplant: 'Pianificato (appuntamento fissato)',
    beschreibung: 'Descrizione',
    diktieren: 'Detta la descrizione',
    validierung: {
      kategoriePflicht: 'La categoria è obbligatoria',
      datumPflicht: 'La data è obbligatoria',
      kmPositiv: 'Il chilometraggio deve essere positivo',
    },
  },
  en: {
    neueWartung: 'New maintenance',
    kategorie: 'Category *',
    termin: 'Appointment *',
    datum: 'Date *',
    kilometerstand: 'Mileage',
    status: 'Status',
    erledigt: 'Done',
    geplant: 'Planned (appointment booked)',
    beschreibung: 'Description',
    diktieren: 'Dictate description',
    validierung: {
      kategoriePflicht: 'Category is required',
      datumPflicht: 'Date is required',
      kmPositiv: 'Mileage must be positive',
    },
  },
} satisfies Record<Sprache, typeof de>
