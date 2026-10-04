<script setup lang="ts">
import type { MaintenanceFormData } from '../types/forms'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { useFormValidation } from '../composables/useFormValidation'
import { useSprache } from '../composables/useSprache'
import { zahlenLocale } from '../lib/locale'
import { MAINTENANCE_CATEGORIES } from '../services/ai'
import { categoryLabel, planLabel } from '../services/report'
import allgemein from '../texte/app/allgemein'
import texte from '../texte/app/wartungsformular'
import DictateButton from './DictateButton.vue'

interface Props {
  initialData?: Partial<MaintenanceFormData>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: MaintenanceFormData]
  cancel: []
}>()

const { t } = useSprache(texte)
const { t: a } = useSprache(allgemein)

// Form schema; Meldungen sind Schlüssel in texte.validierung, übersetzt erst bei der Anzeige
type Validierung = keyof typeof texte.de.validierung
const maintenanceSchema = z.object({
  category: z.enum(MAINTENANCE_CATEGORIES, { message: 'kategoriePflicht' satisfies Validierung }),
  date: z.string().min(1, 'datumPflicht' satisfies Validierung),
  mileage: z.number().positive('kmPositiv' satisfies Validierung).optional(),
  description: z.string().optional(),
  status: z.enum(['done', 'planned']).optional(),
})

const { errors, validate } = useFormValidation(maintenanceSchema)

function meldung(schluessel: string | undefined): string {
  return t.value.validierung[schluessel as Validierung] ?? schluessel ?? ''
}

// Form data
const formData = ref<MaintenanceFormData>({
  category: props.initialData?.category || '' as any,
  date: props.initialData?.date || '',
  mileage: props.initialData?.mileage,
  // Vorbelegung aus dem Wartungsplan («Ölwechsel») in der App-Sprache; eigene Texte bleiben
  description: planLabel(props.initialData?.description),
  status: props.initialData?.status || 'done',
})

// Kategorien mit Anzeigenamen (Ölwechsel, MFK / Prüfung …)
const categoryOptions = computed(() => MAINTENANCE_CATEGORIES.map(cat => ({
  label: categoryLabel(cat),
  value: cat,
})))

// Status options
const statusOptions = computed(() => [
  { label: t.value.erledigt, value: 'done' },
  { label: t.value.geplant, value: 'planned' },
])

function handleSubmit() {
  if (validate(formData.value)) {
    emit('submit', formData.value)
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <form class="maintenance-form" @submit.prevent="handleSubmit">
    <div class="form-grid">
      <FloatLabel>
        <Select
          id="maintenance-category"
          v-model="formData.category"
          name="category"
          :options="categoryOptions"
          option-label="label"
          option-value="value"
          :invalid="!!errors.category"
          fluid
        />
        <label for="maintenance-category">{{ t.kategorie }}</label>
      </FloatLabel>
      <small v-if="errors.category" class="error">{{ meldung(errors.category) }}</small>

      <!-- Datumsfelder zeigen immer «TT.MM.JJJJ», ein schwebendes Label läge darüber -->
      <div class="field">
        <label for="maintenance-date">{{ formData.status === 'planned' ? t.termin : t.datum }}</label>
        <InputText
          id="maintenance-date"
          v-model="formData.date"
          name="date"
          type="date"
          :invalid="!!errors.date"
          fluid
        />
      </div>
      <small v-if="errors.date" class="error">{{ meldung(errors.date) }}</small>

      <FloatLabel>
        <InputNumber
          id="maintenance-mileage"
          v-model="formData.mileage"
          name="mileage"
          :use-grouping="true"
          :locale="zahlenLocale()"
          suffix=" km"
          :invalid="!!errors.mileage"
          fluid
        />
        <label for="maintenance-mileage">{{ t.kilometerstand }}</label>
      </FloatLabel>
      <small v-if="errors.mileage" class="error">{{ meldung(errors.mileage) }}</small>

      <FloatLabel>
        <Select
          id="maintenance-status"
          v-model="formData.status"
          name="status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          fluid
        />
        <label for="maintenance-status">{{ t.status }}</label>
      </FloatLabel>

      <FloatLabel>
        <Textarea
          id="maintenance-description"
          v-model="formData.description"
          name="description"
          rows="3"
          fluid
        />
        <label for="maintenance-description">{{ t.beschreibung }}</label>
      </FloatLabel>
      <!-- Ganze Sätze diktieren geht gut, einzelne Fachwörter schlecht (stt-vergleich.md) -->
      <DictateButton :label="t.diktieren" @text="text => formData.description = [formData.description, text].filter(Boolean).join(' ')" />
    </div>

    <div class="form-actions">
      <Button type="button" :label="a.abbrechen" severity="secondary" @click="handleCancel" />
      <Button type="submit" :label="a.speichern" />
    </div>
  </form>
</template>

<style scoped>
.maintenance-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field > label {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.error {
  color: var(--status-error);
  display: block;
  margin-top: calc(var(--spacing-xs) * -1);
}
</style>
