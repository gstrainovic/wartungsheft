import type { Sprache } from '../lib/sprache'

// Angebotsseiten /betrieb und /privathalter (HypothesisPage.vue) und der Film darauf (LandingVideo.vue).
// Hypothesen H1 und H2 in business-plan/09-validierung.md; die Übersetzungen sagen dasselbe.
interface Nutzen { icon: string, title: string, text: string }
interface Angebot {
  title: string
  problem: string
  benefits: Nutzen[]
  price: string
  priceNote: string
  cta: string
  contactSubject?: string
  film: { titel: string, text: string }
}

const de = {
  // Nach den Beobachtungen (business-plan/beobachtungen.md): MFK ist kein Hauptschmerz, das Aufgebot kommt vom
  // Strassenverkehrsamt. Der Schmerz ist Zeit, verstreute Belege und fehlender Kostenüberblick.
  betrieb: {
    title: 'Ein Serviceheft für alle Firmenfahrzeuge, ohne Excel und Aktenordner',
    problem: 'Bei drei bis fünfzehn Fahrzeugen kostet die Verwaltung Stunden im Monat: Rechnungen verstreut, kein Überblick, wann welcher Wagen zum Service war, und am Jahresende weiss niemand, was welches Fahrzeug gekostet hat.',
    benefits: [
      { icon: 'pi-camera', title: 'Rechnung fotografieren, fertig', text: 'Werkstatt, Datum, Betrag und Kilometerstand werden ausgelesen und dem richtigen Fahrzeug zugeordnet. Keine Excel-Tabelle, die niemand pflegt.' },
      { icon: 'pi-calendar', title: 'Service, Reifen und MFK pro Fahrzeug', text: 'Auf einen Blick, welcher Wagen als Nächstes dran ist und was zuletzt gemacht wurde. Eine E-Mail erinnert dich rechtzeitig.' },
      { icon: 'pi-file-excel', title: 'Kosten pro Fahrzeug und Jahr', text: 'Alle Rechnungen an einem Ort, Zusammenstellung für den Treuhänder auf Knopfdruck. Kein Suchen im Handschuhfach vor dem Jahresabschluss.' },
    ],
    price: '36 CHF pro Fahrzeug und Jahr',
    priceNote: '3 CHF pro Fahrzeug und Monat, kein Telematik-Kasten, keine Grundgebühr, Jahresrechnung auf die Firma. 30 Tage gratis mit der ganzen Flotte. Tipp: mit einer Team-Adresse wie fuhrpark@deinbetrieb.ch anmelden, dann fotografiert jeder Fahrer mit dem gleichen Zugang.',
    cta: '30 Tage gratis testen',
    contactSubject: 'Wartungsheft für unseren Betrieb',
    film: { titel: 'Der Fuhrpark in einer halben Minute', text: 'Vom Foto der Werkstattrechnung bis zu den Kosten pro Fahrzeug.' },
  } as Angebot,
  privat: {
    title: 'Dein Serviceheft fürs Auto, gepflegt vom Handy aus',
    problem: 'Das Servicebuch im Handschuhfach, die Rechnungen in der Schublade, der Service vergessen, und beim Verkauf fehlt die Hälfte der Historie.',
    benefits: [
      { icon: 'pi-camera', title: 'Rechnung fotografieren, fertig', text: 'Werkstatt, Datum, Betrag, Kilometerstand: alles wird ausgelesen und im Serviceheft abgelegt.' },
      { icon: 'pi-bell', title: 'Erinnerung, bevor es teuer wird', text: 'Öl, Bremsen, Zahnriemen, MFK: die App sagt dir, was als Nächstes fällig ist.' },
      { icon: 'pi-book', title: 'Lückenlose Historie beim Verkauf', text: 'Alle Rechnungen digital, sauber sortiert. Das schafft Vertrauen und bringt einen besseren Preis.' },
    ],
    price: '25 CHF im Jahr, bis 5 Fahrzeuge',
    priceNote: '30 Tage gratis mit allen Funktionen, danach entscheidest du. Anmelden mit E-Mail, kein Passwort, keine Kreditkarte.',
    cta: '30 Tage gratis testen',
    film: { titel: 'In einer halben Minute gesehen', text: 'Vom Foto der Werkstattrechnung bis zum Serviceheft für den Verkauf.' },
  } as Angebot,
  kontakt: { vor: 'Fragen vorab? Schreib an', nach: ', wir antworten am gleichen Tag.' },
  film: {
    /** Startseite: Film ohne eigene Überschrift der Angebotsseite */
    titel: 'In 40 Sekunden gesehen',
    text: 'Vom Foto der Werkstattrechnung bis zum Serviceheft für den Verkauf.',
    abspielen: 'Film abspielen',
    hinweis: 'Gut eine halbe Minute, mit Ton und Untertiteln. Gezeigt wird die App mit erfundenen Beispieldaten.',
    youtube: 'Auf YouTube ansehen',
  },
}

export default {
  de,
  fr: {
    betrieb: {
      title: 'Un carnet d\'entretien pour tous les véhicules de l\'entreprise, sans Excel ni classeurs',
      problem: 'Avec trois à quinze véhicules, la gestion coûte des heures chaque mois : factures dispersées, aucune vue d\'ensemble sur le dernier service de chaque véhicule, et en fin d\'année personne ne sait combien chacun a coûté.',
      benefits: [
        { icon: 'pi-camera', title: 'Photographier la facture, c\'est tout', text: 'Garage, date, montant et kilométrage sont lus et attribués au bon véhicule. Plus de tableau Excel que personne ne tient à jour.' },
        { icon: 'pi-calendar', title: 'Service, pneus et expertise par véhicule', text: 'En un coup d\'œil, quel véhicule est le prochain et ce qui a été fait en dernier. Un e-mail vous le rappelle à temps.' },
        { icon: 'pi-file-excel', title: 'Coûts par véhicule et par an', text: 'Toutes les factures au même endroit, récapitulatif pour la fiduciaire en un clic. Plus de fouilles dans la boîte à gants avant le bouclement.' },
      ],
      price: '36 CHF par véhicule et par an',
      priceNote: '3 CHF par véhicule et par mois, sans boîtier télématique, sans taxe de base, facture annuelle au nom de l\'entreprise. 30 jours gratuits avec toute la flotte. Conseil : inscrivez-vous avec une adresse d\'équipe comme flotte@votreentreprise.ch, chaque chauffeur photographie alors avec le même accès.',
      cta: 'Essayer 30 jours gratuitement',
      contactSubject: 'Wartungsheft pour notre entreprise',
      film: { titel: 'La flotte en une demi-minute', text: 'De la photo de la facture du garage aux coûts par véhicule.' },
    },
    privat: {
      title: 'Le carnet d\'entretien de votre voiture, tenu depuis le téléphone',
      problem: 'Le carnet de service dans la boîte à gants, les factures dans le tiroir, le service oublié, et à la vente la moitié de l\'historique manque.',
      benefits: [
        { icon: 'pi-camera', title: 'Photographier la facture, c\'est tout', text: 'Garage, date, montant, kilométrage : tout est lu et classé dans le carnet d\'entretien.' },
        { icon: 'pi-bell', title: 'Un rappel avant que ça coûte cher', text: 'Huile, freins, courroie de distribution, expertise : l\'app vous dit ce qui est dû ensuite.' },
        { icon: 'pi-book', title: 'Un historique complet à la vente', text: 'Toutes les factures numériques, bien classées. Cela crée la confiance et rapporte un meilleur prix.' },
      ],
      price: '25 CHF par an, jusqu\'à 5 véhicules',
      priceNote: '30 jours gratuits avec toutes les fonctions, ensuite vous décidez. Connexion par e-mail, sans mot de passe, sans carte de crédit.',
      cta: 'Essayer 30 jours gratuitement',
      film: { titel: 'Vu en une demi-minute', text: 'De la photo de la facture du garage au carnet d\'entretien pour la vente.' },
    },
    kontakt: { vor: 'Des questions ? Écrivez à', nach: ', nous répondons le jour même.' },
    film: {
      titel: 'Vu en 40 secondes',
      text: 'De la photo de la facture du garage au carnet d\'entretien pour la vente.',
      abspielen: 'Lire le film',
      hinweis: 'Une bonne demi-minute, en allemand avec sous-titres. On y voit l\'app avec des données d\'exemple inventées.',
      youtube: 'Voir sur YouTube',
    },
  },
  it: {
    betrieb: {
      title: 'Un libretto di manutenzione per tutti i veicoli aziendali, senza Excel né classificatori',
      problem: 'Con tre-quindici veicoli la gestione costa ore ogni mese: fatture sparse, nessuna panoramica su quando ogni veicolo è stato in servizio, e a fine anno nessuno sa quanto è costato ciascuno.',
      benefits: [
        { icon: 'pi-camera', title: 'Fotografa la fattura, fatto', text: 'Officina, data, importo e chilometraggio vengono letti e assegnati al veicolo giusto. Nessuna tabella Excel che nessuno aggiorna.' },
        { icon: 'pi-calendar', title: 'Servizio, pneumatici e collaudo per veicolo', text: 'A colpo d\'occhio quale veicolo tocca per primo e cosa è stato fatto l\'ultima volta. Un\'e-mail te lo ricorda in tempo.' },
        { icon: 'pi-file-excel', title: 'Costi per veicolo e anno', text: 'Tutte le fatture in un unico posto, riepilogo per il fiduciario con un clic. Niente più ricerche nel cruscotto prima della chiusura annuale.' },
      ],
      price: '36 CHF per veicolo e anno',
      priceNote: '3 CHF per veicolo al mese, senza scatola telematica, senza tassa di base, fattura annuale intestata alla ditta. 30 giorni gratis con tutta la flotta. Consiglio: registrati con un indirizzo di team come flotta@tuaazienda.ch, così ogni autista fotografa con lo stesso accesso.',
      cta: 'Prova gratis per 30 giorni',
      contactSubject: 'Wartungsheft per la nostra azienda',
      film: { titel: 'La flotta in mezzo minuto', text: 'Dalla foto della fattura dell\'officina ai costi per veicolo.' },
    },
    privat: {
      title: 'Il libretto di manutenzione della tua auto, gestito dal telefono',
      problem: 'Il libretto di servizio nel cruscotto, le fatture nel cassetto, il servizio dimenticato, e alla vendita manca metà dello storico.',
      benefits: [
        { icon: 'pi-camera', title: 'Fotografa la fattura, fatto', text: 'Officina, data, importo, chilometraggio: tutto viene letto e archiviato nel libretto di manutenzione.' },
        { icon: 'pi-bell', title: 'Un promemoria prima che diventi caro', text: 'Olio, freni, cinghia di distribuzione, collaudo: l\'app ti dice cosa scade dopo.' },
        { icon: 'pi-book', title: 'Uno storico completo alla vendita', text: 'Tutte le fatture in digitale, ben ordinate. Questo crea fiducia e porta un prezzo migliore.' },
      ],
      price: '25 CHF all\'anno, fino a 5 veicoli',
      priceNote: '30 giorni gratis con tutte le funzioni, poi decidi tu. Accesso con e-mail, senza password, senza carta di credito.',
      cta: 'Prova gratis per 30 giorni',
      film: { titel: 'Visto in mezzo minuto', text: 'Dalla foto della fattura dell\'officina al libretto di manutenzione per la vendita.' },
    },
    kontakt: { vor: 'Domande? Scrivi a', nach: ', rispondiamo il giorno stesso.' },
    film: {
      titel: 'Visto in 40 secondi',
      text: 'Dalla foto della fattura dell\'officina al libretto di manutenzione per la vendita.',
      abspielen: 'Riproduci il filmato',
      hinweis: 'Poco più di mezzo minuto, in tedesco con sottotitoli. Mostra l\'app con dati di esempio inventati.',
      youtube: 'Guarda su YouTube',
    },
  },
  en: {
    betrieb: {
      title: 'One service book for all company vehicles, without Excel or binders',
      problem: 'With three to fifteen vehicles, admin costs hours every month: invoices scattered, no overview of when each vehicle was last serviced, and at year end nobody knows what each vehicle cost.',
      benefits: [
        { icon: 'pi-camera', title: 'Photograph the invoice, done', text: 'Garage, date, amount and mileage are read out and assigned to the right vehicle. No Excel sheet that nobody maintains.' },
        { icon: 'pi-calendar', title: 'Servicing, tyres and MFK per vehicle', text: 'See at a glance which vehicle is next and what was done last. An email reminds you in good time.' },
        { icon: 'pi-file-excel', title: 'Costs per vehicle and year', text: 'All invoices in one place, a summary for your accountant at the push of a button. No searching the glovebox before year end.' },
      ],
      price: 'CHF 36 per vehicle and year',
      priceNote: 'CHF 3 per vehicle and month, no telematics box, no base fee, annual invoice to the company. 30 days free with the whole fleet. Tip: sign up with a team address like fleet@yourcompany.ch, then every driver photographs with the same login.',
      cta: 'Try free for 30 days',
      contactSubject: 'Wartungsheft for our business',
      film: { titel: 'The fleet in half a minute', text: 'From the photo of the garage invoice to the costs per vehicle.' },
    },
    privat: {
      title: 'Your car\'s service book, kept from your phone',
      problem: 'The service book in the glovebox, the invoices in the drawer, the service forgotten, and when you sell, half the history is missing.',
      benefits: [
        { icon: 'pi-camera', title: 'Photograph the invoice, done', text: 'Garage, date, amount, mileage: everything is read out and filed in the service book.' },
        { icon: 'pi-bell', title: 'A reminder before it gets expensive', text: 'Oil, brakes, timing belt, MFK: the app tells you what is due next.' },
        { icon: 'pi-book', title: 'A complete history when you sell', text: 'All invoices digital, neatly sorted. That builds trust and gets a better price.' },
      ],
      price: 'CHF 25 a year, up to 5 vehicles',
      priceNote: '30 days free with all features, then you decide. Sign in with email, no password, no credit card.',
      cta: 'Try free for 30 days',
      film: { titel: 'Seen in half a minute', text: 'From the photo of the garage invoice to the service book for selling.' },
    },
    kontakt: { vor: 'Questions first? Write to', nach: ', we reply the same day.' },
    film: {
      titel: 'Seen in 40 seconds',
      text: 'From the photo of the garage invoice to the service book for selling.',
      abspielen: 'Play film',
      hinweis: 'Just over half a minute, in German with subtitles. It shows the app with made-up sample data.',
      youtube: 'Watch on YouTube',
    },
  },
} satisfies Record<Sprache, typeof de>
