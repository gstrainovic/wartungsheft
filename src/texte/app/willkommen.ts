import type { Sprache } from '../../lib/sprache'

// Willkommensmail am Tag nach der Anmeldung im Namen von Goran (services/welcome-mail.ts, scripts/reminders.ts).
// Aufbau: `oben`, dann `herkunftsfrage` als eigener Absatz nur bei Konten ohne Herkunftsangabe, dann `unten`; die
// Leerzeilen zwischen den Teilen setzt der Code. Versand mit WELCOME_MAILS=on, erst nach Gorans Freigabe; Französisch siezt wie
// die App. Textänderungen nur nach Gorans Freigabe.
const de = {
  betreff: 'Willkommen bei Wartungsheft',
  oben: [
    'Hallo',
    '',
    'Danke, dass du Wartungsheft ausprobierst. Ich bin Goran und baue die App selbst. Damit du schnell etwas davon hast, die drei wichtigsten ersten Schritte:',
    '',
    '1. Fahrzeug erfassen: Am schnellsten geht es, wenn du den Fahrzeugausweis fotografierst, die App füllt die Stammdaten aus.',
    '2. Werkstattrechnung fotografieren: Die KI liest Datum, Kilometerstand und Positionen aus und trägt die Wartungen ein.',
    '3. Letzte Wartungen eintragen: Wann waren Service, Öl und MFK zuletzt? Ohne das gibt es keine Erinnerung. Danach schickt dir Wartungsheft eine E-Mail, wenn Service, Bremsen, Reifen oder MFK fällig werden.',
  ].join('\n'),
  herkunftsfrage: 'Kurze Frage: Wie bist du auf Wartungsheft gestossen?',
  unten: [
    'Bei Fragen oder wenn etwas nicht klappt, einfach auf diese Mail antworten. Ich lese jede Antwort persönlich.',
    '',
    'Gruss',
    'Goran',
    '',
    'Goran Strainovic, Wartungsheft',
    '',
    'Keine solchen Mails mehr: https://wartungsheft.ch/settings, Abschnitt «Erinnerungen».',
  ].join('\n'),
}

export default {
  de,
  fr: {
    betreff: 'Bienvenue chez Wartungsheft',
    oben: [
      'Bonjour',
      '',
      'Merci d’essayer Wartungsheft. Je suis Goran et je développe l’application moi-même. Pour que vous en profitiez rapidement, voici les trois premiers pas les plus importants :',
      '',
      '1. Saisir un véhicule : le plus rapide, c’est de photographier le permis de circulation, l’application remplit les données du véhicule.',
      '2. Photographier une facture du garage : l’IA lit la date, le kilométrage et les positions, puis enregistre les entretiens.',
      '3. Saisir les derniers entretiens : quand le service, la vidange et l’expertise (MFK) ont-ils été faits la dernière fois ? Sans cela, pas de rappel. Ensuite, Wartungsheft vous envoie un e-mail quand le service, les freins, les pneus ou l’expertise (MFK) arrivent à échéance.',
    ].join('\n'),
    herkunftsfrage: 'Petite question : comment avez-vous découvert Wartungsheft ?',
    unten: [
      'Pour toute question ou si quelque chose ne fonctionne pas, répondez simplement à cet e-mail. Je lis chaque réponse personnellement.',
      '',
      'Salutations',
      'Goran',
      '',
      'Goran Strainovic, Wartungsheft',
      '',
      'Plus d’e-mails de ce type : https://wartungsheft.ch/settings, rubrique « Rappels ».',
    ].join('\n'),
  },
  it: {
    betreff: 'Benvenuto in Wartungsheft',
    oben: [
      'Ciao',
      '',
      'Grazie per provare Wartungsheft. Sono Goran e sviluppo l\'app da solo. Perché ti sia utile da subito, ecco i tre primi passi più importanti:',
      '',
      '1. Registra il veicolo: il modo più veloce è fotografare la licenza di circolazione, l\'app compila i dati del veicolo.',
      '2. Fotografa una fattura dell\'officina: l\'IA legge data, chilometraggio e posizioni e registra le manutenzioni.',
      '3. Registra le ultime manutenzioni: quando sono stati fatti l\'ultima volta servizio, olio e collaudo (MFK)? Senza questo non ci sono promemoria. Poi Wartungsheft ti manda un\'e-mail quando servizio, freni, pneumatici o collaudo (MFK) sono in scadenza.',
    ].join('\n'),
    herkunftsfrage: 'Una domanda veloce: come hai scoperto Wartungsheft?',
    unten: [
      'Per domande o se qualcosa non funziona, rispondi semplicemente a questa e-mail. Leggo personalmente ogni risposta.',
      '',
      'Un saluto',
      'Goran',
      '',
      'Goran Strainovic, Wartungsheft',
      '',
      'Niente più e-mail di questo tipo: https://wartungsheft.ch/settings, sezione «Promemoria».',
    ].join('\n'),
  },
  en: {
    betreff: 'Welcome to Wartungsheft',
    oben: [
      'Hello',
      '',
      'Thank you for trying Wartungsheft. I am Goran and I build the app myself. So you get something out of it quickly, here are the three most important first steps:',
      '',
      '1. Add a vehicle: the quickest way is to photograph the registration document, the app fills in the vehicle data.',
      '2. Photograph a garage invoice: the AI reads the date, mileage and line items and records the maintenance.',
      '3. Record the last maintenance: when were the service, oil and vehicle inspection (MFK) last done? Without this there are no reminders. After that, Wartungsheft emails you when the service, brakes, tyres or vehicle inspection (MFK) are due.',
    ].join('\n'),
    herkunftsfrage: 'Quick question: how did you find Wartungsheft?',
    unten: [
      'If you have questions or something does not work, just reply to this email. I read every reply personally.',
      '',
      'Best regards',
      'Goran',
      '',
      'Goran Strainovic, Wartungsheft',
      '',
      'No more emails like this: https://wartungsheft.ch/settings, section “Reminders”.',
    ].join('\n'),
  },
} satisfies Record<Sprache, typeof de>
