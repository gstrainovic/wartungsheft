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
    betreff: (datum: string) => `Wartungsheft: Testzeit endet am ${datum}, möchtest du weitermachen?`,
    laeuft: (tage: number, datum: string) => `deine Testzeit läuft noch ${tage} Tage, bis zum ${datum}. Möchtest du danach mit Beleg-Scan und Chat weitermachen,\nbrauchen wir nur deine Rechnungsadresse.`,
    danach: 'Trägst du sie ein, kommt die erste Rechnung sofort per Mail, zahlbar in 30 Tagen. Das bezahlte Jahr beginnt erst nach\nder Testzeit, und verbindlich wird das Abo erst mit der Zahlung: Zahlst du nicht, musst du nichts tun.\n\nTust du nichts, endet die Testzeit ohne Kosten. Deine Fahrzeuge, Rechnungen und Wartungen bleiben lesbar, Erfassen\nvon Hand und Exporte gehen weiter. Nur Beleg-Scan und Chat brauchen dann ein Abo.',
    bestellen: 'Rechnungsadresse eintragen (Einstellungen, Jahresabo bestellen):',
    preise: 'Privat kostet Wartungsheft 25 Franken im Jahr für bis zu fünf Fahrzeuge, Betriebe zahlen 36 Franken pro\nFahrzeug und Jahr und bekommen die Rechnung auf die Firma.',
  },
  hinweis: {
    vorbei: 'Testzeit vorbei: Scannen und Chat brauchen ein Abo. Erfassen von Hand, Lesen und Exporte bleiben frei.',
    laeuft: (tage: number, datum: string) => `Testzeit läuft ${tage === 1 ? 'noch 1 Tag' : `noch ${tage} Tage`}, bis ${datum}. Weitermachen: Rechnungsadresse in den Einstellungen eintragen. Sonst nichts zu tun, keine Kosten.`,
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
      betreff: (datum: string) => `Wartungsheft : la période d’essai se termine le ${datum}, tu veux continuer ?`,
      laeuft: (tage: number, datum: string) => `ta période d’essai dure encore ${tage} jours, jusqu’au ${datum}. Si tu veux continuer ensuite avec le scan des factures et le chat, il nous faut seulement ton adresse de facturation.`,
      danach: 'Si tu la saisis, la première facture arrive tout de suite par e-mail, payable à 30 jours. L’année payée ne commence qu’après la période d’essai, et l’abonnement ne devient ferme qu’avec le paiement : si tu ne paies pas, tu n’as rien à faire.\n\nSi tu ne fais rien, la période d’essai se termine sans frais. Tes véhicules, factures et entretiens restent lisibles, la saisie manuelle et les exports continuent. Seuls le scan des factures et le chat nécessitent alors un abonnement.',
      bestellen: 'Saisir l’adresse de facturation (Réglages, Commander l’abonnement annuel) :',
      preise: 'Pour les particuliers, Wartungsheft coûte 25 francs par an pour jusqu’à cinq véhicules ; les entreprises paient 36 francs par véhicule et par an et reçoivent la facture au nom de l’entreprise.',
    },
    hinweis: {
      vorbei: 'Période d’essai terminée : le scan et le chat nécessitent un abonnement. La saisie manuelle, la consultation et les exports restent gratuits.',
      laeuft: (tage: number, datum: string) => `Période d’essai : encore ${tage === 1 ? '1 jour' : `${tage} jours`}, jusqu’au ${datum}. Pour continuer, saisis ton adresse de facturation dans les Réglages. Sinon, rien à faire, aucun frais.`,
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
      betreff: (datum: string) => `Wartungsheft: il periodo di prova termina il ${datum}, vuoi continuare?`,
      laeuft: (tage: number, datum: string) => `il tuo periodo di prova dura ancora ${tage} giorni, fino al ${datum}. Se poi vuoi continuare con la scansione delle fatture e la chat, ci serve solo il tuo indirizzo di fatturazione.`,
      danach: 'Se lo inserisci, la prima fattura arriva subito per e-mail, pagabile entro 30 giorni. L\'anno a pagamento inizia solo dopo il periodo di prova e l\'abbonamento diventa vincolante solo con il pagamento: se non paghi, non devi fare nulla.\n\nSe non fai nulla, il periodo di prova termina senza costi. I tuoi veicoli, le fatture e le manutenzioni restano leggibili, la registrazione manuale e le esportazioni continuano. Solo la scansione delle fatture e la chat richiedono poi un abbonamento.',
      bestellen: 'Inserisci l\'indirizzo di fatturazione (Impostazioni, Ordina l\'abbonamento annuale):',
      preise: 'Per i privati Wartungsheft costa 25 franchi all\'anno per un massimo di cinque veicoli; le aziende pagano 36 franchi per veicolo e anno e ricevono la fattura intestata alla ditta.',
    },
    hinweis: {
      vorbei: 'Periodo di prova terminato: scansione e chat richiedono un abbonamento. Registrazione manuale, lettura ed esportazioni restano gratuite.',
      laeuft: (tage: number, datum: string) => `Periodo di prova: ancora ${tage === 1 ? '1 giorno' : `${tage} giorni`}, fino al ${datum}. Per continuare, inserisci l'indirizzo di fatturazione nelle Impostazioni. Altrimenti nulla da fare, nessun costo.`,
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
      betreff: (datum: string) => `Wartungsheft: your trial ends on ${datum}, would you like to continue?`,
      laeuft: (tage: number, datum: string) => `your trial runs for another ${tage} days, until ${datum}. If you'd like to keep using the invoice scan and chat afterwards, all we need is your billing address.`,
      danach: 'Once you enter it, the first invoice comes straight away by email, payable within 30 days. The paid year only starts after the trial, and the subscription only becomes binding with payment: if you don\'t pay, you don\'t need to do anything.\n\nIf you do nothing, the trial ends at no cost. Your vehicles, invoices and maintenance records remain readable, manual entry and exports keep working. Only the invoice scan and the chat then need a subscription.',
      bestellen: 'Enter your billing address (Settings, Order annual subscription):',
      preise: 'For private users Wartungsheft costs 25 francs a year for up to five vehicles; businesses pay 36 francs per vehicle and year and receive the invoice in the company\'s name.',
    },
    hinweis: {
      vorbei: 'Trial over: scanning and chat need a subscription. Manual entry, reading and exports stay free.',
      laeuft: (tage: number, datum: string) => `Trial ends in ${tage === 1 ? '1 day' : `${tage} days`}, on ${datum}. To continue, enter your billing address in Settings. Otherwise nothing to do, no costs.`,
    },
  },
} satisfies Record<Sprache, typeof de>
