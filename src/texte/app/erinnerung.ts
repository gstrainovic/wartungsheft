import type { Sprache } from '../../lib/sprache'

// Mails an Nutzer (services/reminders.ts, services/trial-reminder.ts, scripts/reminders.ts) und der Testzeit-Hinweis
// in der App. Sprache der Mail: settings.sprache des Nutzers, sonst Deutsch.
const de = {
  hallo: 'Hallo',
  doppelpunkt: ': ',
  signatur: 'Wartungsheft, ein Angebot von Strainovic IT, Steinach',
  fragen: (url: string) => `Fragen? Einfach auf diese Mail antworten. Keine Erinnerungen mehr: ${url}/settings, Abschnitt «Erinnerungen».`,
  faellig: {
    betreff: (n: number, fahrzeug: string) => `Wartungsheft: ${n} ${n === 1 ? 'Arbeit' : 'Arbeiten'} fällig${fahrzeug ? ` beim ${fahrzeug}` : ''}`,
    intro: (n: number, fahrzeuge: number) => `Bei ${fahrzeuge === 1 ? 'deinem Fahrzeug' : 'deinen Fahrzeugen'} ${n === 1 ? 'steht eine Arbeit' : `stehen ${n} Arbeiten`} an:`,
    ueberfaellig: 'überfällig',
    faelligWar: (wann: string) => ` (fällig war ${wann})`,
    baldFaellig: 'bald fällig',
    bis: (wann: string) => ` (bis ${wann})`,
    alternativ: 'oder',
    details: 'Details und Eintragen:',
    hinweis: 'Die Intervalle sind Standardwerte, solange kein Serviceheft hinterlegt ist. Erledigte Arbeiten trägst du im\nWartungsheft ein, dann verschwindet die Erinnerung.',
  },
  testzeit: {
    betreff: (datum: string) => `Wartungsheft: Testzeit endet am ${datum}`,
    laeuft: (tage: number, datum: string) => `deine Testzeit läuft noch ${tage} Tage, bis zum ${datum}.`,
    danach: 'Danach brauchen der Beleg-Scan und der Chat ein Abo. Alles andere bleibt: deine Fahrzeuge, Rechnungen und\nWartungen bleiben lesbar, Erfassen von Hand und die Exporte funktionieren weiter.',
    bestellen: 'Abo bestellen:',
    preise: 'Privat kostet Wartungsheft 25 Franken im Jahr für bis zu fünf Fahrzeuge, Betriebe zahlen 36 Franken pro\nFahrzeug und Jahr und bekommen die Rechnung auf die Firma. Die Rechnung kommt per Mail, zahlbar in 30 Tagen.',
  },
  hinweis: {
    vorbei: 'Testzeit vorbei: Scannen und Chat brauchen ein Abo. Erfassen von Hand, Lesen und Exporte bleiben frei.',
    laeuft: (tage: number, datum: string) => `Testzeit läuft ${tage === 1 ? 'noch 1 Tag' : `noch ${tage} Tage`}, bis ${datum}. Danach brauchen Scannen und Chat ein Abo.`,
  },
}

export default {
  de,
  fr: {
    hallo: 'Bonjour',
    doppelpunkt: ' : ',
    signatur: 'Wartungsheft, une offre de Strainovic IT, Steinach',
    fragen: (url: string) => `Des questions ? Réponds simplement à cet e-mail. Plus de rappels : ${url}/settings, rubrique « Rappels ».`,
    faellig: {
      betreff: (n: number, fahrzeug: string) => `Wartungsheft : ${n} ${n === 1 ? 'travail' : 'travaux'} à faire${fahrzeug ? ` pour ${fahrzeug}` : ''}`,
      intro: (n: number, fahrzeuge: number) => `${n === 1 ? 'Un travail est à faire' : `${n} travaux sont à faire`} sur ${fahrzeuge === 1 ? 'ton véhicule' : 'tes véhicules'} :`,
      ueberfaellig: 'en retard',
      faelligWar: (wann: string) => ` (était dû ${wann})`,
      baldFaellig: 'bientôt dû',
      bis: (wann: string) => ` (d’ici ${wann})`,
      alternativ: 'ou',
      details: 'Détails et saisie :',
      hinweis: 'Les intervalles sont des valeurs standard tant qu’aucun carnet d’entretien n’est enregistré. Saisis les travaux effectués dans Wartungsheft, le rappel disparaît alors.',
    },
    testzeit: {
      betreff: (datum: string) => `Wartungsheft : la période d’essai se termine le ${datum}`,
      laeuft: (tage: number, datum: string) => `ta période d’essai dure encore ${tage} jours, jusqu’au ${datum}.`,
      danach: 'Ensuite, le scan des factures et le chat nécessitent un abonnement. Tout le reste demeure : tes véhicules, factures et entretiens restent lisibles, la saisie manuelle et les exports continuent de fonctionner.',
      bestellen: 'Commander l’abonnement :',
      preise: 'Pour les particuliers, Wartungsheft coûte 25 francs par an pour jusqu’à cinq véhicules ; les entreprises paient 36 francs par véhicule et par an et reçoivent la facture au nom de l’entreprise. La facture arrive par e-mail, payable à 30 jours.',
    },
    hinweis: {
      vorbei: 'Période d’essai terminée : le scan et le chat nécessitent un abonnement. La saisie manuelle, la consultation et les exports restent gratuits.',
      laeuft: (tage: number, datum: string) => `Période d’essai : encore ${tage === 1 ? '1 jour' : `${tage} jours`}, jusqu’au ${datum}. Ensuite, le scan et le chat nécessitent un abonnement.`,
    },
  },
  it: {
    hallo: 'Ciao',
    doppelpunkt: ': ',
    signatur: 'Wartungsheft, un\'offerta di Strainovic IT, Steinach',
    fragen: (url: string) => `Domande? Rispondi semplicemente a questa e-mail. Niente più promemoria: ${url}/settings, sezione «Promemoria».`,
    faellig: {
      betreff: (n: number, fahrzeug: string) => `Wartungsheft: ${n} ${n === 1 ? 'lavoro' : 'lavori'} da fare${fahrzeug ? ` per ${fahrzeug}` : ''}`,
      intro: (n: number, fahrzeuge: number) => `${n === 1 ? 'C\'è un lavoro da fare' : `Ci sono ${n} lavori da fare`} ${fahrzeuge === 1 ? 'sul tuo veicolo' : 'sui tuoi veicoli'}:`,
      ueberfaellig: 'scaduto',
      faelligWar: (wann: string) => ` (scadeva ${wann})`,
      baldFaellig: 'in scadenza',
      bis: (wann: string) => ` (entro ${wann})`,
      alternativ: 'o',
      details: 'Dettagli e registrazione:',
      hinweis: 'Gli intervalli sono valori standard finché non è registrato un libretto di manutenzione. Registra in Wartungsheft i lavori eseguiti e il promemoria sparisce.',
    },
    testzeit: {
      betreff: (datum: string) => `Wartungsheft: il periodo di prova termina il ${datum}`,
      laeuft: (tage: number, datum: string) => `il tuo periodo di prova dura ancora ${tage} giorni, fino al ${datum}.`,
      danach: 'Dopo, la scansione delle fatture e la chat richiedono un abbonamento. Tutto il resto rimane: i tuoi veicoli, le fatture e le manutenzioni restano leggibili, la registrazione manuale e le esportazioni continuano a funzionare.',
      bestellen: 'Ordina l\'abbonamento:',
      preise: 'Per i privati Wartungsheft costa 25 franchi all\'anno per un massimo di cinque veicoli; le aziende pagano 36 franchi per veicolo e anno e ricevono la fattura intestata alla ditta. La fattura arriva per e-mail, pagabile entro 30 giorni.',
    },
    hinweis: {
      vorbei: 'Periodo di prova terminato: scansione e chat richiedono un abbonamento. Registrazione manuale, lettura ed esportazioni restano gratuite.',
      laeuft: (tage: number, datum: string) => `Periodo di prova: ancora ${tage === 1 ? '1 giorno' : `${tage} giorni`}, fino al ${datum}. Dopo, scansione e chat richiedono un abbonamento.`,
    },
  },
  en: {
    hallo: 'Hello',
    doppelpunkt: ': ',
    signatur: 'Wartungsheft, a service by Strainovic IT, Steinach',
    fragen: (url: string) => `Questions? Just reply to this email. No more reminders: ${url}/settings, section “Reminders”.`,
    faellig: {
      betreff: (n: number, fahrzeug: string) => `Wartungsheft: ${n} ${n === 1 ? 'job' : 'jobs'} due${fahrzeug ? ` for ${fahrzeug}` : ''}`,
      intro: (n: number, fahrzeuge: number) => `${n === 1 ? 'One job is due' : `${n} jobs are due`} on ${fahrzeuge === 1 ? 'your vehicle' : 'your vehicles'}:`,
      ueberfaellig: 'overdue',
      faelligWar: (wann: string) => ` (was due ${wann})`,
      baldFaellig: 'due soon',
      bis: (wann: string) => ` (by ${wann})`,
      alternativ: 'or',
      details: 'Details and recording:',
      hinweis: 'The intervals are standard values as long as no service book is stored. Record completed jobs in Wartungsheft and the reminder disappears.',
    },
    testzeit: {
      betreff: (datum: string) => `Wartungsheft: your trial ends on ${datum}`,
      laeuft: (tage: number, datum: string) => `your trial runs for another ${tage} days, until ${datum}.`,
      danach: 'After that, the invoice scan and the chat need a subscription. Everything else stays: your vehicles, invoices and maintenance records remain readable, manual entry and exports keep working.',
      bestellen: 'Order a subscription:',
      preise: 'For private users Wartungsheft costs 25 francs a year for up to five vehicles; businesses pay 36 francs per vehicle and year and receive the invoice in the company\'s name. The invoice comes by email, payable within 30 days.',
    },
    hinweis: {
      vorbei: 'Trial over: scanning and chat need a subscription. Manual entry, reading and exports stay free.',
      laeuft: (tage: number, datum: string) => `Trial ends in ${tage === 1 ? '1 day' : `${tage} days`}, on ${datum}. After that, scanning and chat need a subscription.`,
    },
  },
} satisfies Record<Sprache, typeof de>
