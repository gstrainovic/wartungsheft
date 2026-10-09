<template>
  <h1>Informativa sulla privacy</h1>
  <p class="legal-updated">
    Stato: ottobre 2026
  </p>
  <p class="legal-updated">
    Questa è una traduzione. Fa stato unicamente la versione tedesca:
    <router-link to="/datenschutz">
      Datenschutzerklärung (versione tedesca)
    </router-link>
  </p>

  <h2>1. Titolare del trattamento</h2>
  <p>
    <strong>Goran Strainovic</strong><br>
    Strainovic IT (ditta individuale)<br>
    Bahnstrasse 9b<br>
    9323 Steinach<br>
    Svizzera<br>
    E-mail: <a href="mailto:info@wartungsheft.ch">info@wartungsheft.ch</a>
  </p>

  <h2>2. Principio</h2>
  <p>
    La protezione dei tuoi dati personali ci sta a cuore. Trattiamo i tuoi dati personali in conformità
    alla legge federale sulla protezione dei dati (LPD) e, per quanto applicabile, al regolamento generale
    sulla protezione dei dati dell'UE (RGPD).
  </p>
  <p>
    Raccogliamo soltanto i dati effettivamente necessari per l'utilizzo della nostra app.
  </p>

  <h2>3. Quali dati raccogliamo</h2>

  <h3>3.1 Dati dell'account</h3>
  <ul>
    <li><strong>Indirizzo e-mail</strong> — per l'accesso tramite Magic Code</li>
  </ul>
  <p>Non salviamo alcuna password. L'autenticazione avviene tramite codici monouso inviati per e-mail.</p>

  <h3>3.2 Dati del veicolo</h3>
  <ul>
    <li>Marca, modello, anno</li>
    <li>Chilometraggio</li>
    <li>Targa e numero di telaio (VIN)</li>
  </ul>

  <h3>3.3 Conteggio sulle pagine dell'offerta</h3>
  <p>
    Sulle pagine pubbliche contiamo quante volte viene premuto il pulsante «Prova gratis per 30 giorni» e da
    quale delle due pagine dell'offerta. Vengono salvati soltanto il nome dell'evento, la pagina e il momento —
    nessun indirizzo IP, nessun cookie, nessun riferimento a una persona. Non utilizziamo strumenti di analisi
    né servizi di tracciamento pubblicitario.
  </p>

  <h3>3.4 Dati di fatture e manutenzioni</h3>
  <ul>
    <li>Nome dell'officina, data, importo</li>
    <li>Singole posizioni (lavori e pezzi)</li>
    <li>Immagini e PDF di fatture caricati</li>
    <li>
      Il canale attraverso cui è nata una registrazione (chat, modulo, libretto di manutenzione …), per migliorare
      l'app là dove viene usata. Non registriamo clic e movimenti all'interno dell'app.
    </li>
  </ul>

  <h3>3.5 Segnalazioni dall'app</h3>
  <p>
    Se scrivi tramite «Segnala un errore o un desiderio» o registri un messaggio
    vocale, il testo o la registrazione giunge nella nostra casella di posta insieme al tuo indirizzo e-mail,
    alla pagina in cui ti trovavi e al momento. Facciamo trascrivere automaticamente i messaggi vocali da Mistral
    (Francia, UE), per leggerli anziché ascoltarli; la registrazione stessa resta in seguito solo nella nostra
    casella di posta e non viene ulteriormente trattata. Per ogni segnalazione decidi di nuovo se parlare o
    scrivere. Conserviamo le segnalazioni per il tempo necessario al miglioramento dell'app, al massimo due anni.
  </p>

  <h3>3.6 Domanda sulla provenienza all'accesso</h3>
  <p>
    All'accesso da un nuovo dispositivo ti chiediamo, in modo facoltativo, come hai scoperto Wartungsheft (ricerca
    Google, annuncio, consiglio di qualcuno, elenco, social media oppure altro, con un breve testo libero). La risposta
    scelta e l'eventuale testo libero vengono salvati nel tuo account, nella nostra banca dati sul nostro server presso
    Infomaniak, in Svizzera. L'unico scopo è capire attraverso quali canali le persone trovano Wartungsheft, per fare
    pubblicità e inserimenti là dove funzionano. La risposta non viene comunicata a terzi, né usata per profilazione o
    per inviarti pubblicità. Fino all'accesso la tua scelta resta soltanto nel tuo browser (localStorage) e dopo
    l'accesso viene rimossa da lì. La risposta viene cancellata insieme al tuo account, oppure prima su richiesta a
    info@wartungsheft.ch.
  </p>

  <h3>3.7 E-mail di riscontro durante il periodo di prova</h3>
  <p>
    Durante il periodo di prova ti inviamo al massimo tre e-mail: poco dopo la registrazione un'e-mail di benvenuto
    con i primi passi che, se al momento della registrazione non hai indicato come ci hai conosciuti, contiene la
    domanda su come hai scoperto Wartungsheft; il 21° giorno domande sulla tua esperienza, su che cosa ti è piaciuto e
    che cosa è mancato; e il giorno dopo la fine del periodo di prova una sola domanda, se non è stato ordinato alcun
    abbonamento. Gli account con abbonamento non ricevono queste e-mail. L'invio
    avviene tramite Resend, come per i promemoria (sezione 7). La risposta è facoltativa; giunge a
    info@wartungsheft.ch, viene valutata solo per migliorare l'app e conservata, come le segnalazioni dall'app, al
    massimo due anni. Indicazioni facoltative come lavoro, età o uso privato oppure aziendale vengono trattate solo se
    le invii di tua iniziativa. La base giuridica è il nostro interesse legittimo a migliorare l'offerta. Puoi
    disattivare queste e-mail nelle impostazioni, sezione «Promemoria»; in tal caso vengono disattivate anche le e-mail
    di promemoria.
  </p>

  <h3>3.8 Dati di abbonamento e fatturazione (abbonamento annuale azienda)</h3>
  <ul>
    <li>Azienda, persona di contatto, indirizzo di fatturazione, e-mail di fatturazione, riferimento facoltativo</li>
    <li>Numero di veicoli fatturati, fatture con importo, riferimento di pagamento e incasso</li>
  </ul>

  <h3>3.9 Dati tecnici</h3>
  <ul>
    <li>Indirizzo IP (log del server, cancellati automaticamente dopo 30 giorni)</li>
    <li>Tipo e versione del browser</li>
    <li>Nessun cookie a scopo di tracciamento</li>
  </ul>

  <h2>4. Scopo del trattamento dei dati</h2>
  <table>
    <thead>
      <tr>
        <th>Dati</th>
        <th>Scopo</th>
        <th>Base giuridica</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>E-mail</td>
        <td>Autenticazione, accesso all'account</td>
        <td>Esecuzione del contratto</td>
      </tr>
      <tr>
        <td>Dati di veicoli e fatture</td>
        <td>Funzione principale: tracciamento delle manutenzioni</td>
        <td>Esecuzione del contratto</td>
      </tr>
      <tr>
        <td>Immagini / PDF</td>
        <td>Estrazione di dati assistita dall'IA</td>
        <td>Consenso (caricamento da parte dell'utente)</td>
      </tr>
      <tr>
        <td>Dati di abbonamento e fatturazione</td>
        <td>Fatturazione, incasso, rinnovo e disdetta dell'abbonamento</td>
        <td>Esecuzione del contratto, obbligo legale di conservazione</td>
      </tr>
      <tr>
        <td>Risposta sulla provenienza</td>
        <td>Capire attraverso quali canali gli utenti trovano Wartungsheft; pianificazione di pubblicità e inserimenti</td>
        <td>Consenso (indicazione facoltativa)</td>
      </tr>
      <tr>
        <td>Risposte alle e-mail di riscontro</td>
        <td>Miglioramento dell'app</td>
        <td>Interesse legittimo</td>
      </tr>
      <tr>
        <td>Indirizzo IP</td>
        <td>Sicurezza del server, prevenzione degli abusi</td>
        <td>Interesse legittimo</td>
      </tr>
    </tbody>
  </table>

  <h2>5. Trattamento assistito dall'IA</h2>
  <p>
    Wartungsheft utilizza un servizio di IA per estrarre dati da foto di fatture e documenti, nonché per
    l'assistente di chat. A tal fine immagini, PDF e messaggi di chat vengono trasmessi al seguente fornitore:
  </p>
  <table>
    <thead>
      <tr>
        <th>Fornitore</th>
        <th>Sede</th>
        <th>Addestramento sui dati</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Mistral AI</td>
        <td>Francia (UE)</td>
        <td>Addestramento con i tuoi dati disattivato</td>
      </tr>
    </tbody>
  </table>
  <p>
    <strong>Importante:</strong> le richieste all'IA passano dal nostro server con il nostro account Mistral;
    non concludi alcun contratto proprio con Mistral. L'addestramento con i dati dei clienti è disattivato in
    questo account. Immagini e testi vengono trasmessi a Mistral solo per elaborare la richiesta e non vengono
    salvati in modo permanente.
  </p>

  <h2>6. Conservazione dei dati</h2>

  <h3>6.1 Banca dati</h3>
  <p>
    I tuoi dati vengono salvati in un'istanza InstantDB ospitata in proprio. Il server si trova nella
    Infomaniak Public Cloud in Svizzera. I dati vengono trasmessi in forma cifrata (TLS).
  </p>

  <h3>6.2 Memorizzazione locale (modalità offline)</h3>
  <p>
    Per il funzionamento offline, i tuoi dati vengono inoltre salvati nell'IndexedDB del tuo browser. Questi
    dati non lasciano il tuo dispositivo e vengono cancellati automaticamente alla disinstallazione dell'app.
  </p>

  <h3>6.3 Durata di conservazione</h3>
  <ul>
    <li><strong>Dati dell'account:</strong> fino alla cancellazione del tuo account</li>
    <li><strong>Dati di veicoli e fatture:</strong> fino alla cancellazione da parte tua</li>
    <li><strong>Fatture dell'abbonamento:</strong> 10 anni (obbligo di conservazione, art. 958f CO)</li>
    <li><strong>Risposta sulla provenienza:</strong> fino alla cancellazione del tuo account, prima su richiesta</li>
    <li><strong>Risposte alle e-mail di riscontro:</strong> al massimo due anni</li>
    <li><strong>Log del server:</strong> 30 giorni</li>
    <li><strong>Cache OCR:</strong> fino alla cancellazione della relativa fattura</li>
  </ul>

  <h2>7. Comunicazione a terzi</h2>
  <p>Non vendiamo i tuoi dati. Una comunicazione avviene esclusivamente a:</p>
  <table>
    <thead>
      <tr>
        <th>Servizio</th>
        <th>Scopo</th>
        <th>Sede</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Infomaniak Network SA</td>
        <td>Hosting del server e del frontend, dominio</td>
        <td>Svizzera</td>
      </tr>
      <tr>
        <td>Resend (Plus Five Five, Inc.)</td>
        <td>Invio per e-mail dei codici di accesso, dei promemoria e delle fatture dell'abbonamento; vengono trattati l'indirizzo e-mail e il contenuto del messaggio (per le fatture: azienda, indirizzo e importo), invio dall'Irlanda (UE), contratto con clausole contrattuali tipo dell'UE per la Svizzera</td>
        <td>USA / Irlanda</td>
      </tr>
      <tr>
        <td>Mistral AI</td>
        <td>Analisi di immagini e documenti, assistente di chat (sezione 5)</td>
        <td>Francia (UE)</td>
      </tr>
    </tbody>
  </table>
  <p>
    Per i fornitori statunitensi, le clausole contrattuali tipo (CCT) costituiscono la base per il
    trasferimento dei dati.
  </p>

  <h2>8. I tuoi diritti</h2>
  <p>Secondo la LPD svizzera e il RGPD hai i seguenti diritti:</p>
  <ul>
    <li><strong>Accesso:</strong> puoi chiedere in qualsiasi momento informazioni sui dati salvati che ti riguardano.</li>
    <li><strong>Rettifica:</strong> puoi correggere tu stesso i dati inesatti o chiederci di farlo.</li>
    <li><strong>Cancellazione:</strong> puoi cancellare in qualsiasi momento tu stesso i tuoi dati nell'app o chiedere la cancellazione del tuo account.</li>
    <li><strong>Portabilità dei dati:</strong> puoi scaricare i tuoi dati come esportazione (CSV/PDF).</li>
    <li><strong>Opposizione:</strong> puoi opporti in qualsiasi momento al trattamento dei dati.</li>
  </ul>
  <p>
    Per esercitare i tuoi diritti contattaci all'indirizzo e-mail indicato nelle note legali.
  </p>

  <h2>9. Autorità di vigilanza</h2>
  <p>
    Autorità di protezione dei dati competente in Svizzera:<br>
    <strong>Incaricato federale della protezione dei dati e della trasparenza (IFPDT)</strong><br>
    Feldeggweg 1, 3003 Berna<br>
    <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener">www.edoeb.admin.ch</a>
  </p>

  <h2>10. Cookie</h2>
  <p>
    Wartungsheft non utilizza <strong>cookie di tracciamento</strong>.
    Nel browser vengono salvati esclusivamente dati tecnicamente necessari
    (localStorage per le impostazioni, IndexedDB per i dati offline).
    Dopo l'accesso il browser memorizza il tuo indirizzo e-mail, anche dopo la disconnessione,
    affinché la pagina di accesso lo precompili. L'indirizzo non lascia il tuo dispositivo.
    «Andere E-Mail» (altra e-mail) sulla pagina di accesso lo cancella.
  </p>

  <h2>11. Modifiche</h2>
  <p>
    Possiamo modificare la presente informativa sulla privacy in qualsiasi momento. La versione attuale è
    sempre disponibile su questa pagina. In caso di modifiche sostanziali informiamo gli utenti registrati
    per e-mail.
  </p>
</template>
