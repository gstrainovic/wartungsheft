import type { Sprache } from '../lib/sprache'

// Startseite (LandingPage.vue)
const de = {
  hero: {
    titel: 'Das digitale Serviceheft fürs Auto',
    text: 'Werkstattrechnung fotografieren, den Rest erledigt Wartungsheft: Service, MFK und Kosten pro Fahrzeug, ohne Abtippen. Für ein Auto oder die ganze Flotte.',
    stats: [
      { titel: 'Ein Foto', text: 'statt Abtippen' },
      { titel: 'Offline nutzbar', text: 'Scan läuft später nach' },
      { titel: 'Aus der Schweiz', text: 'Server hier, KI in der EU' },
    ],
  },
  problem: {
    titel: 'Das Problem kennt jeder',
    karten: [
      { icon: 'pi-folder-open', titel: 'Rechnungen überall', text: 'Schublade, Handschuhfach, E-Mail. Beim Autoverkauf fehlt die Hälfte.' },
      { icon: 'pi-calendar-times', titel: 'Wartung vergessen', text: 'Zahnriemen übersehen = Motorschaden = CHF 3\'000 bis 8\'000. Vermeidbar.' },
      { icon: 'pi-calculator', titel: 'Kosten im Dunkeln', text: 'Was hat das Auto dieses Jahr gekostet? Keine Ahnung.' },
    ],
  },
  features: {
    titel: 'Was Wartungsheft dir abnimmt',
    karten: [
      { icon: 'pi-camera', titel: 'KI-Rechnungsscanner', text: 'Rechnung abfotografieren. Werkstatt, Datum, Betrag, Einzelpositionen — alles automatisch extrahiert. Scannen ohne Limit im Alltag.', demo: false },
      { icon: 'pi-bell', titel: 'Wartungs-Tracker', text: 'Auf einen Blick, was ansteht: Öl, Bremsen, MFK, Zahnriemen und was dein Serviceheft sonst vorsieht.', demo: true },
      { icon: 'pi-sync', titel: 'Offline-First', text: 'Fahrzeuge, Rechnungen und Wartungsplan funktionieren ohne Internet. Eine offline fotografierte Rechnung wird gespeichert, der KI-Scan läuft automatisch nach, sobald du wieder online bist.', demo: false },
      { icon: 'pi-shield', titel: 'Schweizer Anbieter, Schweizer Server', text: 'Entwickelt, betrieben und gespeichert in der Schweiz. Die KI läuft bei Mistral in Frankreich, ohne Training mit deinen Daten. Alles inklusive, nichts extra buchen.', demo: false },
      { icon: 'pi-file-pdf', titel: 'Digitales Serviceheft und Servicebuch', text: 'Lückenlose Wartungshistorie statt Servicebuch im Handschuhfach. Beim Autoverkauf den Wert steigern — alles digital belegt.', demo: false },
      { icon: 'pi-file-excel', titel: 'Export für Treuhänder und Käufer', text: 'Tabelle für Excel, PDF-Dossier pro Fahrzeug und der Jahresabschluss mit allen Rechnungsbildern für den Treuhänder.', demo: false },
    ],
  },
  ablauf: {
    titel: 'So funktioniert\'s',
    schritte: [
      { titel: 'Foto machen', text: 'Werkstattrechnung mit dem Handy abfotografieren oder PDF hochladen.' },
      { titel: 'KI liest vor', text: 'Die KI extrahiert automatisch: Werkstatt, Datum, Betrag, Einzelpositionen, KM-Stand.' },
      { titel: 'Bestätigen', text: 'Prüfen, speichern. Fälligkeiten, Serviceheft und Kosten sind sofort aktuell.' },
    ],
  },
  fuerWen: {
    titel: 'Für wen ist Wartungsheft?',
    text: 'Ein Werkzeug, gleiche Funktionen. Privat 25 CHF im Jahr, Betriebe 36 CHF pro Fahrzeug mit Rechnung auf die Firma.',
    betrieb: {
      titel: 'Betriebe mit Fahrzeugen',
      text: 'Lieferwagen, Servicefahrzeuge, Firmenwagen: alle Rechnungen und Wartungen an einem Ort, Kosten pro Fahrzeug und Jahr, Export für die Buchhaltung.',
      punkte: ['Fahrer fotografiert die Rechnung, fertig', 'Kosten pro Fahrzeug und Jahr, für Excel und als PDF', 'E-Mail-Erinnerungen an fällige Arbeiten'],
      knopf: 'Angebot für Betriebe',
    },
    privat: {
      titel: 'Privathalter',
      text: 'Ein Auto, alle Rechnungen: digitales Serviceheft, Wartungsplan mit Erinnerung und ein PDF-Dossier für den Verkauf.',
      punkte: ['Rechnung fotografieren statt abtippen', 'Erinnerung, bevor es teuer wird', 'Lückenlose Historie für den Wiederverkauf'],
      knopf: 'Angebot für Privathalter',
    },
  },
  preise: 'Preise',
  cta: {
    titel: 'Bereit? 30 Tage gratis, keine Kreditkarte.',
    text: 'Anmelden mit E-Mail, kein Passwort. Nach 30 Tagen entscheidest du.',
  },
}

export default {
  de,
  fr: {
    hero: {
      titel: 'Le carnet d\'entretien numérique de votre voiture',
      text: 'Photographiez la facture du garage, Wartungsheft fait le reste : service, expertise et coûts par véhicule, sans rien retaper. Pour une voiture ou toute une flotte.',
      stats: [
        { titel: 'Une photo', text: 'au lieu de retaper' },
        { titel: 'Utilisable hors ligne', text: 'le scan suit plus tard' },
        { titel: 'Made in Switzerland', text: 'serveurs en Suisse, IA dans l\'UE' },
      ],
    },
    problem: {
      titel: 'Un problème que tout le monde connaît',
      karten: [
        { icon: 'pi-folder-open', titel: 'Des factures partout', text: 'Tiroir, boîte à gants, e-mail. À la vente de la voiture, la moitié manque.' },
        { icon: 'pi-calendar-times', titel: 'Entretien oublié', text: 'Courroie de distribution oubliée = moteur cassé = CHF 3\'000 à 8\'000. Évitable.' },
        { icon: 'pi-calculator', titel: 'Des coûts dans le flou', text: 'Combien la voiture a-t-elle coûté cette année ? Aucune idée.' },
      ],
    },
    features: {
      titel: 'Ce que Wartungsheft fait pour vous',
      karten: [
        { icon: 'pi-camera', titel: 'Scanner de factures IA', text: 'Photographiez la facture. Garage, date, montant, postes détaillés : tout est extrait automatiquement. Scans illimités au quotidien.', demo: false },
        { icon: 'pi-bell', titel: 'Suivi de l\'entretien', text: 'En un coup d\'œil, ce qui arrive : huile, freins, expertise, courroie de distribution et tout ce que prévoit votre carnet d\'entretien.', demo: true },
        { icon: 'pi-sync', titel: 'Hors ligne d\'abord', text: 'Véhicules, factures et plan d\'entretien fonctionnent sans internet. Une facture photographiée hors ligne est enregistrée, le scan IA suit automatiquement dès que vous êtes de nouveau en ligne.', demo: false },
        { icon: 'pi-shield', titel: 'Fournisseur suisse, serveurs suisses', text: 'Développé, exploité et hébergé en Suisse. L\'IA tourne chez Mistral en France, sans entraînement avec vos données. Tout compris, rien à réserver en plus.', demo: false },
        { icon: 'pi-file-pdf', titel: 'Carnet d\'entretien numérique', text: 'Un historique d\'entretien complet au lieu du carnet dans la boîte à gants. Augmentez la valeur à la vente : tout est documenté numériquement.', demo: false },
        { icon: 'pi-file-excel', titel: 'Export pour la fiduciaire et l\'acheteur', text: 'Tableau pour Excel, dossier PDF par véhicule et clôture annuelle avec toutes les images des factures pour la fiduciaire.', demo: false },
      ],
    },
    ablauf: {
      titel: 'Comment ça marche',
      schritte: [
        { titel: 'Prendre une photo', text: 'Photographiez la facture du garage avec le téléphone ou téléversez un PDF.' },
        { titel: 'L\'IA lit', text: 'L\'IA extrait automatiquement : garage, date, montant, postes détaillés, kilométrage.' },
        { titel: 'Confirmer', text: 'Vérifier, enregistrer. Échéances, carnet d\'entretien et coûts sont aussitôt à jour.' },
      ],
    },
    fuerWen: {
      titel: 'Pour qui est Wartungsheft ?',
      text: 'Un outil, les mêmes fonctions. Particuliers 25 CHF par an, entreprises 36 CHF par véhicule avec facture au nom de l\'entreprise.',
      betrieb: {
        titel: 'Entreprises avec véhicules',
        text: 'Fourgons, véhicules de service, voitures de société : toutes les factures et tous les entretiens au même endroit, coûts par véhicule et par an, export pour la comptabilité.',
        punkte: ['Le chauffeur photographie la facture, c\'est tout', 'Coûts par véhicule et par an, pour Excel et en PDF', 'Rappels par e-mail des travaux à faire'],
        knopf: 'Offre pour les entreprises',
      },
      privat: {
        titel: 'Particuliers',
        text: 'Une voiture, toutes les factures : carnet d\'entretien numérique, plan d\'entretien avec rappel et dossier PDF pour la vente.',
        punkte: ['Photographier la facture au lieu de la retaper', 'Un rappel avant que ça coûte cher', 'Un historique complet pour la revente'],
        knopf: 'Offre pour les particuliers',
      },
    },
    preise: 'Prix',
    cta: {
      titel: 'Prêt ? 30 jours gratuits, sans carte de crédit.',
      text: 'Connexion par e-mail, sans mot de passe. Après 30 jours, vous décidez.',
    },
  },
  it: {
    hero: {
      titel: 'Il libretto di manutenzione digitale per l\'auto',
      text: 'Fotografa la fattura dell\'officina, al resto pensa Wartungsheft: servizio, collaudo e costi per veicolo, senza ribattere nulla. Per un\'auto o per tutta la flotta.',
      stats: [
        { titel: 'Una foto', text: 'invece di ribattere' },
        { titel: 'Anche offline', text: 'la scansione segue dopo' },
        { titel: 'Dalla Svizzera', text: 'server qui, IA nell\'UE' },
      ],
    },
    problem: {
      titel: 'Un problema che conoscono tutti',
      karten: [
        { icon: 'pi-folder-open', titel: 'Fatture ovunque', text: 'Cassetto, cruscotto, e-mail. Alla vendita dell\'auto ne manca la metà.' },
        { icon: 'pi-calendar-times', titel: 'Manutenzione dimenticata', text: 'Cinghia di distribuzione trascurata = motore rotto = CHF 3\'000 a 8\'000. Evitabile.' },
        { icon: 'pi-calculator', titel: 'Costi al buio', text: 'Quanto è costata l\'auto quest\'anno? Nessuna idea.' },
      ],
    },
    features: {
      titel: 'Cosa fa Wartungsheft per te',
      karten: [
        { icon: 'pi-camera', titel: 'Scanner di fatture con IA', text: 'Fotografa la fattura. Officina, data, importo, singole voci: tutto estratto automaticamente. Scansioni senza limiti nell\'uso quotidiano.', demo: false },
        { icon: 'pi-bell', titel: 'Controllo della manutenzione', text: 'A colpo d\'occhio cosa c\'è da fare: olio, freni, collaudo, cinghia di distribuzione e tutto ciò che prevede il tuo libretto.', demo: true },
        { icon: 'pi-sync', titel: 'Prima di tutto offline', text: 'Veicoli, fatture e piano di manutenzione funzionano senza internet. Una fattura fotografata offline viene salvata, la scansione IA segue automaticamente appena torni online.', demo: false },
        { icon: 'pi-shield', titel: 'Fornitore svizzero, server svizzeri', text: 'Sviluppato, gestito e salvato in Svizzera. L\'IA gira presso Mistral in Francia, senza addestramento con i tuoi dati. Tutto incluso, niente da prenotare in più.', demo: false },
        { icon: 'pi-file-pdf', titel: 'Libretto di manutenzione digitale', text: 'Uno storico di manutenzione completo invece del libretto nel cruscotto. Alla vendita l\'auto vale di più: tutto documentato in digitale.', demo: false },
        { icon: 'pi-file-excel', titel: 'Esportazione per fiduciario e acquirente', text: 'Tabella per Excel, dossier PDF per veicolo e chiusura annuale con tutte le immagini delle fatture per il fiduciario.', demo: false },
      ],
    },
    ablauf: {
      titel: 'Come funziona',
      schritte: [
        { titel: 'Scatta una foto', text: 'Fotografa la fattura dell\'officina con il telefono o carica un PDF.' },
        { titel: 'L\'IA legge', text: 'L\'IA estrae automaticamente: officina, data, importo, singole voci, chilometraggio.' },
        { titel: 'Conferma', text: 'Controlla, salva. Scadenze, libretto e costi sono subito aggiornati.' },
      ],
    },
    fuerWen: {
      titel: 'Per chi è Wartungsheft?',
      text: 'Uno strumento, le stesse funzioni. Privati 25 CHF all\'anno, aziende 36 CHF per veicolo con fattura intestata alla ditta.',
      betrieb: {
        titel: 'Aziende con veicoli',
        text: 'Furgoni, veicoli di servizio, auto aziendali: tutte le fatture e le manutenzioni in un unico posto, costi per veicolo e anno, esportazione per la contabilità.',
        punkte: ['L\'autista fotografa la fattura, fatto', 'Costi per veicolo e anno, per Excel e in PDF', 'Promemoria via e-mail per i lavori in scadenza'],
        knopf: 'Offerta per le aziende',
      },
      privat: {
        titel: 'Privati',
        text: 'Un\'auto, tutte le fatture: libretto di manutenzione digitale, piano di manutenzione con promemoria e un dossier PDF per la vendita.',
        punkte: ['Fotografare la fattura invece di ribatterla', 'Un promemoria prima che diventi caro', 'Uno storico completo per la rivendita'],
        knopf: 'Offerta per i privati',
      },
    },
    preise: 'Prezzi',
    cta: {
      titel: 'Pronto? 30 giorni gratis, senza carta di credito.',
      text: 'Accesso con e-mail, senza password. Dopo 30 giorni decidi tu.',
    },
  },
  en: {
    hero: {
      titel: 'The digital service book for your car',
      text: 'Photograph the garage invoice and Wartungsheft does the rest: servicing, MFK inspection and costs per vehicle, no retyping. For one car or the whole fleet.',
      stats: [
        { titel: 'One photo', text: 'instead of retyping' },
        { titel: 'Works offline', text: 'the scan catches up later' },
        { titel: 'From Switzerland', text: 'servers here, AI in the EU' },
      ],
    },
    problem: {
      titel: 'A problem everyone knows',
      karten: [
        { icon: 'pi-folder-open', titel: 'Invoices everywhere', text: 'Drawer, glovebox, email. When you sell the car, half of them are missing.' },
        { icon: 'pi-calendar-times', titel: 'Maintenance forgotten', text: 'Timing belt overlooked = engine damage = CHF 3\'000 to 8\'000. Avoidable.' },
        { icon: 'pi-calculator', titel: 'Costs in the dark', text: 'What did the car cost this year? No idea.' },
      ],
    },
    features: {
      titel: 'What Wartungsheft takes off your hands',
      karten: [
        { icon: 'pi-camera', titel: 'AI invoice scanner', text: 'Photograph the invoice. Garage, date, amount, line items: all extracted automatically. Unlimited scanning in everyday use.', demo: false },
        { icon: 'pi-bell', titel: 'Maintenance tracker', text: 'See at a glance what is coming up: oil, brakes, MFK, timing belt and whatever else your service book specifies.', demo: true },
        { icon: 'pi-sync', titel: 'Offline first', text: 'Vehicles, invoices and the maintenance plan work without internet. An invoice photographed offline is saved, and the AI scan runs automatically as soon as you are back online.', demo: false },
        { icon: 'pi-shield', titel: 'Swiss provider, Swiss servers', text: 'Developed, operated and stored in Switzerland. The AI runs at Mistral in France, without training on your data. Everything included, nothing to book extra.', demo: false },
        { icon: 'pi-file-pdf', titel: 'Digital service book', text: 'A complete maintenance history instead of a service book in the glovebox. Raise the value when you sell the car: everything documented digitally.', demo: false },
        { icon: 'pi-file-excel', titel: 'Export for accountant and buyer', text: 'Spreadsheet for Excel, PDF dossier per vehicle and the year-end export with all invoice images for your accountant.', demo: false },
      ],
    },
    ablauf: {
      titel: 'How it works',
      schritte: [
        { titel: 'Take a photo', text: 'Photograph the garage invoice with your phone or upload a PDF.' },
        { titel: 'AI reads it', text: 'The AI extracts automatically: garage, date, amount, line items, mileage.' },
        { titel: 'Confirm', text: 'Check, save. Due dates, service book and costs are up to date immediately.' },
      ],
    },
    fuerWen: {
      titel: 'Who is Wartungsheft for?',
      text: 'One tool, the same features. Private CHF 25 a year, businesses CHF 36 per vehicle with an invoice to the company.',
      betrieb: {
        titel: 'Businesses with vehicles',
        text: 'Vans, service vehicles, company cars: all invoices and maintenance in one place, costs per vehicle and year, export for the accounts.',
        punkte: ['The driver photographs the invoice, done', 'Costs per vehicle and year, for Excel and as PDF', 'Email reminders for work that is due'],
        knopf: 'Offer for businesses',
      },
      privat: {
        titel: 'Private owners',
        text: 'One car, all invoices: digital service book, maintenance plan with reminders and a PDF dossier for selling.',
        punkte: ['Photograph the invoice instead of typing it', 'A reminder before it gets expensive', 'A complete history for resale'],
        knopf: 'Offer for private owners',
      },
    },
    preise: 'Pricing',
    cta: {
      titel: 'Ready? 30 days free, no credit card.',
      text: 'Sign in with email, no password. After 30 days, you decide.',
    },
  },
} satisfies Record<Sprache, typeof de>
