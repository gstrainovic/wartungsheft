<script setup lang="ts">
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { ref } from 'vue'
import AppLogo from '../components/AppLogo.vue'
import LandingFooter from '../components/LandingFooter.vue'
import { useAuth } from '../composables/useAuth'
import { useSprache } from '../composables/useSprache'
import { setAppSprache } from '../lib/app-sprache'
import loginTexte from '../texte/login'

const { t, pfad, sprache } = useSprache(loginTexte)
// Die App nach der Anmeldung spricht die Sprache der Login-Seite, bis am Benutzer eine andere gespeichert ist
setAppSprache(sprache.value)
const { sendMagicCode, signInWithMagicCode, googleAuthUrl, knownEmail, forgetKnownAccount } = useAuth()
const googleUrl = googleAuthUrl()

// Neue und bestehende Konten nehmen denselben Weg; ein bekanntes Konto ist vorausgefüllt
const email = ref(knownEmail.value ?? '')
const code = ref('')
const sentEmail = ref('')
const loading = ref(false)
const error = ref('')

async function handleSendCode() {
  error.value = ''
  loading.value = true
  try {
    await sendMagicCode(email.value)
    sentEmail.value = email.value
  }
  catch (err: any) {
    error.value = err.body?.message || t.value.fehlerSenden
  }
  finally {
    loading.value = false
  }
}

async function handleVerifyCode() {
  error.value = ''
  loading.value = true
  try {
    await signInWithMagicCode(sentEmail.value, code.value)
  }
  catch (err: any) {
    code.value = ''
    error.value = err.body?.message || t.value.fehlerCode
  }
  finally {
    loading.value = false
  }
}

// Fremdes oder geteiltes Gerät: Adresse vergessen, danach gilt das Gerät als unbekannt
function handleForget() {
  forgetKnownAccount()
  email.value = ''
}

function handleBack() {
  sentEmail.value = ''
  code.value = ''
  error.value = ''
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <router-link :to="pfad('/')" class="login-header">
        <AppLogo size="3.5rem" class="login-logo" />
        <h1>Wartungsheft</h1>
      </router-link>
      <p v-if="knownEmail" class="login-tagline">
        {{ t.willkommen }}
      </p>
      <template v-else>
        <p class="login-tagline">
          {{ t.neu }}
        </p>
        <p class="login-tagline">
          {{ t.kunde }}
        </p>
      </template>

      <Message v-if="error" severity="error" :closable="false">
        {{ error }}
      </Message>

      <!-- Step 1: E-Mail eingeben -->
      <form v-if="!sentEmail" @submit.prevent="handleSendCode">
        <p class="login-description">
          {{ t.beschreibung }} <router-link :to="pfad('/datenschutz')">
            {{ t.datenschutz }}
          </router-link>.
        </p>
        <div class="login-field">
          <InputText
            v-model="email"
            type="email"
            :placeholder="t.email"
            required
            autofocus
            fluid
          />
        </div>
        <Button
          type="submit"
          :label="t.senden"
          icon="pi pi-send"
          :loading="loading"
          fluid
        />
        <Button
          v-if="knownEmail"
          type="button"
          :label="t.andere"
          text
          fluid
          class="login-back"
          @click="handleForget"
        />
        <div class="login-divider">
          <span>{{ t.oder }}</span>
        </div>
        <Button
          as="a"
          :href="googleUrl"
          :label="t.google"
          icon="pi pi-google"
          severity="secondary"
          outlined
          fluid
        />
      </form>

      <!-- Step 2: Code eingeben -->
      <form v-else @submit.prevent="handleVerifyCode">
        <p class="login-description">
          {{ t.gesendet }} <strong>{{ sentEmail }}</strong>{{ t.gesendetNach }}
        </p>
        <div class="login-field">
          <InputText
            v-model="code"
            type="text"
            :placeholder="t.code"
            required
            autofocus
            fluid
            inputmode="numeric"
            maxlength="6"
          />
        </div>
        <Button
          type="submit"
          :label="t.anmelden"
          icon="pi pi-sign-in"
          :loading="loading"
          fluid
        />
        <Button
          type="button"
          :label="t.andere"
          text
          fluid
          class="login-back"
          @click="handleBack"
        />
      </form>
    </div>
  </div>
  <LandingFooter />
</template>

<style scoped>
/* Karte füllt den Platz über dem Fuss, der Fuss bleibt unten */
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 6rem);
  background: var(--p-surface-ground);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--p-surface-card);
  border-radius: var(--p-border-radius);
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.login-header {
  display: block;
  text-align: center;
  text-decoration: none;
}

.login-tagline {
  text-align: center;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
  margin: 0.5rem 0 1.5rem;
}

.login-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0;
  color: var(--p-text-muted-color);
  font-size: 0.85rem;
}

.login-divider::before,
.login-divider::after {
  content: '';
  flex: 1;
  border-top: 1px solid var(--p-surface-border);
}

.login-logo {
  margin: 0 auto;
}

.login-header h1 {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  color: var(--p-text-color);
}

.login-description {
  color: var(--p-text-muted-color);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.login-field {
  margin-bottom: 1rem;
}

.login-back {
  margin-top: 0.5rem;
}
</style>
