import Aura from '@primeuix/themes/aura'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import { createApp, watch } from 'vue'
import App from './App.vue'
import { appSprache } from './lib/app-sprache'
import { primeVueSprache } from './lib/primevue-sprache'
import { sprachTag } from './lib/sprache'
import router from './router'

import 'primeicons/primeicons.css'
import './styles/design-tokens.css'
import './styles/typography.css'

// Theme sofort anwenden bevor Vue mountet (verhindert Light-Flash)
void (() => {
  const theme = localStorage.getItem('theme') || 'dark'
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark)
  if (isDark)
    document.documentElement.classList.add('dark-mode')
})()

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.directive('tooltip', Tooltip)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark-mode',
      cssLayer: false,
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)

// Sprache der App (src/lib/app-sprache.ts): PrimeVue-Texte und lang-Attribut hinter der Anmeldung; die öffentlichen
// Seiten setzen lang selbst über page-meta
watch(appSprache, (sprache) => {
  primeVueSprache(app.config.globalProperties.$primevue.config.locale as Record<string, any>, sprache)
  if (router.currentRoute.value.meta.public !== true)
    document.documentElement.lang = sprachTag(sprache)
}, { immediate: true })
router.afterEach((to) => {
  if (to.meta.public !== true)
    document.documentElement.lang = sprachTag(appSprache.value)
})

app.mount('#app')
// Vorgerenderter Inhalt ist jetzt ersetzt (src/lib/prerender.ts), die Seite darf wieder sichtbar sein
void router.isReady().then(() => document.documentElement.classList.remove('prerender-hidden'))
