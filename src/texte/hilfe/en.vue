<script setup lang="ts">
import type { Frage } from '../hilfe'

defineProps<{ fragen: Frage[] }>()

const CONTACT_EMAIL = 'info@wartungsheft.ch'
</script>

<template>
  <h1>Help: how to keep your service book</h1>
  <p class="legal-meta">
    Nine procedures, each in a few sentences. If you get stuck anywhere, write to
    <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a> or record a voice message in the app under
    «Report a problem or a wish». The app speaks English: the language is chosen in the settings.
  </p>

  <h2>1. Add a vehicle</h2>
  <p>
    «Add vehicle» in the dashboard or in the vehicle list. You can photograph the vehicle
    registration document, and the app fills in the number plate, make, model, chassis number (VIN) and first
    registration by itself. Empty fields stay empty: a year of manufacture and mileage of 0 mean «unknown», not
    «zero». After saving you land on the vehicle page, where a checklist suggests the next steps. Each of them can
    be skipped.
  </p>

  <h2>2. Add an invoice and catch up on old invoices</h2>
  <p>
    «Add invoice» on the vehicle page, then a photo of the garage invoice. The app reads out
    the garage, date, amount and the individual line items and creates a maintenance entry for each category right
    away. Several photos or a combined PDF work too: they become a checklist in which you confirm each invoice
    individually. If the app recognises an invoice as a duplicate, it says so instead of saving it twice. You can
    also type everything in by hand or dictate it.
  </p>

  <h2>3. Record maintenance without an invoice</h2>
  <p>
    Not every job has a receipt: oil changed yourself, tyres fitted at a friend's. In the «History» tab
    you enter it via «Add maintenance»: type, date, mileage, description. For the maintenance
    plan this entry counts just the same as one from an invoice.
  </p>

  <h2>4. Store the service book and intervals</h2>
  <p>
    Without your own details, the app works with general intervals. It becomes more accurate with the printed
    service book: «Photograph the service book» reads the manufacturer's intervals and the
    stamps of earlier services and suggests them to you. The app recognises stamps that have already been entered
    and does not add them twice. Individual intervals can then be adjusted by hand.
  </p>

  <h2>5. Export costs</h2>
  <p>
    «Costs» tab on the vehicle page: costs per year and category, as CSV for Excel or as a PDF dossier
    with master data, maintenance and invoices. For all vehicles together, the same table is in the dashboard. The
    app converts invoices in euros into your home currency at the rate of the invoice date; without a rate the
    amount stays in its currency and is shown separately.
  </p>

  <h2>6. Get reminders and tick off work</h2>
  <p>
    When a job becomes due (30 days or 1'000 kilometres beforehand), Wartungsheft sends an email with everything
    that is coming up. The link in it takes you straight to the vehicle. Once the job is done, you record it with
    «Mark as done» in the list of due items; date and mileage are pre-filled. If you already
    have an appointment, set the status to «Planned» and the app stops reminding you. Reminders can be
    switched off in the settings.
  </p>

  <h2>7. Sell or hand over a vehicle</h2>
  <p>
    Before selling: create the service book as a PDF, with or without prices. Then, on the vehicle page, «Sold or
    handed over» with date and mileage. The vehicle disappears from the dashboard and
    reminders but stays in costs and exports. You don't have to delete anything, and it can be undone as well.
  </p>

  <h2>8. Keep the mileage up to date</h2>
  <p>
    Every invoice with a higher mileage raises the vehicle's mileage automatically. In between, you can update it
    directly in the dashboard. It is worth it, because what is due is calculated by date and by kilometres.
  </p>

  <h2>9. Fleet: see what is due</h2>
  <p>
    The dashboard shows what is due or overdue across all vehicles, the most urgent first. One click takes you to
    the vehicle. The fleet table below lists the costs per vehicle and year and can be downloaded as CSV or PDF.
    Businesses get the same features as private owners, only the price list is different.
  </p>

  <h2>Frequently asked questions</h2>
  <template v-for="f in fragen" :key="f.frage">
    <h3>{{ f.frage }}</h3>
    <p>{{ f.antwort }}</p>
  </template>

  <h2>Still have questions?</h2>
  <p>
    Write to <a :href="`mailto:${CONTACT_EMAIL}`">{{ CONTACT_EMAIL }}</a>. In the app it also works without typing:
    «Report a problem or a wish» in the menu records a voice message.
    Legal matters are covered in the <router-link to="/en/agb">
      Terms and conditions
    </router-link> and in the
    <router-link to="/en/datenschutz">
      Privacy policy
    </router-link>.
  </p>
</template>
