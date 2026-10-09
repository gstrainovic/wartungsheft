<script setup lang="ts">
import { BUSINESS_VEHICLE_YEARLY_CHF, PRIVATE_MAX_VEHICLES, PRIVATE_YEARLY_CHF } from '@strainovic/ai-proxy/plans'
import { formatCurrency } from '../../lib/locale'

const CONTACT_EMAIL = 'info@wartungsheft.ch'
</script>

<template>
  <h1>Conditions générales</h1>
  <p class="legal-meta">
    Version du 22 septembre 2026
  </p>
  <p class="legal-meta">
    Ceci est une traduction. Seule la version allemande fait foi :
    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -- Zeilenumbruch im Link ergäbe ein Leerzeichen vor dem Punkt -->
    <router-link to="/agb">Allgemeine Geschäftsbedingungen</router-link>.
  </p>

  <h2>1. Prestataire et champ d’application</h2>
  <p>
    Wartungsheft (wartungsheft.ch) est une offre de Goran Strainovic, Strainovic IT (entreprise individuelle),
    Bahnstrasse 9b, 9323 Steinach, Suisse, e-mail <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>.
    Les présentes CG s’appliquent à tous les comptes, à la période d’essai et à tous les abonnements, pour les
    particuliers comme pour les entreprises. Des conditions divergentes ne s’appliquent que si nous les confirmons
    par écrit.
  </p>

  <h2>2. Prestation</h2>
  <p>
    Wartungsheft est un carnet d’entretien numérique sous forme d’application web : saisir des véhicules, des
    factures et des entretiens, lire des factures et des documents par IA (scan et chat), échéances et rappels par
    e-mail, coûts et exports. L’application fonctionne aussi hors ligne et synchronise les données dès qu’une
    connexion est rétablie.
  </p>
  <p>
    L’IA lit les factures, les permis de circulation et les carnets d’entretien. Elle peut se tromper. Vérifiez les
    valeurs reprises avant de vous y fier. Les échéances et les rappels sont une aide et ne remplacent ni les
    prescriptions du constructeur ni les convocations officielles, par exemple à l’expertise (MFK).
  </p>
  <p>
    Nous développons Wartungsheft en permanence. Les fonctions peuvent changer, tant que l’essentiel est préservé :
    consigner, analyser et exporter les factures et les entretiens par véhicule.
  </p>

  <h2>3. Compte</h2>
  <p>
    Vous vous connectez avec votre adresse e-mail et un code à usage unique, ou avec Google. Protégez l’accès à
    cette boîte de réception, car quiconque la lit peut se connecter. Les entreprises peuvent utiliser un compte
    sur une adresse d’équipe (p. ex. fuhrpark@betrieb.ch) à plusieurs personnes.
  </p>

  <h2>4. Période d’essai</h2>
  <p>
    Chaque nouveau compte peut tester Wartungsheft pendant 30 jours avec toutes les fonctions. La période d’essai
    commence avec le premier scan ou la première requête au chat. Elle est gratuite, n’exige aucun moyen de paiement
    et se termine d’elle-même, sans qu’un abonnement ne soit conclu.
  </p>
  <p>
    Après la période d’essai, le scan par IA et le chat nécessitent un abonnement. La consultation, la saisie
    manuelle et les exports restent possibles sans abonnement.
  </p>

  <h2>5. Abonnement et prix</h2>
  <ul>
    <li>
      <strong>Particulier :</strong> {{ formatCurrency(PRIVATE_YEARLY_CHF) }} par an pour jusqu’à
      {{ PRIVATE_MAX_VEHICLES }} véhicules. À partir du sixième véhicule, le prix par véhicule s’applique aussi aux
      particuliers.
    </li>
    <li>
      <strong>Entreprise :</strong> {{ formatCurrency(BUSINESS_VEHICLE_YEARLY_CHF) }} par véhicule et par an,
      facture au nom de l’entreprise. Le nombre déterminant est celui indiqué lors de la commande et, à chaque
      renouvellement, le nombre de véhicules alors actifs (les véhicules vendus ou cédés ne comptent pas). Si des
      véhicules s’ajoutent en cours d’année, aucun supplément n’est facturé.
    </li>
  </ul>
  <p>
    Les deux abonnements offrent les mêmes fonctions. Les prix s’entendent en francs suisses. Le prestataire n’est
    pas assujetti à la TVA, c’est pourquoi les factures ne contiennent pas de TVA.
  </p>
  <p>
    L’utilisation de l’IA est comprise dans l’abonnement, dans le cadre d’une utilisation normale. Pour prévenir les
    abus, des limites techniques s’appliquent (requêtes par minute et un contingent mensuel généreux), qui ne sont pas
    atteintes lors d’une utilisation ordinaire. Les requêtes automatisées en masse ne sont pas autorisées.
  </p>

  <h2>6. Facture et paiement</h2>
  <p>
    L’abonnement est facturé d’avance pour une année. La facture est envoyée par e-mail et est payable dans les
    30 jours. Après la commande, vous pouvez continuer à travailler immédiatement.
    Si vous commandez pendant la période d’essai, l’année payée ne commence qu’à la fin de celle-ci.
  </p>
  <p>
    Si une facture reste impayée après son échéance et un rappel, nous pouvons bloquer le scan par IA et le chat
    jusqu’à réception du paiement. Vos données restent consultables et exportables.
  </p>

  <h2>7. Durée, renouvellement et résiliation</h2>
  <p>
    L’abonnement dure un an et se renouvelle automatiquement pour une année supplémentaire si vous ne le résiliez
    pas. La facture pour l’année suivante est envoyée 30 jours avant l’échéance.
  </p>
  <p>
    Vous pouvez résilier à tout moment, sans délai, jusqu’au dernier jour de la durée : dans l’application sous
    « Réglages », « Résilier l’abonnement », ou par e-mail à
    <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>. L’abonnement continue alors jusqu’à la fin de
    l’année payée. Une facture pour une année qui n’a pas encore commencé est annulée avec la résiliation. Aucun
    remboursement au prorata n’est accordé pour une année entamée.
  </p>
  <p>
    Nous pouvons résilier l’abonnement moyennant un préavis de trois mois pour la fin de la durée, et avec effet
    immédiat pour de justes motifs (p. ex. abus ou retards de paiement répétés). Si nous cessons complètement
    l’exploitation de Wartungsheft, nous remboursons au prorata les montants déjà payés pour la durée restante.
  </p>

  <h2>8. Modifications de prix</h2>
  <p>
    Nous annonçons les modifications de prix par e-mail au moins 60 jours avant le prochain renouvellement. Elles
    s’appliquent à partir de la durée suivante. Si vous n’êtes pas d’accord, vous résiliez jusqu’à l’échéance, comme
    décrit au chiffre 7.
  </p>

  <h2>9. Vos données</h2>
  <p>
    Les données que vous saisissez vous appartiennent. Vous pouvez les exporter à tout moment (CSV, PDF et export
    complet dans les paramètres), même sans abonnement. Nous effectuons des copies de sauvegarde quotidiennes. Nous
    vous recommandons néanmoins de conserver vous-même les documents importants, par exemple sous forme d’export ou
    en original.
  </p>
  <p>
    Vous supprimez vous-même votre compte dans les paramètres (« Konto löschen », supprimer le compte), avec tous les
    véhicules, factures et justificatifs, immédiatement et définitivement ; ou vous écrivez à
    <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>, et nous nous en chargeons. Les factures que nous
    vous avons adressées sont conservées aussi longtemps que la loi l’exige. La manière dont nous traitons les
    données personnelles est décrite dans la
    <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -- Zeilenumbruch im Link ergäbe ein Leerzeichen vor dem Punkt -->
    <router-link to="/fr/datenschutz">politique de confidentialité</router-link>.
  </p>

  <h2>10. Obligations lors de l’utilisation</h2>
  <ul>
    <li>Ne téléversez que des contenus pour lesquels vous disposez des droits nécessaires, et aucun contenu illicite.</li>
    <li>N’essayez pas de contourner les mesures de sécurité ou les limites d’utilisation de l’IA.</li>
    <li>Ne transmettez pas d’accès à des tiers et n’utilisez pas les comptes d’autrui.</li>
  </ul>

  <h2>11. Disponibilité</h2>
  <p>
    Nous veillons à un fonctionnement aussi ininterrompu que possible, mais ne pouvons pas le garantir. Des travaux
    de maintenance, des perturbations chez des tiers (hébergement, e-mail, fournisseurs d’IA) ou la force majeure
    peuvent restreindre temporairement l’application. Dans la mesure du possible, nous annonçons à l’avance les
    interruptions planifiées importantes.
  </p>

  <h2>12. Responsabilité</h2>
  <p>
    Nous répondons des dommages que nous causons intentionnellement ou par négligence grave. La responsabilité pour
    négligence légère est exclue dans la mesure permise par la loi. Est notamment exclue la responsabilité pour les
    dommages consécutifs résultant de valeurs mal lues, d’échéances ou de rendez-vous manqués, ainsi que pour le gain
    manqué. Dans tous les cas, la responsabilité est limitée au montant que vous avez payé pour Wartungsheft au cours
    des douze derniers mois. La responsabilité légale impérative, par exemple pour les dommages corporels, demeure
    réservée.
  </p>

  <h2>13. Modifications des présentes CG</h2>
  <p>
    Nous communiquons les modifications par e-mail au moins 30 jours avant leur entrée en vigueur. Si vous n’êtes pas
    d’accord, vous pouvez résilier l’abonnement pour la date d’entrée en vigueur ; nous remboursons alors au prorata
    les montants déjà payés pour la durée restante. Si vous continuez à utiliser Wartungsheft par la suite, les
    nouvelles CG s’appliquent.
  </p>

  <h2>14. Droit applicable et for</h2>
  <p>
    Le droit suisse est applicable, à l’exclusion de la Convention de Vienne (CVIM). Le for est au siège du
    prestataire à Steinach SG. Pour les consommatrices et les consommateurs, les fors impératifs du Code de procédure
    civile s’appliquent.
  </p>
</template>
