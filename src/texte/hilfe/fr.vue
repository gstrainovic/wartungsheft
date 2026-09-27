<script setup lang="ts">
import type { Frage } from '../hilfe'

defineProps<{ fragen: Frage[] }>()

const CONTACT_EMAIL = 'info@wartungsheft.ch'
</script>

<template>
  <h1>Aide : comment tenir votre carnet d'entretien</h1>
  <p class="legal-meta">
    Neuf procédures, chacune en quelques phrases. Si vous êtes bloqué quelque part, écrivez à
    <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a> ou enregistrez un message vocal dans l'application
    sous « Fehler melden oder Wunsch » (signaler une erreur ou un souhait).
    L'application elle-même n'est pour l'instant disponible qu'en allemand ; c'est pourquoi les noms des boutons
    sont indiqués en allemand, avec leur traduction entre parenthèses.
  </p>

  <h2>1. Saisir un véhicule</h2>
  <p>
    « Fahrzeug hinzufügen » (ajouter un véhicule) dans le tableau de bord ou dans la liste des véhicules. Vous pouvez
    photographier le permis de circulation : l'application remplit alors elle-même les plaques de contrôle, la
    marque, le type, le numéro de châssis et la première mise en circulation. Les champs vides restent vides :
    une année de construction et un kilométrage de 0 signifient « inconnu », pas « zéro ». Après l'enregistrement,
    vous arrivez sur la page du véhicule, où une liste de contrôle propose les étapes suivantes. Chacune peut être
    sautée.
  </p>

  <h2>2. Saisir une facture et ajouter d'anciennes factures</h2>
  <p>
    « Rechnung hinzufügen » (ajouter une facture) sur la page du véhicule, puis une photo de la facture du garage.
    L'application en extrait le garage, la date, le montant et les différentes positions et crée directement un
    entretien pour chaque catégorie. Plusieurs photos ou un PDF groupé fonctionnent aussi : il en résulte une liste
    de contrôle dans laquelle vous confirmez chaque facture séparément. Si l'application reconnaît une facture en
    double, elle le signale au lieu de l'enregistrer deux fois. Vous pouvez aussi tout saisir à la main ou le dicter.
  </p>

  <h2>3. Saisir un entretien sans facture</h2>
  <p>
    Tous les travaux n'ont pas de justificatif : vidange faite soi-même, pneus montés chez un ami. Dans l'onglet
    « Verlauf » (historique), vous le saisissez via « Wartung hinzufügen » (ajouter un entretien) : type, date,
    kilométrage, description. Pour le plan d'entretien, cette saisie compte exactement comme une saisie issue d'une
    facture.
  </p>

  <h2>4. Enregistrer le carnet d'entretien et les intervalles</h2>
  <p>
    Sans indications propres, l'application calcule avec des intervalles généraux. C'est plus précis avec le
    carnet d'entretien imprimé : « Serviceheft fotografieren » (photographier le carnet d'entretien) lit les
    intervalles du constructeur et les tampons des services précédents et vous les propose. Les tampons déjà
    saisis sont reconnus par l'application et ne sont pas enregistrés en double. Les intervalles peuvent ensuite
    être ajustés un par un à la main.
  </p>

  <h2>5. Exporter les coûts</h2>
  <p>
    Onglet « Kosten » (coûts) sur la page du véhicule : coûts par année et par catégorie, en CSV pour Excel ou en
    dossier PDF avec les données de base, les entretiens et les factures. Pour tous les véhicules ensemble, le même
    tableau figure dans le tableau de bord. L'application convertit les factures en euros dans votre monnaie de
    référence au cours de la date de facture ; sans cours, le montant reste dans sa monnaie et est marqué
    « nicht umgerechnet » (non converti).
  </p>

  <h2>6. Recevoir un rappel et cocher un travail</h2>
  <p>
    Lorsqu'un travail arrive à échéance (30 jours ou 1'000 kilomètres avant), Wartungsheft envoie un e-mail avec
    tout ce qui est à faire. Le lien qu'il contient mène directement au véhicule. Une fois le travail effectué,
    vous le saisissez avec « Erledigt eintragen » (marquer comme effectué) dans la liste des échéances ; la date et
    le kilométrage sont préremplis. Si vous avez déjà un rendez-vous, mettez le statut sur « Geplant » (planifié) :
    l'application ne vous le rappelle alors plus. Les rappels peuvent être désactivés dans les paramètres.
  </p>

  <h2>7. Vendre ou céder un véhicule</h2>
  <p>
    Avant la vente : générer le carnet d'entretien en PDF, avec ou sans prix. Ensuite, sur la page du véhicule,
    « Verkauft oder abgegeben » (vendu ou cédé) avec la date et le kilométrage. Le véhicule disparaît du tableau de
    bord et des rappels, mais reste dans les coûts et les exports. Vous n'avez rien à supprimer, et l'opération
    peut aussi être annulée.
  </p>

  <h2>8. Tenir le kilométrage à jour</h2>
  <p>
    Chaque facture avec un kilométrage plus élevé met automatiquement à jour celui du véhicule. Entre-temps, vous
    pouvez l'actualiser directement dans le tableau de bord. Cela en vaut la peine, car l'échéance se calcule
    d'après la date et d'après les kilomètres.
  </p>

  <h2>9. Parc de véhicules : voir ce qui arrive à échéance</h2>
  <p>
    Le tableau de bord montre, pour tous les véhicules, ce qui est échu ou en retard, le plus urgent en premier.
    Un clic mène au véhicule. Le tableau du parc de véhicules en dessous indique les coûts par véhicule et par
    année et peut être téléchargé en CSV ou en PDF. Pour les entreprises, les fonctions sont les mêmes que pour
    les particuliers, seul le tarif diffère.
  </p>

  <h2>Questions fréquentes</h2>
  <template v-for="f in fragen" :key="f.frage">
    <h3>{{ f.frage }}</h3>
    <p>{{ f.antwort }}</p>
  </template>

  <h2>Encore une question ?</h2>
  <p>
    Écrivez à <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>. Dans l'application, c'est aussi
    possible sans taper : « Fehler melden oder Wunsch » (signaler une erreur ou un souhait) dans le menu enregistre
    un message vocal.
    Les aspects juridiques figurent dans les <router-link to="/fr/agb">
      Conditions générales (CG)
    </router-link> et dans la
    <router-link to="/fr/datenschutz">
      Politique de confidentialité
    </router-link>.
  </p>
</template>
