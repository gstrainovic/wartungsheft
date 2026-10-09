<template>
  <h1>Politique de confidentialité</h1>
  <p class="legal-updated">
    État : octobre 2026
  </p>
  <p class="legal-updated">
    Ceci est une traduction. Seule la version allemande fait foi :
    <router-link to="/datenschutz">
      Datenschutzerklärung (version allemande)
    </router-link>
  </p>

  <h2>1. Responsable du traitement</h2>
  <p>
    <strong>Goran Strainovic</strong><br>
    Strainovic IT (entreprise individuelle)<br>
    Bahnstrasse 9b<br>
    9323 Steinach<br>
    Suisse<br>
    E-mail : <a href="mailto:info@wartungsheft.ch">info@wartungsheft.ch</a>
  </p>

  <h2>2. Principe</h2>
  <p>
    La protection de vos données personnelles nous tient à cœur. Nous traitons vos données
    personnelles conformément à la loi fédérale sur la protection des données (LPD) et, dans la
    mesure où il est applicable, au règlement général sur la protection des données de l'UE (RGPD).
  </p>
  <p>
    Nous ne collectons que les données réellement nécessaires à l'utilisation de notre application.
  </p>

  <h2>3. Données collectées</h2>

  <h3>3.1 Données du compte</h3>
  <ul>
    <li><strong>Adresse e-mail</strong> — pour la connexion par Magic Code</li>
  </ul>
  <p>Nous n'enregistrons aucun mot de passe. L'authentification se fait au moyen de codes à usage unique envoyés par e-mail.</p>

  <h3>3.2 Données du véhicule</h3>
  <ul>
    <li>Marque, modèle, année</li>
    <li>Kilométrage</li>
    <li>Plaques de contrôle et numéro de châssis (VIN)</li>
  </ul>

  <h3>3.3 Comptage sur les pages d'offre</h3>
  <p>
    Sur les pages publiques, nous comptons combien de fois le bouton « Essayer 30 jours gratuitement » est
    actionné, et depuis laquelle des deux pages d'offre. Seuls le nom de l'événement, la page et l'heure sont
    enregistrés — aucune adresse IP, aucun cookie, aucun lien avec une personne. Nous n'utilisons aucun outil
    d'analyse ni aucun service de suivi publicitaire.
  </p>

  <h3>3.4 Données de factures et d'entretien</h3>
  <ul>
    <li>Nom du garage, date, montant</li>
    <li>Positions détaillées (travaux et pièces)</li>
    <li>Images et PDF de factures téléversés</li>
    <li>
      Le canal par lequel une saisie a été créée (chat, formulaire, carnet d'entretien …), afin d'améliorer
      l'application là où elle est utilisée. Nous n'enregistrons ni les clics ni les déplacements dans l'application.
    </li>
  </ul>

  <h3>3.5 Retours depuis l'application</h3>
  <p>
    Lorsque vous écrivez via « Signaler un problème ou un souhait » ou enregistrez un
    message vocal, le texte ou l'enregistrement est transmis à notre boîte de réception avec votre adresse e-mail,
    la page sur laquelle vous vous trouviez et l'heure. Nous faisons transcrire automatiquement les messages vocaux
    par Mistral (France, UE), afin de les lire plutôt que de les écouter ; l'enregistrement lui-même reste ensuite
    uniquement dans notre boîte de réception et n'est pas traité davantage. Vous décidez à chaque retour si vous
    parlez ou écrivez. Nous conservons les retours aussi longtemps que nous en avons besoin pour améliorer
    l'application, au plus deux ans.
  </p>

  <h3>3.6 Question sur l'origine lors de la connexion</h3>
  <p>
    Lors de la connexion sur un nouvel appareil, nous vous demandons, à titre facultatif, comment vous avez découvert
    Wartungsheft (recherche Google, annonce, recommandation, annuaire, réseaux sociaux ou autre, avec un court texte
    libre). La réponse choisie et l'éventuel texte libre sont enregistrés dans votre compte, dans notre base de données
    sur notre propre serveur chez Infomaniak, en Suisse. La seule finalité est de savoir par quels canaux les gens
    trouvent Wartungsheft, afin de placer la publicité et les inscriptions là où elles sont efficaces. La réponse n'est
    pas communiquée à des tiers, ni utilisée pour du profilage ou pour vous adresser de la publicité. Jusqu'à la
    connexion, votre choix n'est conservé que dans votre navigateur (localStorage) et il en est retiré après la
    connexion. La réponse est supprimée avec votre compte, ou plus tôt sur demande à info@wartungsheft.ch.
  </p>

  <h3>3.7 E-mails de retour pendant la période d'essai</h3>
  <p>
    Pendant la période d'essai, nous vous envoyons au plus trois e-mails : peu après l'inscription, un e-mail de
    bienvenue avec les premiers pas qui, si vous n'avez pas indiqué lors de l'inscription comment vous nous avez
    connus, contient la question de savoir comment vous avez découvert Wartungsheft ; le 21e jour, des questions sur
    votre expérience, ce qui vous a plu et ce qui a manqué ; et le lendemain de la fin de la période d'essai, une
    seule question si aucun abonnement n'a été commandé. Les comptes avec abonnement ne reçoivent pas ces e-mails.
    L'envoi passe par Resend, comme pour les rappels (section 7). La réponse est facultative ; elle arrive à
    info@wartungsheft.ch, n'est exploitée que pour améliorer l'application et est conservée, comme les retours depuis
    l'application, au plus deux ans. Les indications facultatives telles que le métier, l'âge ou l'usage privé ou
    professionnel ne sont traitées que si vous les envoyez de votre propre initiative. La base juridique est notre
    intérêt légitime à améliorer l'offre. Vous pouvez désactiver ces e-mails dans les paramètres, rubrique « Rappels » ;
    les e-mails de rappel sont alors désactivés eux aussi.
  </p>

  <h3>3.8 Données d'abonnement et de facturation (abonnement annuel entreprise)</h3>
  <ul>
    <li>Entreprise, personne de contact, adresse de facturation, e-mail de facturation, référence facultative</li>
    <li>Nombre de véhicules facturés, factures avec montant, référence de paiement et encaissement</li>
  </ul>

  <h3>3.9 Données techniques</h3>
  <ul>
    <li>Adresse IP (journaux du serveur, supprimés automatiquement après 30 jours)</li>
    <li>Type et version du navigateur</li>
    <li>Aucun cookie à des fins de suivi</li>
  </ul>

  <h2>4. Finalité du traitement</h2>
  <table>
    <thead>
      <tr>
        <th>Données</th>
        <th>Finalité</th>
        <th>Base juridique</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>E-mail</td>
        <td>Authentification, accès au compte</td>
        <td>Exécution du contrat</td>
      </tr>
      <tr>
        <td>Données du véhicule et des factures</td>
        <td>Fonction principale : suivi de l'entretien</td>
        <td>Exécution du contrat</td>
      </tr>
      <tr>
        <td>Images / PDF</td>
        <td>Extraction de données assistée par IA</td>
        <td>Consentement (téléversement par l'utilisateur)</td>
      </tr>
      <tr>
        <td>Données d'abonnement et de facturation</td>
        <td>Facturation, encaissement, renouvellement et résiliation de l'abonnement</td>
        <td>Exécution du contrat, obligation légale de conservation</td>
      </tr>
      <tr>
        <td>Réponse sur l'origine</td>
        <td>Savoir par quels canaux les utilisateurs trouvent Wartungsheft ; planification de la publicité et des inscriptions</td>
        <td>Consentement (indication facultative)</td>
      </tr>
      <tr>
        <td>Réponses aux e-mails de retour</td>
        <td>Amélioration de l'application</td>
        <td>Intérêt légitime</td>
      </tr>
      <tr>
        <td>Adresse IP</td>
        <td>Sécurité du serveur, prévention des abus</td>
        <td>Intérêt légitime</td>
      </tr>
    </tbody>
  </table>

  <h2>5. Traitement assisté par IA</h2>
  <p>
    Wartungsheft utilise un service d'IA pour extraire des données de photos de factures et de documents,
    ainsi que pour l'assistant de chat. Les images, PDF et messages de chat sont alors transmis au prestataire
    suivant :
  </p>
  <table>
    <thead>
      <tr>
        <th>Prestataire</th>
        <th>Siège</th>
        <th>Entraînement sur les données</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Mistral AI</td>
        <td>France (UE)</td>
        <td>Entraînement avec vos données désactivé</td>
      </tr>
    </tbody>
  </table>
  <p>
    <strong>Important :</strong> les requêtes d'IA passent par notre serveur avec notre compte Mistral ; vous
    ne concluez aucun contrat propre avec Mistral. L'entraînement avec les données des clients est désactivé
    dans ce compte. Les images et les textes ne sont transmis à Mistral que pour traiter la requête et ne sont
    pas enregistrés durablement.
  </p>

  <h2>6. Stockage des données</h2>

  <h3>6.1 Base de données</h3>
  <p>
    Vos données sont enregistrées dans une instance InstantDB auto-hébergée. Le serveur se trouve dans
    l'Infomaniak Public Cloud en Suisse. Les données sont transmises de manière chiffrée (TLS).
  </p>

  <h3>6.2 Stockage local (mode hors ligne)</h3>
  <p>
    Pour le fonctionnement hors ligne, vos données sont en outre enregistrées dans l'IndexedDB de votre
    navigateur. Ces données ne quittent pas votre appareil et sont supprimées automatiquement lors de la
    désinstallation de l'application.
  </p>

  <h3>6.3 Durée de conservation</h3>
  <ul>
    <li><strong>Données du compte :</strong> jusqu'à la suppression de votre compte</li>
    <li><strong>Données du véhicule et des factures :</strong> jusqu'à leur suppression par vous</li>
    <li><strong>Factures de l'abonnement :</strong> 10 ans (obligation de conservation, art. 958f CO)</li>
    <li><strong>Réponse sur l'origine :</strong> jusqu'à la suppression de votre compte, plus tôt sur demande</li>
    <li><strong>Réponses aux e-mails de retour :</strong> au plus deux ans</li>
    <li><strong>Journaux du serveur :</strong> 30 jours</li>
    <li><strong>Cache OCR :</strong> jusqu'à la suppression de la facture correspondante</li>
  </ul>

  <h2>7. Communication à des tiers</h2>
  <p>Nous ne vendons pas vos données. Elles sont communiquées exclusivement à :</p>
  <table>
    <thead>
      <tr>
        <th>Service</th>
        <th>Finalité</th>
        <th>Siège</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Infomaniak Network SA</td>
        <td>Hébergement du serveur et du frontend, domaine</td>
        <td>Suisse</td>
      </tr>
      <tr>
        <td>Resend (Plus Five Five, Inc.)</td>
        <td>Envoi par e-mail des codes de connexion, des rappels et des factures d'abonnement ; sont traités l'adresse e-mail et le contenu du message (pour les factures : entreprise, adresse et montant), envoi depuis l'Irlande (UE), contrat avec clauses contractuelles types de l'UE pour la Suisse</td>
        <td>États-Unis / Irlande</td>
      </tr>
      <tr>
        <td>Mistral AI</td>
        <td>Analyse d'images et de documents, assistant de chat (section 5)</td>
        <td>France (UE)</td>
      </tr>
    </tbody>
  </table>
  <p>
    Pour les prestataires américains, les clauses contractuelles types (CCT) servent de base au transfert
    des données.
  </p>

  <h2>8. Vos droits</h2>
  <p>Selon la LPD et le RGPD, vous disposez des droits suivants :</p>
  <ul>
    <li><strong>Accès :</strong> vous pouvez en tout temps demander des renseignements sur les données enregistrées vous concernant.</li>
    <li><strong>Rectification :</strong> vous pouvez corriger vous-même les données inexactes ou nous demander de le faire.</li>
    <li><strong>Effacement :</strong> vous pouvez en tout temps supprimer vous-même vos données dans l'application ou demander la suppression de votre compte.</li>
    <li><strong>Portabilité des données :</strong> vous pouvez télécharger vos données sous forme d'export (CSV/PDF).</li>
    <li><strong>Opposition :</strong> vous pouvez en tout temps vous opposer au traitement des données.</li>
  </ul>
  <p>
    Pour exercer vos droits, contactez-nous à l'adresse e-mail indiquée dans les mentions légales.
  </p>

  <h2>9. Autorité de surveillance</h2>
  <p>
    Autorité de protection des données compétente en Suisse :<br>
    <strong>Préposé fédéral à la protection des données et à la transparence (PFPDT)</strong><br>
    Feldeggweg 1, 3003 Berne<br>
    <a href="https://www.edoeb.admin.ch" target="_blank" rel="noopener">www.edoeb.admin.ch</a>
  </p>

  <h2>10. Cookies</h2>
  <p>
    Wartungsheft n'utilise <strong>aucun cookie de suivi</strong>.
    Seules des données techniquement nécessaires sont enregistrées dans le navigateur
    (localStorage pour les paramètres, IndexedDB pour les données hors ligne).
    Après la connexion, le navigateur retient votre adresse e-mail, même après la déconnexion,
    afin que la page de connexion la préremplisse. Elle ne quitte pas votre appareil.
    « Andere E-Mail » (autre e-mail) sur la page de connexion la supprime.
  </p>

  <h2>11. Modifications</h2>
  <p>
    Nous pouvons adapter la présente politique de confidentialité en tout temps. La version actuelle est
    toujours disponible sur cette page. En cas de modifications importantes, nous informons les utilisateurs
    enregistrés par e-mail.
  </p>
</template>
