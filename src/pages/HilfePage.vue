<script setup lang="ts">
/**
 * Hilfe in Textform: ein Abschnitt je Kernablauf (CLAUDE.md «Abläufe prüfen, nicht nur Seiten»), dazu die
 * häufigen Fragen und oben das Tutorial «So startest du» als Video (TutorialVideo, Ziel des Verweises aus der
 * Checkliste «Einrichten»). Die Seite dient dreifach — Antwort im Postfach statt Erklärung von Hand,
 * Text für Suchmaschinen und KI-Antworten (FAQPage weiter unten), und Prüfliste für uns.
 *
 * Wer einen Ablauf ändert, ändert hier mit. Steht ein Schritt nur hier und nicht in der App, ist das ein
 * Hinweis auf eine Lücke in der Oberfläche, nicht auf eine fehlende Anleitung.
 */
import type { Frage } from '../texte/hilfe'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import LandingFooter from '../components/LandingFooter.vue'
import LandingHeader from '../components/LandingHeader.vue'
import TutorialVideo from '../components/TutorialVideo.vue'
import { useSprache } from '../composables/useSprache'
import hilfeFragen from '../texte/hilfe'
import HilfeEn from '../texte/hilfe/en.vue'
import HilfeFr from '../texte/hilfe/fr.vue'
import HilfeIt from '../texte/hilfe/it.vue'

const CONTACT_EMAIL = 'info@wartungsheft.ch'

/** Die Antworten stehen doppelt: sichtbar auf der Seite und als FAQPage für Suchmaschinen und KI-Antworten (src/texte/hilfe.ts) */
const { sprache, t: fragen } = useSprache(hilfeFragen)
const FRAGEN = computed(() => fragen.value)
// Deutsch steht unten im Template, die Übersetzungen als eigene Komponenten
const UEBERSETZUNG = { fr: HilfeFr, it: HilfeIt, en: HilfeEn }

function faqSchema(liste: Frage[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': liste.map(f => ({
      '@type': 'Question',
      'name': f.frage,
      'acceptedAnswer': { '@type': 'Answer', 'text': f.antwort },
    })),
  }
}

// Das Schema gehört in den Kopf des Dokuments; eine einzelne Seite trägt es nur, solange sie offen ist
let script: HTMLScriptElement | null = null
onMounted(() => {
  script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(faqSchema(FRAGEN.value))
  document.head.appendChild(script)
})
onBeforeUnmount(() => {
  script?.remove()
  script = null
})
</script>

<template>
  <div class="legal-page">
    <LandingHeader />

    <main v-if="sprache !== 'de'" class="legal-container legal-content">
      <component :is="UEBERSETZUNG[sprache]" :fragen="FRAGEN" />
    </main>

    <main v-else class="legal-container legal-content">
      <h1>Hilfe: so führst du dein Serviceheft</h1>
      <p class="legal-meta">
        Neun Abläufe, jeder in ein paar Sätzen. Kommst du irgendwo nicht weiter, schreib an
        <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a> oder nimm in der App unter «Fehler melden
        oder Wunsch» eine Sprachnachricht auf.
      </p>

      <TutorialVideo />

      <h2>1. Fahrzeug erfassen</h2>
      <p>
        «Fahrzeug hinzufügen» im Dashboard oder in der Fahrzeugliste. Du kannst den Fahrzeugausweis
        fotografieren, dann füllt die App Kontrollschild, Marke, Typ, Fahrgestellnummer und die erste
        Inverkehrsetzung selbst aus. Leere Felder bleiben leer: Baujahr und Kilometerstand 0 heissen
        «unbekannt», nicht «null». Nach dem Speichern stehst du auf der Fahrzeugseite, wo eine Checkliste die
        nächsten Schritte vorschlägt. Jeder davon ist überspringbar.
      </p>

      <h2>2. Rechnung erfassen und alte Belege nachtragen</h2>
      <p>
        «Rechnung hinzufügen» auf der Fahrzeugseite, dann ein Foto der Werkstattrechnung. Die App liest
        Werkstatt, Datum, Betrag und die einzelnen Positionen heraus und legt zu jeder Kategorie gleich eine
        Wartung an. Mehrere Fotos oder ein Sammel-PDF gehen auch: daraus wird eine Prüfliste, in der du jede
        Rechnung einzeln bestätigst. Erkennt die App eine Rechnung doppelt, meldet sie das, statt sie zweimal
        zu speichern. Du kannst alles auch von Hand eintippen oder ansagen.
      </p>

      <h2>3. Wartung ohne Rechnung eintragen</h2>
      <p>
        Nicht jede Arbeit hat einen Beleg — Öl selbst gewechselt, Reifen beim Kollegen montiert. Im Tab
        «Verlauf» trägst du das über «Wartung hinzufügen» ein: Art, Datum, Kilometerstand, Beschreibung. Für
        den Wartungsplan zählt dieser Eintrag genauso wie einer aus einer Rechnung.
      </p>

      <h2>4. Serviceheft und Intervalle hinterlegen</h2>
      <p>
        Ohne eigene Angaben rechnet die App mit allgemeinen Intervallen. Genauer wird es mit dem gedruckten
        Serviceheft: «Serviceheft fotografieren» liest die Intervalle des Herstellers und die Stempel früherer
        Services aus und schlägt sie dir vor. Stempel, die schon erfasst sind, erkennt die App und trägt sie
        nicht doppelt ein. Einzelne Intervalle lassen sich danach von Hand anpassen.
      </p>

      <h2>5. Kosten exportieren</h2>
      <p>
        Tab «Kosten» auf der Fahrzeugseite: Kosten pro Jahr und Kategorie, als CSV für Excel oder als
        PDF-Dossier mit Stammdaten, Wartungen und Rechnungen. Für alle Fahrzeuge zusammen steht dieselbe
        Tabelle im Dashboard. Rechnungen in Euro rechnet die App zum Kurs des Rechnungsdatums in deine
        Heimwährung um; ohne Kurs bleibt der Betrag in seiner Währung und ist als «nicht umgerechnet»
        gekennzeichnet.
      </p>

      <h2>6. Erinnerung bekommen und Arbeit abhaken</h2>
      <p>
        Wird eine Arbeit fällig — 30 Tage oder 1'000 Kilometer vorher —, schickt Wartungsheft eine E-Mail mit
        allem, was ansteht. Der Link darin führt direkt zum Fahrzeug. Ist die Arbeit erledigt, trägst du sie
        mit «Erledigt eintragen» in der Fälligkeitsliste ein; Datum und Kilometerstand sind vorbelegt. Hast du
        schon einen Termin, setz den Status auf «Geplant» — dann erinnert die App nicht weiter. Abschalten
        lassen sich die Erinnerungen in den Einstellungen.
      </p>

      <h2>7. Fahrzeug verkaufen oder abgeben</h2>
      <p>
        Vor dem Verkauf: Serviceheft als PDF erzeugen, mit oder ohne Preise. Danach auf der Fahrzeugseite
        «Verkauft oder abgegeben» mit Datum und Kilometerstand. Das Fahrzeug verschwindet aus Dashboard und
        Erinnerungen, bleibt aber in Kosten und Exporten erhalten — löschen musst du nichts, und rückgängig
        machen lässt es sich auch.
      </p>

      <h2>8. Kilometerstand aktuell halten</h2>
      <p>
        Jede Rechnung mit höherem Kilometerstand hebt den Stand des Fahrzeugs automatisch an. Zwischendurch
        kannst du ihn im Dashboard direkt nachführen. Das lohnt sich, weil die Fälligkeit nach Datum und nach
        Kilometern rechnet.
      </p>

      <h2>9. Fuhrpark: sehen, was fällig ist</h2>
      <p>
        Das Dashboard zeigt über alle Fahrzeuge hinweg, was fällig oder überfällig ist, das Dringendste zuerst.
        Ein Klick führt zum Fahrzeug. Die Fuhrpark-Tabelle darunter nennt die Kosten pro Fahrzeug und Jahr und
        lässt sich als CSV oder PDF herunterladen. Für Betriebe gilt derselbe Funktionsumfang wie privat, nur
        die Preisliste ist eine andere.
      </p>

      <h2>Häufige Fragen</h2>
      <template v-for="f in FRAGEN" :key="f.frage">
        <h3>{{ f.frage }}</h3>
        <p>{{ f.antwort }}</p>
      </template>

      <h2>Noch offen?</h2>
      <p>
        Schreib an <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>. In der App geht es auch ohne
        Tippen: «Fehler melden oder Wunsch» im Menü nimmt eine Sprachnachricht auf.
        Rechtliches steht in den <router-link to="/agb">
          AGB
        </router-link> und in der
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -- Zeilenumbruch im Link ergäbe ein Leerzeichen vor dem Punkt -->
        <router-link to="/datenschutz">Datenschutzerklärung</router-link>.
      </p>
    </main>

    <LandingFooter />
  </div>
</template>

<style scoped>
.legal-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--p-surface-ground);
}

.legal-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.legal-content {
  flex: 1;
  padding-top: 2rem;
  padding-bottom: 3rem;
}

/* :deep, damit die Regeln auch in den Übersetzungen (src/texte/hilfe/*.vue) greifen */
.legal-content :deep(h1) {
  font-size: clamp(1.5rem, 6vw, 2rem);
  font-weight: 700;
  margin: 0 0 0.5rem;
  hyphens: auto;
  overflow-wrap: break-word;
}

.legal-content :deep(.legal-meta) {
  margin-bottom: 2rem !important;
}

.legal-content :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-border);
}

.legal-content :deep(h3) {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 1.5rem 0 0.5rem;
}

.legal-content :deep(p) {
  color: var(--p-text-muted-color);
  line-height: 1.7;
  margin: 0 0 1rem;
}

.legal-content :deep(a) {
  color: var(--p-primary-color);
}
</style>
