import type { Sprache } from '../lib/sprache'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getCurrentUserId } from '../composables/useAuth'
import { appSprache, setAppSprache, spracheNachLaden } from '../lib/app-sprache'
import { db, id, tx } from '../lib/instantdb'

/**
 * Entität `settings`: ein Dokument pro Nutzer (creatorId). E-Mail-Erinnerungen und die Sprache der App; der Server-Job
 * (scripts/reminders.ts) liest `emailReminders` und `sprache` und schreibt `lastReminderAt`/`lastReminderKey` in
 * dasselbe Dokument. Fehlt das Dokument, sind Erinnerungen eingeschaltet und die Sprache ist die des Browsers.
 */
export interface UserSettings {
  id: string
  creatorId: string
  emailReminders?: boolean
  /** de, fr, it oder en (src/lib/app-sprache.ts) */
  sprache?: Sprache
  lastReminderAt?: string
  lastReminderKey?: string
  createdAt: string
  updatedAt: string
}

export const useRemindersStore = defineStore('reminders', () => {
  const settings = ref<UserSettings | null>(null)
  const loaded = ref(false)

  async function update(attrs: Partial<Pick<UserSettings, 'emailReminders' | 'sprache'>>): Promise<void> {
    const now = new Date().toISOString()
    if (settings.value) {
      await db.transact([(tx.settings as any)[settings.value.id].update({ ...attrs, updatedAt: now })])
      settings.value = { ...settings.value, ...attrs, updatedAt: now }
      return
    }
    const doc: UserSettings = { id: id(), creatorId: getCurrentUserId(), ...attrs, createdAt: now, updatedAt: now }
    const { id: docId, ...rest } = doc
    await db.transact([(tx.settings as any)[docId].update(rest)])
    settings.value = doc
  }

  async function load(): Promise<void> {
    const userId = getCurrentUserId()
    const result = await db.queryOnce({ settings: { $: { where: { creatorId: userId } } } })
    settings.value = ((result?.data?.settings || []) as UserSettings[])[0] ?? null
    loaded.value = true
    const { anwenden, speichern } = spracheNachLaden(settings.value?.sprache, appSprache.value)
    if (anwenden)
      setAppSprache(anwenden)
    if (speichern)
      await update({ sprache: speichern })
  }

  const emailReminders = computed(() => settings.value?.emailReminders !== false)

  async function setEmailReminders(enabled: boolean): Promise<void> {
    await update({ emailReminders: enabled })
  }

  /** Sprache der App wählen: gilt sofort, bleibt im Browser und am Benutzer (für andere Geräte und Mails) */
  async function setSprache(sprache: Sprache): Promise<void> {
    setAppSprache(sprache)
    await update({ sprache })
  }

  return { settings, loaded, emailReminders, load, setEmailReminders, setSprache }
})
