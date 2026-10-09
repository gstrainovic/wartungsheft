<script setup lang="ts">
import type { Frage } from '../hilfe'

defineProps<{ fragen: Frage[] }>()

const CONTACT_EMAIL = 'info@wartungsheft.ch'
</script>

<template>
  <h1>Aiuto: come tenere il tuo libretto di manutenzione</h1>
  <p class="legal-meta">
    Nove procedure, ognuna in poche frasi. Se da qualche parte non vai avanti, scrivi a
    <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a> o registra un messaggio vocale nell'app alla voce
    «Segnala un errore o un desiderio». L'app parla italiano: la lingua si sceglie nelle impostazioni.
  </p>

  <h2>1. Registrare un veicolo</h2>
  <p>
    «Aggiungi veicolo» nella dashboard o nell'elenco dei veicoli. Puoi fotografare la licenza
    di circolazione: l'app compila da sola targa, marca, tipo, numero di telaio e prima messa in circolazione. I
    campi vuoti restano vuoti: anno di costruzione e chilometraggio 0 significano «sconosciuto», non «zero». Dopo
    il salvataggio ti trovi sulla pagina del veicolo, dove una lista di controllo propone i passi successivi.
    Ognuno si può saltare.
  </p>

  <h2>2. Registrare una fattura e aggiungere vecchie fatture</h2>
  <p>
    «Aggiungi fattura» sulla pagina del veicolo, poi una foto della fattura dell'officina.
    L'app ne ricava officina, data, importo e le singole voci e crea subito una manutenzione per ogni categoria.
    Funzionano anche più foto o un PDF cumulativo: ne risulta una lista di controllo in cui confermi ogni fattura
    singolarmente. Se l'app riconosce una fattura doppia, lo segnala invece di salvarla due volte. Puoi anche
    inserire tutto a mano o dettarlo.
  </p>

  <h2>3. Registrare una manutenzione senza fattura</h2>
  <p>
    Non ogni lavoro ha un giustificativo: olio cambiato da sé, pneumatici montati da un amico. Nella scheda
    «Cronologia» lo registri tramite «Aggiungi manutenzione»: tipo, data,
    chilometraggio, descrizione. Per il piano di manutenzione questa registrazione conta esattamente come una
    ricavata da una fattura.
  </p>

  <h2>4. Inserire libretto di manutenzione e intervalli</h2>
  <p>
    Senza indicazioni proprie l'app calcola con intervalli generici. Diventa più preciso con il libretto di
    manutenzione stampato: «Fotografa il libretto di manutenzione» legge gli
    intervalli del costruttore e i timbri dei servizi precedenti e te li propone. I timbri già registrati vengono
    riconosciuti dall'app e non inseriti due volte. I singoli intervalli si possono poi adattare a mano.
  </p>

  <h2>5. Esportare i costi</h2>
  <p>
    Scheda «Costi» sulla pagina del veicolo: costi per anno e categoria, come CSV per Excel o come dossier
    PDF con dati di base, manutenzioni e fatture. Per tutti i veicoli insieme la stessa tabella si trova nella
    dashboard. Le fatture in euro vengono convertite dall'app nella tua valuta di riferimento al cambio della data
    della fattura; senza cambio l'importo resta nella sua valuta ed è indicato a
    parte.
  </p>

  <h2>6. Ricevere un promemoria e spuntare un lavoro</h2>
  <p>
    Quando un lavoro è in scadenza (30 giorni o 1'000 chilometri prima), Wartungsheft invia un'e-mail con tutto ciò
    che c'è da fare. Il link contenuto porta direttamente al veicolo. Quando il lavoro è fatto, lo registri con
    «Segna come fatto» nell'elenco delle scadenze; data e chilometraggio sono precompilati. Se
    hai già un appuntamento, imposta lo stato su «Pianificato»: allora l'app non ti ricorda più. I
    promemoria si possono disattivare nelle impostazioni.
  </p>

  <h2>7. Vendere o cedere un veicolo</h2>
  <p>
    Prima della vendita: generare il libretto di manutenzione in PDF, con o senza prezzi. Poi, sulla pagina del
    veicolo, «Venduto o ceduto» con data e chilometraggio. Il veicolo scompare dalla
    dashboard e dai promemoria, ma resta nei costi e nelle esportazioni. Non devi cancellare nulla, e l'operazione
    si può anche annullare.
  </p>

  <h2>8. Tenere aggiornato il chilometraggio</h2>
  <p>
    Ogni fattura con un chilometraggio più alto aggiorna automaticamente quello del veicolo. Nel frattempo puoi
    aggiornarlo direttamente nella dashboard. Ne vale la pena, perché la scadenza si calcola in base alla data e ai
    chilometri.
  </p>

  <h2>9. Parco veicoli: vedere cosa è in scadenza</h2>
  <p>
    La dashboard mostra per tutti i veicoli cosa è in scadenza o scaduto, il più urgente per primo. Un clic porta
    al veicolo. La tabella del parco veicoli sotto indica i costi per veicolo e anno e si può scaricare come CSV o
    PDF. Per le aziende valgono le stesse funzioni dei privati, cambia solo il listino prezzi.
  </p>

  <h2>Domande frequenti</h2>
  <template v-for="f in fragen" :key="f.frage">
    <h3>{{ f.frage }}</h3>
    <p>{{ f.antwort }}</p>
  </template>

  <h2>Ancora dubbi?</h2>
  <p>
    Scrivi a <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>. Nell'app funziona anche senza digitare:
    «Segnala un errore o un desiderio» nel menu registra un messaggio vocale.
    Gli aspetti legali si trovano nelle <router-link to="/it/agb">
      Condizioni generali (CG)
    </router-link> e
    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -- Zeilenumbruch im Link ergäbe ein Leerzeichen vor dem Punkt -->
    nell'<router-link to="/it/datenschutz">Informativa sulla privacy</router-link>.
  </p>
</template>
