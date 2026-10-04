<script setup lang="ts">
import type { MaintenanceFormData } from '../types/forms'
import Dialog from 'primevue/dialog'
import { computed } from 'vue'
import { useSprache } from '../composables/useSprache'
import texte from '../texte/app/wartungsformular'
import MaintenanceForm from './MaintenanceForm.vue'

interface Props {
  visible: boolean
  initialData?: Partial<MaintenanceFormData>
  /** ohne Angabe «Neue Wartung» in der App-Sprache */
  title?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'submit': [data: MaintenanceFormData]
}>()
const { t } = useSprache(texte)
const header = computed(() => props.title ?? t.value.neueWartung)

const isVisible = computed({
  get: () => props.visible,
  set: value => emit('update:visible', value),
})

function handleSubmit(data: MaintenanceFormData) {
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
    <MaintenanceForm
      :initial-data="initialData"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
  </Dialog>
</template>
