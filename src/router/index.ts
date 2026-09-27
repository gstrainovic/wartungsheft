import type { RouteRecordRaw } from 'vue-router'
import type { Campaign } from '../stores/events'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { applyMetaToDocument } from '../lib/page-meta-document'
import { mitSprache, ohneSprache, PRAEFIXE } from '../lib/sprache'
import { CAMPAIGNS, useEventsStore } from '../stores/events'

// Öffentliche Seiten gibt es auch unter /fr, /it und /en (src/lib/sprache.ts); Deutsch bleibt ohne Präfix
const publicRoutes: RouteRecordRaw[] = [
  { path: '/', component: () => import('../pages/LandingPage.vue'), meta: { public: true } },
  { path: '/login', component: () => import('../pages/LoginPage.vue'), meta: { public: true } },
  { path: '/impressum', component: () => import('../pages/ImpressumPage.vue'), meta: { public: true } },
  { path: '/datenschutz', component: () => import('../pages/DatenschutzPage.vue'), meta: { public: true } },
  { path: '/agb', component: () => import('../pages/AgbPage.vue'), meta: { public: true } },
  { path: '/hilfe', component: () => import('../pages/HilfePage.vue'), meta: { public: true } },
  { path: '/betrieb', component: () => import('../pages/BetriebPage.vue'), meta: { public: true } },
  { path: '/privathalter', component: () => import('../pages/PrivathalterPage.vue'), meta: { public: true } },
  { path: '/anlagen', component: () => import('../pages/AnlagenPage.vue'), meta: { public: true } },
  // Inserat-Adressen: Besuch zählen, dann auf die passende Landing Page
  ...Object.entries(CAMPAIGNS).map(([name, target]) => ({
    path: `/${name}`,
    redirect: () => {
      useEventsStore().trackVisit(name as Campaign)
      return target
    },
  })),
]

const translatedRoutes: RouteRecordRaw[] = PRAEFIXE.flatMap(sprache => publicRoutes.map((route) => {
  const path = mitSprache(sprache, route.path)
  if (!route.redirect)
    return { ...route, path } as RouteRecordRaw
  // Kampagnen-Weiterleitung in der Sprache der Adresse: /fr/ratgeber-test → /fr/privathalter
  const redirect = route.redirect as (...args: never[]) => string
  return { path, redirect: () => mitSprache(sprache, redirect()) }
}))

const routes: RouteRecordRaw[] = [
  ...publicRoutes,
  ...translatedRoutes,
  { path: '/dashboard', component: () => import('../pages/DashboardPage.vue') },
  { path: '/vehicles', component: () => import('../pages/VehiclesPage.vue') },
  { path: '/vehicles/:id', component: () => import('../pages/VehicleDetailPage.vue') },
  { path: '/scan', redirect: '/dashboard?chat=open' },
  { path: '/settings', component: () => import('../pages/SettingsPage.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash)
      return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.beforeEach(async (to) => {
  const { user, authReady } = useAuth()
  await authReady

  // Eingeloggt + Landing Page (jede Sprache) → Dashboard
  if (user.value && ohneSprache(to.path) === '/')
    return '/dashboard'

  if (to.meta.public)
    return true

  // Nicht eingeloggt → Login
  if (!user.value)
    return '/login'

  return true
})

// Titel, Beschreibung und kanonische Adresse pro Seite (src/lib/page-meta.ts)
router.afterEach(to => applyMetaToDocument(document, to.path))

export default router
