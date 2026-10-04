import type { Sprache } from '../../lib/sprache'

// Fehlermeldungen an Nutzer (lib/errors.ts: userMessage)
const de = {
  limit: 'Monatslimit erreicht. Upgrade in den Einstellungen.',
  testzeit: 'Testzeit vorbei. Ein Abo gibt es in den Einstellungen.',
  rate: 'Zu viele Anfragen, bitte kurz warten.',
  offline: 'Keine Verbindung. Bitte Internet prüfen.',
  auth: 'Bitte neu anmelden.',
  allgemein: 'Das hat nicht geklappt. Bitte nochmals versuchen.',
}

export default {
  de,
  fr: {
    limit: 'Limite mensuelle atteinte. Passe à un abonnement supérieur dans les réglages.',
    testzeit: 'Période d\'essai terminée. Tu trouves l\'abonnement dans les réglages.',
    rate: 'Trop de demandes, attends un instant.',
    offline: 'Pas de connexion. Vérifie Internet.',
    auth: 'Reconnecte-toi.',
    allgemein: 'Cela n\'a pas fonctionné. Réessaie.',
  },
  it: {
    limit: 'Limite mensile raggiunto. Passa a un piano superiore nelle impostazioni.',
    testzeit: 'Periodo di prova terminato. L\'abbonamento è nelle impostazioni.',
    rate: 'Troppe richieste, attendi un momento.',
    offline: 'Nessuna connessione. Controlla Internet.',
    auth: 'Accedi di nuovo.',
    allgemein: 'Non ha funzionato. Riprova.',
  },
  en: {
    limit: 'Monthly limit reached. Upgrade in the settings.',
    testzeit: 'Trial period over. You can subscribe in the settings.',
    rate: 'Too many requests, please wait a moment.',
    offline: 'No connection. Please check your internet.',
    auth: 'Please sign in again.',
    allgemein: 'That didn\'t work. Please try again.',
  },
} satisfies Record<Sprache, typeof de>
