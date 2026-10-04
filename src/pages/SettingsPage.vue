<script setup lang="ts">
import type { LimitKind, Plan } from '@strainovic/ai-proxy/plans'
import { BUSINESS_VEHICLE_YEARLY_CHF, PLANS, PRIVATE_MAX_VEHICLES, PRIVATE_YEARLY_CHF } from '@strainovic/ai-proxy/plans'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import ProgressBar from 'primevue/progressbar'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import OrderDialog from '../components/OrderDialog.vue'
import { useAuth } from '../composables/useAuth'
import { useSprache } from '../composables/useSprache'
import { appSprache } from '../lib/app-sprache'
import { userMessage } from '../lib/errors'
import { db, tx } from '../lib/instantdb'
import { formatCurrency, formatDate, formatMonth, formatNumber } from '../lib/locale'
import { SPRACHEN } from '../lib/sprache'
import { deleteWholeAccount } from '../services/account-delete'
import { cancelBusinessPlan, fetchUsage, resumeBusinessPlan, startCheckout } from '../services/ai-access'
import { exportDatabase, importDatabase } from '../services/db-export'
import { activeVehicles } from '../services/vehicle-status'
import { useRemindersStore } from '../stores/reminders'
import { HOME_CURRENCIES, useSettingsStore } from '../stores/settings'
import { useVehiclesStore } from '../stores/vehicles'
import allgemein from '../texte/app/allgemein'
import texte from '../texte/app/einstellungen'

type UsageInfo = Awaited<ReturnType<typeof fetchUsage>>

const { t } = useSprache(texte)
const { t: a } = useSprache(allgemein)

// Nutzertexte für die Zähler
const LIMIT_LABELS = computed<Record<LimitKind, string>>(() => ({
  ocrPages: t.value.abo.scans,
  chatTokens: t.value.abo.chat,
}))

// Upgrade-Buttons nur mit konfiguriertem Zahlungsanbieter (VITE_BILLING_ENABLED=true beim Build). Bis dahin
// zahlen die ersten Kunden per Jahresrechnung, Kontakt statt Checkout.
const billingEnabled = import.meta.env.VITE_BILLING_ENABLED === 'true'
const CONTACT_EMAIL = 'info@wartungsheft.ch'

const settings = useSettingsStore()
const reminders = useRemindersStore()
const toast = useToast()
const router = useRouter()
const { user, signOut, forgetKnownAccount } = useAuth()

// Sprache der App: gilt sofort und bleibt im Browser; am Benutzer gespeichert für andere Geräte und die Mails.
// Offline oder ohne Verbindung scheitert nur das Speichern am Benutzer, die Wahl gilt trotzdem.
const sprachOptionen = SPRACHEN.map(s => ({ label: s.name, value: s.code }))
async function spracheWaehlen(code: (typeof SPRACHEN)[number]['code'] | null): Promise<void> {
  if (!code || code === appSprache.value)
    return
  try {
    await reminders.setSprache(code)
  }
  catch (err) {
    console.error('[settings] Sprache am Benutzer speichern', err)
    toast.add({ severity: 'warn', summary: t.value.sprache.nurGeraet, detail: userMessage(err), life: 4000 })
  }
}

// Kontolöschung (AGB): eigene Daten über den Client, Verbrauch und Login über den Proxy, dann abmelden
const confirmDeleteAccount = ref(false)
const deletingAccount = ref(false)
async function handleDeleteAccount(): Promise<void> {
  deletingAccount.value = true
  try {
    await deleteWholeAccount()
    confirmDeleteAccount.value = false
    signOut()
    forgetKnownAccount()
    // App.vue leitet beim Abmelden auf /login; erst dessen Watcher laufen lassen, dann auf die Startseite
    await nextTick()
    await router.replace('/')
    toast.add({ severity: 'success', summary: t.value.konto.geloescht, detail: t.value.konto.geloeschtDetail, life: 5000 })
  }
  catch (err) {
    toast.add({ severity: 'error', summary: t.value.konto.nichtGeloescht, detail: userMessage(err), life: 6000 })
  }
  finally {
    deletingAccount.value = false
  }
}

async function toggleEmailReminders(enabled: boolean): Promise<void> {
  try {
    await reminders.setEmailReminders(enabled)
  }
  catch (err) {
    toast.add({ severity: 'error', summary: t.value.erinnerungen.nichtGespeichert, detail: userMessage(err), life: 4000 })
  }
}
const ocrCacheCount = ref(0)
const importInput = ref<HTMLInputElement | null>(null)

// Abo & Nutzung (über den AI-Proxy)
const usage = ref<UsageInfo | null>(null)
const usageError = ref('')
const checkoutBusy = ref<string | null>(null)

// Jahresabo auf Rechnung (privat oder Betrieb): bestellen, Stand, kündigen (ai-proxy invoice-subscription.ts)
const vehiclesStore = useVehiclesStore()
const orderOpen = ref(false)
const businessBusy = ref(false)
const business = computed(() => usage.value?.billing ?? null)
const activeVehicleCount = computed(() => activeVehicles(vehiclesStore.vehicles).length)
// Bestellen, sobald der Proxy Rechnungen ausstellt: mit IBAN als QR-Rechnung, ohne von Hand (Auftrag per Mail)
const canOrderBusiness = computed(() => !!usage.value?.ordering && !business.value && usage.value.plan === 'free')

function onOrdered(result: { number: string, mailed: boolean, manual: boolean }): void {
  toast.add({
    severity: 'success',
    summary: t.value.abo.bestellt(result.number),
    detail: result.mailed && !result.manual
      ? t.value.abo.unterwegs
      : t.value.abo.kommtNoch(CONTACT_EMAIL),
    life: 6000,
  })
  refreshUsage()
}

async function changeBusinessPlan(action: 'cancel' | 'resume'): Promise<void> {
  businessBusy.value = true
  try {
    if (action === 'cancel') {
      // Vor Beginn des bezahlten Jahres storniert die Kündigung die Rechnung, die Testzeit läuft weiter
      const { voided } = await cancelBusinessPlan()
      toast.add({
        severity: 'info',
        summary: t.value.abo.gekuendigt,
        detail: voided ? t.value.abo.storniert : t.value.abo.bisEnde,
        life: 6000,
      })
    }
    else {
      await resumeBusinessPlan()
    }
    await refreshUsage()
  }
  catch (e) {
    toast.add({ severity: 'warn', summary: (e as Error).message, life: 5000 })
  }
  finally {
    businessBusy.value = false
  }
}

/** Letzter Tag der bezahlten Laufzeit (periodEnd ist exklusiv) */
function lastPaidDay(periodEnd: string): string {
  const [y, m, d] = periodEnd.split('-').map(Number)
  return formatDate(new Date(Date.UTC(y!, m! - 1, d! - 1)).toISOString().slice(0, 10))
}
const currentPlan = computed(() => PLANS[usage.value?.plan ?? 'free'])
const upgradePlans = computed(() => Object.values(PLANS).filter(p => p.priceChfPerMonth > currentPlan.value.priceChfPerMonth))
const limitKinds: LimitKind[] = ['ocrPages', 'chatTokens']

// Plan-Namen des Katalogs sind deutsch; angezeigt wird die Übersetzung nach der Plan-ID
function planName(plan: Plan): string {
  if (plan.id === 'free')
    return t.value.abo.testzeit
  if (plan.id === 'privat')
    return t.value.abo.planPrivat
  if (plan.id === 'betrieb')
    return t.value.abo.planBetrieb
  return plan.name
}

// Testzeit: 30 Tage alles, danach brauchen KI-Scan und Chat ein Abo; Lesen, Erfassen und Exporte bleiben frei
const trialNote = computed(() => {
  const trial = usage.value?.trial
  if (!trial)
    return ''
  const privat = formatCurrency(PRIVATE_YEARLY_CHF)
  const betrieb = formatCurrency(BUSINESS_VEHICLE_YEARLY_CHF)
  if (trial.active)
    return t.value.abo.testzeitLaeuft(trial.daysLeft, formatDate(trial.endsAt), privat, PRIVATE_MAX_VEHICLES, betrieb)
  return t.value.abo.testzeitVorbei(privat, PRIVATE_MAX_VEHICLES, betrieb)
})

// Abgerechnet wird im Jahr: Privat pro Konto, Betrieb pro Fahrzeug
function planPrice(plan: Plan): string {
  if (plan.priceChfPerMonth === 0)
    return t.value.abo.gratis
  const yearly = formatCurrency(Math.round(plan.priceChfPerMonth * 12 * 100) / 100)
  return plan.perVehicle ? t.value.abo.proFahrzeugJahr(yearly) : t.value.abo.proJahr(yearly)
}

function importSummary(imported: Record<string, number>): string {
  const arten = t.value.daten.arten as Record<string, string[]>
  return Object.entries(imported)
    .map(([key, count]) => {
      const [singular, plural] = arten[key] ?? [key, key]
      return `${count} ${count === 1 ? singular : plural}`
    })
    .join(', ')
}

function usagePercent(kind: LimitKind): number {
  if (!usage.value)
    return 0
  return Math.min(100, Math.round((usage.value.usage[kind] / usage.value.limits[kind]) * 100))
}

// Scans zählt man in Stück, Chat-Tokens sagen niemandem etwas: dort nur der Anteil in Worten
function usageText(kind: LimitKind): string {
  if (!usage.value)
    return ''
  if (kind === 'ocrPages')
    return `${formatNumber(usage.value.usage[kind])} / ${formatNumber(usage.value.limits[kind])}`
  const percent = usagePercent(kind)
  return percent < 1 ? t.value.abo.unterEinProzent : t.value.abo.genutzt(percent)
}

// Import und Zwischenspeicher braucht fast niemand; eingeklappt schrecken sie nicht ab
const showAdvanced = ref(false)

async function refreshUsage(): Promise<void> {
  try {
    usage.value = await fetchUsage()
    usageError.value = ''
  }
  catch (e: any) {
    usageError.value = e.message
  }
}

async function upgrade(plan: string): Promise<void> {
  checkoutBusy.value = plan
  try {
    window.location.href = await startCheckout(plan)
  }
  catch (e: any) {
    toast.add({ severity: 'warn', summary: e.message, life: 5000 })
  }
  finally {
    checkoutBusy.value = null
  }
}

async function refreshCacheCount(): Promise<void> {
  try {
    const result = await db.queryOnce({ ocrcache: {} })
    ocrCacheCount.value = (result.data.ocrcache || []).length
  }
  catch {
    ocrCacheCount.value = 0
  }
}

onMounted(() => {
  // Nach dem Abmelden (Konto gelöscht) mountet App.vue die Seite kurz im öffentlichen Layout neu: nichts laden
  if (!user.value)
    return
  refreshCacheCount()
  refreshUsage()
  vehiclesStore.load()
  reminders.load().catch(err => console.error('[settings] Erinnerungen laden', err))
})

async function handleExport(): Promise<void> {
  const json = await exportDatabase()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `wartungsheft-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  toast.add({ severity: 'success', summary: t.value.daten.exportiert, life: 3000 })
}

async function handleImport(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file)
    return
  try {
    const json = await file.text()
    const result = await importDatabase(json)
    toast.add({ severity: 'success', summary: t.value.daten.importOk(importSummary(result.imported)), life: 5000 })
    await refreshCacheCount()
  }
  catch (e: any) {
    toast.add({ severity: 'error', summary: t.value.daten.importFehler(e.message), life: 5000 })
  }
  input.value = ''
}

async function clearOcrCache(): Promise<void> {
  try {
    const result = await db.queryOnce({ ocrcache: {} })
    const entries = result.data.ocrcache || []
    if (entries.length) {
      await db.transact(entries.map((e: any) => tx.ocrcache[e.id].delete()))
    }
    ocrCacheCount.value = 0
    toast.add({ severity: 'success', summary: t.value.daten.cacheGeleert, life: 3000 })
  }
  catch {}
}

const themeOptions = computed(() => [
  { label: t.value.design.dunkel, value: 'dark' },
  { label: t.value.design.hell, value: 'light' },
  { label: t.value.design.system, value: 'system' },
])

const currencyOptions = HOME_CURRENCIES.map(c => ({ label: c, value: c }))
</script>

<template>
  <main class="page-container">
    <h2 class="page-title">
      {{ a.navigation.einstellungen }}
    </h2>

    <Card class="settings-card">
      <template #title>
        {{ t.sprache.titel }}
      </template>
      <template #content>
        <div class="form-field">
          <label id="sprache-label">{{ t.sprache.label }}</label>
          <SelectButton
            :model-value="appSprache"
            :options="sprachOptionen"
            option-label="label"
            option-value="value"
            :allow-empty="false"
            aria-labelledby="sprache-label"
            class="sprache-wahl"
            data-testid="sprache-wahl"
            @update:model-value="spracheWaehlen"
          />
          <small class="field-hint">{{ t.sprache.hinweis }}</small>
        </div>
      </template>
    </Card>

    <Card class="settings-card">
      <template #title>
        {{ t.design.titel }}
      </template>
      <template #content>
        <div class="form-field">
          <label>{{ t.design.farbschema }}</label>
          <Select
            v-model="settings.theme"
            :options="themeOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
        </div>
      </template>
    </Card>

    <Card class="settings-card">
      <template #title>
        {{ t.waehrung.titel }}
      </template>
      <template #content>
        <div class="form-field">
          <label for="home-currency">{{ t.waehrung.heimwaehrung }}</label>
          <Select
            v-model="settings.homeCurrency"
            input-id="home-currency"
            :options="currencyOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
          <small class="field-hint">{{ t.waehrung.hinweis }}</small>
        </div>
      </template>
    </Card>

    <Card class="settings-card">
      <template #title>
        {{ t.erinnerungen.titel }}
      </template>
      <template #content>
        <div class="form-field toggle-field">
          <ToggleSwitch
            :model-value="reminders.emailReminders"
            input-id="email-reminders"
            :disabled="!reminders.loaded"
            @update:model-value="toggleEmailReminders"
          />
          <label for="email-reminders">{{ t.erinnerungen.label }}</label>
        </div>
        <small class="field-hint">{{ t.erinnerungen.hinweis }}</small>
      </template>
    </Card>

    <Card class="settings-card">
      <template #title>
        {{ t.abo.titel }}
      </template>
      <template #content>
        <Message v-if="usageError" severity="error">
          {{ usageError }}
        </Message>
        <template v-else-if="usage">
          <div class="plan-line">
            <span>{{ t.abo.aktuellerPlan }} <strong>{{ planName(currentPlan) }}</strong></span>
            <span class="plan-price">{{ planPrice(currentPlan) }}</span>
          </div>
          <Message v-if="trialNote" :severity="usage.trial?.active ? 'info' : 'warn'" :closable="false" class="trial-note">
            {{ trialNote }}
          </Message>
          <div v-for="kind in limitKinds" :key="kind" class="usage-row">
            <div class="usage-label">
              <span>{{ LIMIT_LABELS[kind] }}</span>
              <span>{{ usageText(kind) }}</span>
            </div>
            <ProgressBar :value="usagePercent(kind)" :show-value="false" style="height: 0.5rem" />
          </div>
          <div class="provider-info">
            {{ t.abo.zaehler(formatMonth(usage.month)) }}
            {{ t.abo.fairUse }}
          </div>
          <div v-if="business" class="business-subscription" data-testid="business-subscription">
            <div>
              <strong>{{ t.abo.jahresabo(business.audience === 'privat' ? t.abo.planPrivat : t.abo.planBetrieb) }}</strong> ·
              {{ business.company || business.contact }} · {{ t.abo.fahrzeuge(business.vehicles) }}
            </div>
            <div v-if="business.periodEnd">
              <template v-if="business.cancelAtPeriodEnd">
                {{ t.abo.gekuendigtBis(lastPaidDay(business.periodEnd)) }}
              </template>
              <template v-else>
                {{ t.abo.laeuftBis(lastPaidDay(business.periodEnd)) }}
              </template>
            </div>
            <div v-if="business.openInvoice" class="open-invoice">
              {{ t.abo.offeneRechnung(business.openInvoice.number, formatCurrency(business.openInvoice.amount), formatDate(business.openInvoice.dueAt)) }}
              <a :href="`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.abo.mailBetreff(business.openInvoice.number))}`">{{ CONTACT_EMAIL }}</a>.
            </div>
            <Button
              v-if="business.cancelAtPeriodEnd"
              :label="t.abo.kuendigungZuruecknehmen"
              size="small"
              outlined
              :loading="businessBusy"
              @click="changeBusinessPlan('resume')"
            />
            <Button
              v-else
              :label="t.abo.kuendigen"
              size="small"
              severity="secondary"
              outlined
              :loading="businessBusy"
              @click="changeBusinessPlan('cancel')"
            />
          </div>
          <div v-else-if="canOrderBusiness" class="business-order">
            <div>
              <strong>{{ t.abo.planPrivat }}{{ t.abo.doppelpunkt }}</strong> {{ t.abo.privatZeile(formatCurrency(PRIVATE_YEARLY_CHF), PRIVATE_MAX_VEHICLES) }}
              <strong>{{ t.abo.planBetrieb }}{{ t.abo.doppelpunkt }}</strong> {{ t.abo.betriebZeile(formatCurrency(BUSINESS_VEHICLE_YEARLY_CHF)) }}
            </div>
            <!-- Frühes Bestellen darf nichts kosten, sonst wartet jeder bis zum letzten Testtag -->
            <div v-if="usage?.trial?.active" class="order-hint">
              {{ t.abo.frueherBestellen(formatDate(usage.trial.endsAt)) }}
            </div>
            <Button :label="t.abo.bestellen" size="small" @click="orderOpen = true" />
          </div>
          <div v-else-if="billingEnabled && upgradePlans.length" class="upgrade-list">
            <div v-for="plan in upgradePlans" :key="plan.id" class="upgrade-row">
              <div>
                <strong>{{ planName(plan) }}</strong> · {{ planPrice(plan) }} ·
                {{ plan.maxVehicles ? t.abo.bisFahrzeuge(plan.maxVehicles) : t.abo.rechnungFirma }}, {{ t.abo.ohneLimit }}
              </div>
              <Button
                :label="t.abo.wechseln(planName(plan))"
                size="small"
                :loading="checkoutBusy === plan.id"
                @click="upgrade(plan.id)"
              />
            </div>
          </div>
          <div class="provider-info">
            {{ t.abo.team }}
          </div>
        </template>
        <ProgressBar v-else mode="indeterminate" style="height: 0.5rem" />
      </template>
    </Card>

    <OrderDialog
      :visible="orderOpen"
      :active-vehicles="activeVehicleCount"
      :trial-ends-at="usage?.trial?.active ? usage.trial.endsAt : null"
      @close="orderOpen = false"
      @ordered="onOrdered"
    />

    <Card class="settings-card">
      <template #title>
        {{ t.daten.titel }}
      </template>
      <template #content>
        <div class="button-group">
          <Button
            :label="t.daten.exportieren"
            icon="pi pi-download"
            outlined
            class="export-btn"
            @click="handleExport"
          />
          <Button
            :label="showAdvanced ? t.daten.erweitertAus : t.daten.erweitertAn"
            :icon="showAdvanced ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            text
            severity="secondary"
            @click="showAdvanced = !showAdvanced"
          />
        </div>

        <template v-if="showAdvanced">
          <div class="button-group advanced-section">
            <Button
              :label="t.daten.importieren"
              icon="pi pi-upload"
              outlined
              class="import-btn"
              @click="importInput?.click()"
            />
            <input
              ref="importInput"
              type="file"
              accept=".json"
              style="display: none"
              @change="handleImport"
            >
          </div>

          <div class="cache-section">
            <Button
              :label="t.daten.cacheLeeren"
              icon="pi pi-trash"
              outlined
              severity="danger"
              size="small"
              class="clear-cache-btn"
              @click="clearOcrCache"
            />
            <span class="cache-count">
              {{ t.daten.gespeicherteScans(ocrCacheCount) }}
            </span>
          </div>
        </template>
      </template>
    </Card>

    <Card class="settings-card">
      <template #title>
        {{ t.konto.titel }}
      </template>
      <template #content>
        <p class="account-note">
          {{ t.konto.hinweis }}
        </p>
        <Button
          :label="t.konto.loeschen"
          icon="pi pi-user-minus"
          outlined
          severity="danger"
          @click="confirmDeleteAccount = true"
        />
      </template>
    </Card>

    <Dialog v-model:visible="confirmDeleteAccount" modal :header="t.konto.frage" :style="{ width: 'min(28rem, 92vw)' }">
      <p>{{ t.konto.text }}</p>
      <template #footer>
        <Button :label="a.abbrechen" text :disabled="deletingAccount" @click="confirmDeleteAccount = false" />
        <Button :label="t.konto.endgueltig" severity="danger" :loading="deletingAccount" @click="handleDeleteAccount" />
      </template>
    </Dialog>
  </main>
</template>

<style scoped>
.account-note {
  margin: 0 0 1rem;
  color: var(--p-text-muted-color);
}
.plan-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.plan-price {
  color: var(--p-text-muted-color);
}
.usage-row {
  margin-bottom: 0.75rem;
}
.usage-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}
.upgrade-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.upgrade-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.page-container {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0 0 1rem;
}

.settings-card {
  margin-bottom: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.field-hint {
  color: var(--p-text-muted-color);
  font-size: 0.8rem;
}

.toggle-field {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
}

.w-full {
  width: 100%;
}

.input-with-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-with-toggle .w-full {
  flex: 1;
}

.provider-info {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.5rem;
}

.provider-warning {
  margin-top: 0.5rem;
}

.business-subscription,
.order-hint {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  line-height: 1.5;
}

.business-order {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 0.75rem 0;
  padding: 0.75rem;
  border: 1px solid var(--p-surface-border);
  border-radius: var(--p-border-radius-md, 6px);
  font-size: 0.9rem;
  line-height: 1.45;
}

.open-invoice {
  color: var(--p-text-muted-color);
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.advanced-section {
  margin-top: 1rem;
}

.cache-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.cache-count {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}
</style>
