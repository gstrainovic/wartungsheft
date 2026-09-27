import type { LandingSegment } from '../stores/events'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authEntry } from '../lib/known-account'
import { useEventsStore } from '../stores/events'
import layoutTexte from '../texte/layout'
import { useAuth } from './useAuth'
import { useSprache } from './useSprache'

/**
 * Einstieg auf den öffentlichen Seiten: eingeloggt in die App, bekanntes Konto zum Anmelden, sonst die Testzeit.
 * Nur der Klick in die Testzeit zählt in `events`, Kunden beim Anmelden verfälschen die Auswertung sonst.
 * Die Anmeldung öffnet in der Sprache der Seite, die App dahinter ist deutsch.
 */
export function useAuthEntry(segment?: LandingSegment) {
  const router = useRouter()
  const { user, knownEmail } = useAuth()
  const events = useEventsStore()
  const { t, pfad } = useSprache(layoutTexte)

  const entry = computed(() => authEntry({ loggedIn: !!user.value, knownEmail: knownEmail.value }))
  const label = computed(() => t.value.einstieg[entry.value])

  function go() {
    if (entry.value === 'app') {
      router.push('/dashboard')
      return
    }
    if (entry.value === 'trial' && segment)
      events.trackCta(segment)
    router.push(pfad('/login'))
  }

  return { entry, label, go }
}
