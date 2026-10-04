import { describe, expect, it } from 'vitest'
import { primeVueSprache } from './primevue-sprache'

describe('primeVueSprache', () => {
  it('setzt die Texte der Sprache und behält übrige PrimeVue-Schlüssel', () => {
    const locale: Record<string, any> = { accept: 'Yes', weak: 'Weak', firstDayOfWeek: 0, aria: { close: 'Close', star: '1 star' } }
    primeVueSprache(locale, 'fr')
    expect(locale.accept).toBe('Oui')
    expect(locale.aria.close).toBe('Fermer')
    expect(locale.aria.star).toBe('1 star')
    expect(locale.weak).toBe('Weak')
    expect(locale.firstDayOfWeek).toBe(1)
    primeVueSprache(locale, 'en')
    expect(locale.aria.close).toBe('Close')
    expect(locale.firstDayOfWeek).toBe(1)
  })
})
