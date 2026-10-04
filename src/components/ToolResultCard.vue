<script setup lang="ts">
import type { ToolResult } from '../services/chat'
import Panel from 'primevue/panel'
import { computed } from 'vue'
import { useSprache } from '../composables/useSprache'
import { formatCurrency, formatDate, formatNumber, normalizeCurrency } from '../lib/locale'
import { categoryLabel, planLabel } from '../services/report'
import chatTexte from '../texte/app/chat'

const props = defineProps<{ result: ToolResult }>()
const { t } = useSprache(chatTexte)

type MetaLabel = 'fahrzeug' | 'rechnung' | 'wartung' | 'wartungsplan' | 'geloescht'
const TOOL_META: Record<string, { icon: string, label: MetaLabel }> = {
  add_vehicle: { icon: 'pi pi-car', label: 'fahrzeug' },
  add_invoice: { icon: 'pi pi-receipt', label: 'rechnung' },
  add_maintenance: { icon: 'pi pi-wrench', label: 'wartung' },
  set_maintenance_schedule: { icon: 'pi pi-calendar', label: 'wartungsplan' },
  delete_vehicle: { icon: 'pi pi-trash', label: 'geloescht' },
  delete_invoice: { icon: 'pi pi-trash', label: 'geloescht' },
}

// Keys to skip (internal IDs, arrays handled separately, redundant)
const SKIP_KEYS = new Set(['items', 'schedule', 'vehicleId', 'invoiceId', 'id', 'currency'])

const meta = computed(() => {
  const m = TOOL_META[props.result.tool]
  return m ? { icon: m.icon, label: t.value.karte[m.label] } : { icon: 'pi pi-check', label: t.value.karte.ergebnis }
})

function currencyOf(d: Record<string, any>): string {
  return normalizeCurrency(d.currency)
}

function summary(): string {
  const d = props.result.data
  if (d.make)
    return `${d.make} ${d.model ?? ''} ${d.year ? `(${d.year})` : ''}`.trim()
  if (d.workshopName)
    return `${d.workshopName} — ${formatCurrency(d.totalAmount, currencyOf(d))}`
  if (d.schedule?.length)
    return t.value.karte.intervalle(d.schedule.length)
  if (d.type && d.description)
    return planLabel(d.description)
  if (d.message)
    return d.message.length > 50 ? `${d.message.slice(0, 50)}…` : d.message
  return meta.value.label
}

function fields(): { label: string, value: string }[] {
  const d = props.result.data
  const f: { label: string, value: string }[] = []
  for (const [key, val] of Object.entries(d)) {
    if (SKIP_KEYS.has(key) || val == null || val === '')
      continue
    if (typeof val === 'object')
      continue
    const label = (t.value.karte.felder as Record<string, string>)[key] || key
    let value = String(val)
    if ((key === 'mileage' || key === 'mileageAtService') && !Number.isNaN(Number(val)))
      value = `${formatNumber(Number(val))} km`
    if (key === 'totalAmount' || key === 'amount')
      value = formatCurrency(Number(val), currencyOf(d))
    if (key === 'date' || key === 'doneAt')
      value = formatDate(String(val))
    if (key === 'type' || key === 'category')
      value = categoryLabel(String(val))
    f.push({ label, value })
  }
  return f
}

function tableItems(): { description: string, amount: string }[] {
  const d = props.result.data
  if (!d.items?.length)
    return []
  return d.items.map((i: any) => ({
    description: i.description || Object.values(i).find(v => typeof v === 'string') || '',
    amount: i.amount ? formatCurrency(i.amount, currencyOf(d)) : '',
  }))
}

function scheduleRows(): { label: string, interval: string }[] {
  const d = props.result.data
  if (!d.schedule?.length)
    return []
  return d.schedule.map((s: any) => ({
    label: planLabel(s.label || s.type || s.description) || t.value.karte.intervall,
    interval: s.interval || s.value || '',
  }))
}
</script>

<template>
  <Panel toggleable collapsed class="tool-result-card">
    <template #header>
      <div class="tool-card-header">
        <i :class="meta.icon" />
        <span class="tool-card-summary">{{ summary() }}</span>
      </div>
    </template>
    <div class="tool-card-body">
      <div v-if="fields().length" class="tool-card-fields">
        <div v-for="field in fields()" :key="field.label" class="tool-card-field">
          <span class="tool-card-label">{{ field.label }}</span>
          <span class="tool-card-value">{{ field.value }}</span>
        </div>
      </div>

      <table v-if="tableItems().length" class="tool-card-table">
        <thead>
          <tr>
            <th>{{ t.karte.position }}</th>
            <th>{{ t.karte.betrag }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in tableItems()" :key="i">
            <td>{{ item.description }}</td>
            <td class="amount">
              {{ item.amount }}
            </td>
          </tr>
        </tbody>
      </table>

      <table v-if="scheduleRows().length" class="tool-card-table">
        <thead>
          <tr>
            <th>{{ t.karte.wartung }}</th>
            <th>{{ t.karte.intervall }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in scheduleRows()" :key="i">
            <td>{{ s.label }}</td>
            <td>{{ s.interval }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Panel>
</template>

<style scoped>
.tool-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.tool-card-summary {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tool-card-fields {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tool-card-field {
  display: flex;
  justify-content: space-between;
  padding: 0.2rem 0;
  font-size: 0.85rem;
}

.tool-card-label {
  color: var(--p-text-muted-color);
}

.tool-card-value {
  font-weight: 500;
  text-align: right;
}

.tool-card-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.tool-card-table th {
  text-align: left;
  font-weight: 600;
  padding: 0.3rem 0.4rem;
  border-bottom: 1px solid color-mix(in srgb, var(--p-text-color) 20%, transparent);
  color: var(--p-text-muted-color);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.tool-card-table td {
  padding: 0.25rem 0.4rem;
  border-bottom: 1px solid color-mix(in srgb, var(--p-text-color) 8%, transparent);
}

.tool-card-table .amount {
  text-align: right;
  white-space: nowrap;
  font-weight: 500;
}
</style>
