import type { Sprache } from '../lib/sprache'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { appSprache } from '../lib/app-sprache'
import { mitSprache, spracheAusPfad } from '../lib/sprache'

/**
 * Sprache der aktuellen Seite und ein Helfer für interne Links (src/lib/sprache.ts).
 * Öffentliche Seiten (`meta.public`) nehmen die Sprache aus dem Pfad, die App hinter der Anmeldung die gewählte
 * App-Sprache (src/lib/app-sprache.ts). `texte` ist ein Objekt mit je einer Fassung pro Sprache, `t` die passende.
 */
export function useSprache<T>(texte?: Record<Sprache, T>) {
  const route = useRoute()
  const sprache = computed<Sprache>(() => {
    const ausPfad = spracheAusPfad(route?.path ?? '/')
    return ausPfad !== 'de' || route?.meta?.public === true ? ausPfad : appSprache.value
  })
  const pfad = (ziel: string) => mitSprache(sprache.value, ziel)
  const t = computed(() => texte?.[sprache.value] as T)
  return { sprache, pfad, t }
}
