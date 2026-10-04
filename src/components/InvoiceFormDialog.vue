<script setup lang="ts">
import type { BatchEntry, BatchVehicle } from '../services/invoice-scan'
import type { InvoiceFormData } from '../types/forms'
import Dialog from 'primevue/dialog'
import { computed } from 'vue'
import { useSprache } from '../composables/useSprache'
import texte from '../texte/app/rechnungsformular'
import InvoiceForm from './InvoiceForm.vue'

interface Props {
  visible: boolean
  initialData?: Partial<InvoiceFormData>
  existingInvoices?: { vehicleId?: string, date: string, totalAmount?: number }[]
  vehicles?: BatchVehicle[]
  vehicleId?: string
  /** ohne Angabe «Neue Rechnung» in der App-Sprache */
  title?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [data: InvoiceFormData]
  'submitBatch': [entries: BatchEntry[]]
}>()
const { t } = useSprache(texte)
const header = computed(() => props.title ?? t.value.neueRechnung)

function handleSubmitBatch(entries: BatchEntry[]) {
  emit('submitBatch', entries)
  emit('update:visible', false)
}

const isVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

function handleSubmit(data: InvoiceFormData) {
  emit('submit', data)
  emit('update:visible', false)
}

function handleCancel() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    v-model:visible="isVisible"
    :header="header"
    :modal="true"
    :closable="true"
    :draggable="false"
    :style="{ width: '90vw', maxWidth: '500px' }"
  >
    <InvoiceForm
      :initial-data="initialData"
      :existing-invoices="existingInvoices"
      :vehicles="vehicles"
      :vehicle-id="vehicleId"
      @submit="handleSubmit"
      @submit-batch="handleSubmitBatch"
      @cancel="handleCancel"
    />
  </Dialog>
</template>
