<script setup lang="ts">
import Button from 'primevue/button'
import LandingFooter from '../components/LandingFooter.vue'
import LandingHeader from '../components/LandingHeader.vue'

// Hypothese H3: Wartungsplan für Liegenschaften und Anlagen (Validierung in ~/projects/wartungsplan).
// Noch kein Produkt: die Seite sammelt Vorbestellungen per Mail, Zahlung erst bei Lieferung.
const benefits = [
  { icon: 'pi-calendar', title: 'Jede Frist im Blick', text: 'Heizung, Lift, Lüftung, Brandmelder, Maschinen: Wartungsintervalle und gesetzliche Prüffristen pro Objekt, eine E-Mail erinnert rechtzeitig.' },
  { icon: 'pi-camera', title: 'Rechnung oder Prüfbericht fotografieren', text: 'Firma, Datum und Betrag werden ausgelesen und dem Objekt zugeordnet. Die Historie füllt sich von selbst.' },
  { icon: 'pi-file-pdf', title: 'Protokoll auf Knopfdruck', text: 'Wartungshistorie und Prüfprotokoll als PDF für Eigentümer, Verwaltung und Versicherung.' },
]

const CONTACT_EMAIL = 'info@wartungsheft.ch'
const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Vorbestellung Wartungsplan für Anlagen')}&body=${encodeURIComponent('Betrieb: \nAnzahl Objekte: \nHeutiges Werkzeug (Excel, Papier, Software): \n')}`

function vorbestellen() {
  window.location.href = mailto
}
</script>

<template>
  <div class="anlagen">
    <LandingHeader />

    <main class="anlagen-container anlagen-main">
      <section class="anlagen-hero">
        <h1>Wartungsplan für Liegenschaften und Anlagen</h1>
        <p class="anlagen-problem">
          Wer Gebäude oder Anlagen unterhält, verliert Fristen in Excel-Listen und Belege in Ordnern. Wartungsheft
          erinnert an jede Wartung und Prüfung, das Foto der Rechnung wird zum Eintrag, das Protokoll zum PDF.
        </p>
      </section>

      <section class="anlagen-benefits">
        <div v-for="b in benefits" :key="b.title" class="anlagen-benefit">
          <i :class="`pi ${b.icon}`" />
          <h2>{{ b.title }}</h2>
          <p>{{ b.text }}</p>
        </div>
      </section>

      <section class="anlagen-fuer">
        <h2>Für wen</h2>
        <p>
          Hauswartungen und Facility-Betriebe, Liegenschaftsverwaltungen mit wenigen Mitarbeitenden, Werkstätten,
          Gärtnereien, Gemeinden, Vereine und Kirchgemeinden mit eigenen Gebäuden. Nicht für Industrieanlagen mit
          Ticketsystem, dafür gibt es andere.
        </p>
      </section>

      <section class="anlagen-price">
        <strong>36 CHF pro Objekt und Jahr</strong>
        <span>Ab 20 Objekten günstiger, keine Benutzergebühren, Jahresrechnung mit QR-Zahlteil auf die Firma. 30 Tage gratis, wie beim Serviceheft für Fahrzeuge.</span>
        <p class="anlagen-vorbestellung">
          Gebaut wird, sobald 10 Betriebe vorbestellt haben. Du zahlst erst bei Lieferung; Liefertermin ist vier
          Wochen nach der zehnten Vorbestellung. Schreib uns, wie viele Objekte du betreust und womit du heute
          arbeitest.
        </p>
        <div class="anlagen-actions">
          <Button label="Vorbestellen per E-Mail" size="large" icon="pi pi-envelope" icon-pos="right" @click="vorbestellen" />
        </div>
        <p class="anlagen-contact">
          Fragen vorab? Schreib an <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>, wir antworten am gleichen Tag.
        </p>
      </section>
    </main>

    <LandingFooter />
  </div>
</template>

<style scoped>
.anlagen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.anlagen-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1.5rem;
  box-sizing: border-box;
}

.anlagen-main {
  flex: 1;
  padding-top: 3rem;
  padding-bottom: 4rem;
}

.anlagen-hero {
  text-align: center;
  margin-bottom: 3rem;
}

.anlagen-hero h1 {
  font-size: clamp(1.8rem, 4.5vw, 3rem);
  font-weight: 800;
  line-height: 1.15;
  margin: 0 0 1rem;
}

.anlagen-problem {
  font-size: 1.15rem;
  color: var(--p-text-muted-color);
  max-width: 640px;
  margin: 0 auto;
}

.anlagen-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.anlagen-benefit i {
  font-size: 1.75rem;
  color: #059669;
}

.anlagen-benefit h2 {
  font-size: 1.1rem;
  margin: 0.75rem 0 0.5rem;
}

.anlagen-benefit p,
.anlagen-fuer p {
  margin: 0;
  color: var(--p-text-muted-color);
}

.anlagen-fuer {
  margin-bottom: 3rem;
}

.anlagen-fuer h2 {
  font-size: 1.25rem;
  margin: 0 0 0.5rem;
}

.anlagen-price {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

.anlagen-price strong {
  font-size: 1.6rem;
}

.anlagen-price span,
.anlagen-vorbestellung,
.anlagen-contact {
  max-width: 640px;
  color: var(--p-text-muted-color);
  margin: 0;
}

.anlagen-actions {
  margin: 1rem 0 0.5rem;
}
</style>
