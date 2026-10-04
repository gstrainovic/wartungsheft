import { describe, expect, it } from 'vitest'
import { DEFAULT_CURRENCY, formatCurrency, formatDate, formatMonth, formatNumber, normalizeCurrency, zahlenLocale } from './locale'

// Schweizer Standard: CHF, Apostroph als Tausendertrenner, Punkt als Dezimaltrenner
describe('locale', () => {
  it('standardwährung ist CHF', () => {
    expect(DEFAULT_CURRENCY).toBe('CHF')
  })

  it('formatiert Beträge im Schweizer Format mit CHF', () => {
    expect(formatCurrency(1234.5)).toBe('CHF 1\'234.50')
    expect(formatCurrency(0)).toBe('CHF 0.00')
    expect(formatCurrency(1234567.891)).toBe('CHF 1\'234\'567.89')
  })

  it('behält die Währung der Rechnung', () => {
    expect(formatCurrency(89.9, 'EUR')).toBe('EUR 89.90')
  })

  it('nimmt undefined als 0', () => {
    expect(formatCurrency(undefined)).toBe('CHF 0.00')
    expect(formatNumber(null)).toBe('0')
  })

  it('normalisiert Währungssymbole und Schreibweisen aus dem Scan auf ISO-Codes', () => {
    expect(normalizeCurrency('€')).toBe('EUR')
    expect(normalizeCurrency('EUR')).toBe('EUR')
    expect(normalizeCurrency('eur')).toBe('EUR')
    expect(normalizeCurrency('Euro')).toBe('EUR')
    expect(normalizeCurrency('CHF')).toBe('CHF')
    expect(normalizeCurrency('Fr.')).toBe('CHF')
    expect(normalizeCurrency('SFr.')).toBe('CHF')
    expect(normalizeCurrency('$')).toBe('USD')
    expect(normalizeCurrency(' chf ')).toBe('CHF')
    expect(normalizeCurrency(undefined)).toBe(DEFAULT_CURRENCY)
    expect(normalizeCurrency('')).toBe(DEFAULT_CURRENCY)
    expect(normalizeCurrency('XYZ')).toBe('XYZ')
  })

  it('formatiert ISO-Daten als TT.MM.JJJJ, ohne Zeitzonenverschiebung', () => {
    expect(formatDate('2025-04-03')).toBe('03.04.2025')
    expect(formatDate('2026-09-14T10:00:00Z')).toBe('14.09.2026')
    expect(formatDate(new Date(2024, 0, 31))).toBe('31.01.2024')
    expect(formatDate('')).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('kaputt')).toBe('kaputt')
    expect(formatMonth('2026-09')).toBe('September 2026')
  })

  it('formatiert je Sprache: Schweizer Format für de, fr, it, britisches für en', () => {
    expect(formatCurrency(1234.5, 'CHF', 'fr')).toBe('CHF 1\'234.50')
    expect(formatCurrency(1234.5, 'CHF', 'it')).toBe('CHF 1\'234.50')
    expect(formatCurrency(1234.5, 'CHF', 'en')).toBe('CHF 1,234.50')
    expect(formatNumber(45000, 0, 'en')).toBe('45,000')
    expect(formatDate('2025-04-03', 'fr')).toBe('03.04.2025')
    expect(formatDate('2025-04-03', 'it')).toBe('03.04.2025')
    expect(formatDate('2025-04-03', 'en')).toBe('03/04/2025')
    expect(formatDate(new Date(2024, 0, 31), 'en')).toBe('31/01/2024')
    expect(formatMonth('2026-09', 'fr')).toBe('septembre 2026')
    expect(formatMonth('2026-03', 'it')).toBe('marzo 2026')
    expect(formatMonth('2026-09', 'en')).toBe('September 2026')
  })

  it('folgt ohne Angabe der Sprache der App', async () => {
    const { setAppSprache } = await import('./app-sprache')
    setAppSprache('en')
    try {
      expect(formatDate('2025-04-03')).toBe('03/04/2025')
      expect(zahlenLocale()).toBe('en-GB')
    }
    finally {
      setAppSprache('de')
    }
    expect(zahlenLocale()).toBe('de-CH')
  })

  it('formatiert Kilometer ohne Nachkommastellen', () => {
    expect(formatNumber(45000)).toBe('45\'000')
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(-1500)).toBe('-1\'500')
  })
})
