import type { Sprache } from '../lib/sprache'
import { BUSINESS_VEHICLE_YEARLY_CHF, PRIVATE_MAX_VEHICLES, PRIVATE_YEARLY_CHF } from '@strainovic/ai-proxy/plans'
import { formatCurrency } from '../lib/locale'

/** Häufige Fragen der Hilfe: sichtbar auf der Seite und als FAQPage für Suchmaschinen und KI-Antworten */
export interface Frage { frage: string, antwort: string }

const de: Frage[] = [
  {
    frage: 'Was ist Wartungsheft?',
    antwort: `Wartungsheft ist ein digitales Serviceheft für Autos, Motorräder, Wohnwagen und Firmenfahrzeuge. `
      + `Du fotografierst die Werkstattrechnung, die App liest Werkstatt, Datum, Betrag und Arbeiten heraus und `
      + `führt daraus den Wartungsplan. Sie läuft im Browser, auch offline, und wird in der Schweiz betrieben.`,
  },
  {
    frage: 'Was kostet Wartungsheft?',
    antwort: `Privat ${formatCurrency(PRIVATE_YEARLY_CHF)} im Jahr für bis zu ${PRIVATE_MAX_VEHICLES} Fahrzeuge. `
      + `Betriebe zahlen ${formatCurrency(BUSINESS_VEHICLE_YEARLY_CHF)} pro Fahrzeug und Jahr und bekommen eine `
      + `Rechnung auf die Firma. Beide Listen haben denselben Funktionsumfang. Die ersten 30 Tage sind gratis.`,
  },
  {
    frage: 'Was passiert nach den 30 Tagen?',
    antwort: `Lesen, Erfassen von Hand und alle Exporte bleiben frei. Nur der Scan von Rechnungen und der `
      + `Chat-Assistent brauchen danach ein Abo. Deine Daten bleiben vollständig erhalten.`,
  },
  {
    frage: 'Brauche ich eine App aus dem Store?',
    antwort: `Nein. Wartungsheft läuft im Browser und lässt sich auf dem Handy zum Startbildschirm hinzufügen. `
      + `Danach verhält es sich wie eine App und funktioniert auch ohne Verbindung.`,
  },
  {
    frage: 'Wo liegen meine Daten?',
    antwort: `Auf Servern in der Schweiz. Für das Auslesen von Rechnungen geht das Bild an Mistral in Frankreich `
      + `(EU); Einzelheiten stehen in der Datenschutzerklärung.`,
  },
  {
    frage: 'Kann ich meine Daten wieder herausbekommen?',
    antwort: `Ja. Kosten und Wartungen gehen als CSV nach Excel, pro Fahrzeug gibt es ein PDF-Dossier und für `
      + `den Verkauf ein Serviceheft als PDF. Ein Jahresabschluss packt Tabelle und Belegbilder in ein ZIP.`,
  },
]

const fr: Frage[] = [
  {
    frage: 'Qu’est-ce que Wartungsheft ?',
    antwort: `Wartungsheft est un carnet d’entretien numérique pour voitures, motos, caravanes et véhicules `
      + `d’entreprise. Vous photographiez la facture du garage, l’application en extrait le garage, la date, le `
      + `montant et les travaux et tient à partir de là le plan d’entretien. Elle fonctionne dans le navigateur, `
      + `aussi hors ligne, et elle est exploitée en Suisse.`,
  },
  {
    frage: 'Combien coûte Wartungsheft ?',
    antwort: `Pour les particuliers, ${formatCurrency(PRIVATE_YEARLY_CHF)} par an pour jusqu’à `
      + `${PRIVATE_MAX_VEHICLES} véhicules. Les entreprises paient ${formatCurrency(BUSINESS_VEHICLE_YEARLY_CHF)} `
      + `par véhicule et par an et reçoivent une facture au nom de l’entreprise. Les deux tarifs offrent les mêmes `
      + `fonctions. Les 30 premiers jours sont gratuits.`,
  },
  {
    frage: 'Que se passe-t-il après les 30 jours ?',
    antwort: `La consultation, la saisie manuelle et tous les exports restent gratuits. Seuls le scan des `
      + `factures et l’assistant de chat nécessitent ensuite un abonnement. Vos données sont entièrement conservées.`,
  },
  {
    frage: 'Faut-il une application du Store ?',
    antwort: `Non. Wartungsheft fonctionne dans le navigateur et peut être ajouté à l’écran d’accueil du `
      + `téléphone. Il se comporte alors comme une application et fonctionne aussi sans connexion.`,
  },
  {
    frage: 'Où sont stockées mes données ?',
    antwort: `Sur des serveurs en Suisse. Pour la lecture des factures, l’image est transmise à Mistral en France `
      + `(UE) ; les détails figurent dans la politique de confidentialité.`,
  },
  {
    frage: 'Puis-je récupérer mes données ?',
    antwort: `Oui. Les coûts et les entretiens s’exportent en CSV vers Excel, chaque véhicule dispose d’un `
      + `dossier PDF et, pour la vente, d’un carnet d’entretien en PDF. Une clôture annuelle regroupe le tableau `
      + `et les images des factures dans un ZIP.`,
  },
]

const it: Frage[] = [
  {
    frage: 'Che cos\'è Wartungsheft?',
    antwort: `Wartungsheft è un libretto di manutenzione digitale per auto, moto, roulotte e veicoli aziendali. `
      + `Fotografi la fattura dell'officina, l'app ne ricava officina, data, importo e lavori e ne tiene il piano `
      + `di manutenzione. Funziona nel browser, anche offline, ed è gestita in Svizzera.`,
  },
  {
    frage: 'Quanto costa Wartungsheft?',
    antwort: `Per i privati ${formatCurrency(PRIVATE_YEARLY_CHF)} all'anno per al massimo `
      + `${PRIVATE_MAX_VEHICLES} veicoli. Le aziende pagano ${formatCurrency(BUSINESS_VEHICLE_YEARLY_CHF)} per `
      + `veicolo e anno e ricevono una fattura intestata alla ditta. Entrambi i listini offrono le stesse `
      + `funzioni. I primi 30 giorni sono gratis.`,
  },
  {
    frage: 'Cosa succede dopo i 30 giorni?',
    antwort: `Consultazione, inserimento manuale e tutte le esportazioni restano gratuiti. Solo la scansione `
      + `delle fatture e l'assistente chat richiedono poi un abbonamento. I tuoi dati restano integralmente conservati.`,
  },
  {
    frage: 'Mi serve un\'app dallo Store?',
    antwort: `No. Wartungsheft funziona nel browser e sul telefono si può aggiungere alla schermata iniziale. `
      + `Dopo si comporta come un'app e funziona anche senza connessione.`,
  },
  {
    frage: 'Dove si trovano i miei dati?',
    antwort: `Su server in Svizzera. Per la lettura delle fatture l'immagine viene inviata a Mistral in Francia `
      + `(UE); i dettagli si trovano nell'informativa sulla privacy.`,
  },
  {
    frage: 'Posso riavere i miei dati?',
    antwort: `Sì. Costi e manutenzioni si esportano in CSV per Excel, per ogni veicolo c'è un dossier PDF e per `
      + `la vendita un libretto di manutenzione in PDF. Una chiusura annuale raccoglie tabella e immagini delle `
      + `fatture in un file ZIP.`,
  },
]

const en: Frage[] = [
  {
    frage: 'What is Wartungsheft?',
    antwort: `Wartungsheft is a digital service book for cars, motorcycles, caravans and company vehicles. `
      + `You photograph the garage invoice, the app reads out the garage, date, amount and work done and keeps `
      + `the maintenance plan from it. It runs in the browser, also offline, and is operated in Switzerland.`,
  },
  {
    frage: 'How much does Wartungsheft cost?',
    antwort: `For private owners ${formatCurrency(PRIVATE_YEARLY_CHF)} a year for up to `
      + `${PRIVATE_MAX_VEHICLES} vehicles. Businesses pay ${formatCurrency(BUSINESS_VEHICLE_YEARLY_CHF)} per `
      + `vehicle and year and receive an invoice addressed to the company. Both price lists include the same `
      + `features. The first 30 days are free.`,
  },
  {
    frage: 'What happens after the 30 days?',
    antwort: `Viewing, manual entry and all exports remain free. Only scanning invoices and the chat assistant `
      + `require a subscription after that. Your data is kept in full.`,
  },
  {
    frage: 'Do I need an app from the store?',
    antwort: `No. Wartungsheft runs in the browser and can be added to your phone's home screen. After that it `
      + `behaves like an app and also works without a connection.`,
  },
  {
    frage: 'Where is my data stored?',
    antwort: `On servers in Switzerland. To read invoices, the image is sent to Mistral in France (EU); details `
      + `are in the privacy policy.`,
  },
  {
    frage: 'Can I get my data back out?',
    antwort: `Yes. Costs and maintenance records export as CSV for Excel, each vehicle has a PDF dossier and, `
      + `for selling, a service book as PDF. A year-end export packs the table and invoice images into a ZIP.`,
  },
]

export default {
  de,
  fr,
  it,
  en,
} satisfies Record<Sprache, Frage[]>
