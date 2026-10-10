<script setup lang="ts">
import { BUSINESS_VEHICLE_YEARLY_CHF, PRIVATE_MAX_VEHICLES, PRIVATE_YEARLY_CHF } from '@strainovic/ai-proxy/plans'
import { formatCurrency } from '../../lib/locale'

const CONTACT_EMAIL = 'info@wartungsheft.ch'
</script>

<template>
  <h1>Condizioni generali</h1>
  <p class="legal-meta">
    Versione del 22 settembre 2026
  </p>
  <p class="legal-meta">
    Questa è una traduzione. Fa fede unicamente la versione tedesca:
    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -- Zeilenumbruch im Link ergäbe ein Leerzeichen vor dem Punkt -->
    <router-link to="/agb">Allgemeine Geschäftsbedingungen</router-link>.
  </p>

  <h2>1. Fornitore e campo d'applicazione</h2>
  <p>
    Wartungsheft (wartungsheft.ch) è un'offerta di Goran Strainovic, Strainovic IT (ditta individuale),
    Bahnstrasse 9b, 9323 Steinach, Svizzera, e-mail <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
    Le presenti CG si applicano a tutti gli account, al periodo di prova e a tutti gli abbonamenti, per privati e
    aziende. Condizioni divergenti valgono solo se le confermiamo per iscritto.
  </p>

  <h2>2. Prestazione</h2>
  <p>
    Wartungsheft è un libretto di manutenzione digitale sotto forma di web app: registrare veicoli, fatture e
    manutenzioni, leggere fatture e documenti con l'IA (scansione e chat), scadenze e promemoria via e-mail, costi ed
    esportazioni. L'app funziona anche offline e sincronizza i dati non appena la connessione è di nuovo disponibile.
  </p>
  <p>
    L'IA legge fatture, licenze di circolazione e libretti di manutenzione. Può sbagliarsi. Verifica i valori ripresi
    prima di farvi affidamento. Scadenze e promemoria sono un ausilio e non sostituiscono né le prescrizioni del
    costruttore né le convocazioni ufficiali, ad esempio al collaudo.
  </p>
  <p>
    Sviluppiamo Wartungsheft costantemente. Le funzioni possono cambiare, purché resti garantito il nucleo:
    registrare, analizzare ed esportare fatture e manutenzioni per veicolo.
  </p>

  <h2>3. Account</h2>
  <p>
    Accedi con il tuo indirizzo e-mail e un codice monouso oppure con Google. Proteggi l'accesso a questa casella di
    posta, perché chi la legge può accedere. Le aziende possono usare un account su un indirizzo di team
    (p. es. fuhrpark@betrieb.ch) con più persone.
  </p>

  <h2>4. Periodo di prova</h2>
  <p>
    Ogni nuovo account può provare Wartungsheft per 30 giorni con tutte le funzioni. Il periodo di prova inizia con la
    prima scansione o la prima richiesta in chat. È gratuito, non richiede alcun mezzo di pagamento e termina da sé,
    senza che nasca un abbonamento.
  </p>
  <p>
    Dopo il periodo di prova, la scansione con l'IA e la chat richiedono un abbonamento. Consultazione, registrazione
    manuale ed esportazioni restano possibili senza abbonamento.
  </p>

  <h2>5. Abbonamento e prezzi</h2>
  <ul>
    <li>
      <strong>Privati:</strong> {{ formatCurrency(PRIVATE_YEARLY_CHF) }} all'anno per un massimo di
      {{ PRIVATE_MAX_VEHICLES }} veicoli. Dal sesto veicolo si applica anche ai privati il prezzo per veicolo.
    </li>
    <li>
      <strong>Aziende:</strong> {{ formatCurrency(BUSINESS_VEHICLE_YEARLY_CHF) }} per veicolo e anno, fattura
      intestata all'azienda. Determinante è il numero indicato al momento dell'ordinazione e, a ogni rinnovo, il numero
      dei veicoli attivi in quel momento (quelli venduti o ceduti non contano). Se durante l'anno si aggiungono veicoli,
      non viene fatturato alcun supplemento.
    </li>
  </ul>
  <p>
    Entrambi gli abbonamenti offrono le stesse funzioni. I prezzi si intendono in franchi svizzeri. Il fornitore non è
    assoggettato all'IVA, perciò le fatture non contengono l'IVA.
  </p>
  <p>
    L'uso dell'IA è compreso nell'abbonamento, nei limiti di un uso normale. Contro gli abusi valgono limiti tecnici
    (richieste al minuto e un generoso contingente mensile), che con un uso ordinario non vengono raggiunti. Le
    interrogazioni automatizzate di massa non sono consentite.
  </p>

  <h2>6. Fattura e pagamento</h2>
  <p>
    L'abbonamento viene fatturato in anticipo per un anno. La fattura arriva via e-mail ed è pagabile entro 30 giorni.
    Dopo l'ordinazione puoi continuare a lavorare subito, fino alla fine di questo termine.
    Se ordini durante il periodo di prova, l'anno pagato inizia solo al termine di quest'ultimo.
  </p>
  <p>
    L'abbonamento diventa vincolante solo con il tuo pagamento. Se non paghi, non devi fare nulla: nessun costo, e la
    scansione con l'IA e la chat si fermano alla scadenza del termine di pagamento. I tuoi dati restano consultabili
    ed esportabili. Se paghi più tardi, ripartono.
  </p>

  <h2>7. Durata e rinnovo</h2>
  <p>
    L'anno pagato va fino alla sua fine e non si prolunga da sé. 30 giorni prima della scadenza ti inviamo la fattura
    per un ulteriore anno, come offerta, in base al numero dei veicoli attivi in quel momento. Se la paghi,
    l'abbonamento continua per un anno; se non la paghi, non devi fare nulla, e la scansione con l'IA e la chat si
    fermano alla fine dell'anno pagato. Un pagamento tardivo le riattiva.
  </p>
  <p>
    Non c'è nessun pulsante per interrompere l'abbonamento e nessun termine da rispettare. Se non vuoi altre fatture,
    scrivi a <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>; interrompiamo l'invio e annulliamo le
    fatture aperte. Un anno già pagato va fino alla sua fine; non è previsto alcun rimborso.
  </p>
  <p>
    Possiamo porre fine all'abbonamento con un preavviso di tre mesi per la fine dell'anno pagato, e con effetto
    immediato in caso di abuso. Se cessiamo completamente Wartungsheft, rimborsiamo pro rata gli importi già pagati
    per la durata residua.
  </p>

  <h2>8. Modifiche di prezzo</h2>
  <p>
    Annunciamo le modifiche di prezzo via e-mail almeno 60 giorni prima della prossima fattura di rinnovo. Esse
    valgono a partire dalla durata successiva. Se non sei d'accordo, semplicemente non paghi quella fattura (cifra 7).
  </p>

  <h2>9. I tuoi dati</h2>
  <p>
    I dati che registri appartengono a te. Puoi esportarli in qualsiasi momento (CSV, PDF ed esportazione completa
    nelle impostazioni), anche senza abbonamento. Effettuiamo copie di sicurezza ogni giorno. I documenti importanti
    dovresti comunque conservarli anche tu, ad esempio come esportazione o in originale.
  </p>
  <p>
    Elimini tu stesso il tuo account nelle impostazioni («Konto löschen», eliminare l'account), con tutti i veicoli,
    le fatture e i giustificativi, subito e definitivamente; oppure scrivi a
    <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a> e ce ne occupiamo noi. Le fatture che ti abbiamo
    emesso le conserviamo per tutto il tempo richiesto dalla legge. Come trattiamo i dati personali è descritto
    nel documento
    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -- Zeilenumbruch im Link ergäbe ein Leerzeichen vor dem Punkt -->
    <router-link to="/it/datenschutz">Informativa sulla privacy</router-link>.
  </p>

  <h2>10. Obblighi nell'uso</h2>
  <ul>
    <li>Carica solo contenuti per i quali disponi dei diritti necessari, e nessun contenuto illecito.</li>
    <li>Non tentare di aggirare le misure di sicurezza o i limiti d'uso dell'IA.</li>
    <li>Non cedere accessi a terzi e non usare account altrui.</li>
  </ul>

  <h2>11. Disponibilità</h2>
  <p>
    Ci impegniamo per un funzionamento il più possibile ininterrotto, ma non possiamo garantirlo. Manutenzioni,
    disfunzioni presso terzi (hosting, e-mail, fornitori di IA) o forza maggiore possono limitare temporaneamente
    l'app. Se possibile, annunciamo in anticipo le interruzioni pianificate di maggiore entità.
  </p>

  <h2>12. Responsabilità</h2>
  <p>
    Rispondiamo dei danni che causiamo intenzionalmente o per negligenza grave. La responsabilità per negligenza lieve
    è esclusa nella misura consentita dalla legge. È esclusa in particolare la responsabilità per danni conseguenti
    derivanti da valori letti in modo errato, da scadenze o appuntamenti mancati, nonché per il lucro cessante. In ogni
    caso la responsabilità è limitata all'importo che hai pagato per Wartungsheft negli ultimi dodici mesi. È fatta
    salva la responsabilità legale imperativa, ad esempio per danni alla persona.
  </p>

  <h2>13. Modifiche delle presenti CG</h2>
  <p>
    Comunichiamo le modifiche via e-mail almeno 30 giorni prima della loro entrata in vigore. Se non sei d'accordo,
    puoi smettere alla data dell'entrata in vigore (e-mail a <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>);
    in tal caso rimborsiamo pro rata gli importi già pagati per la durata residua. Se continui a usare Wartungsheft in
    seguito, valgono le nuove CG.
  </p>

  <h2>14. Diritto applicabile e foro</h2>
  <p>
    Si applica il diritto svizzero, con esclusione della Convenzione di Vienna (CISG). Il foro è presso la sede del
    fornitore a Steinach SG. Per le consumatrici e i consumatori valgono i fori imperativi del Codice di procedura
    civile.
  </p>
</template>
