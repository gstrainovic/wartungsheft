/**
 * Fahrzeuggrenze des Privatplans. Solange kein Zahlungsanbieter eingerichtet ist (`VITE_BILLING_ENABLED`),
 * wird nichts gesperrt: die ersten Kunden zahlen per Jahresrechnung, und ein hartes Limit ohne Kaufweg
 * würde nur bestehende Konten lahmlegen. Der Betriebsplan rechnet pro Fahrzeug und hat keine Grenze.
 */
import type { Plan } from '@strainovic/ai-proxy/plans'
import { BUSINESS_VEHICLE_YEARLY_CHF, yearlyPriceChf } from '@strainovic/ai-proxy/plans'
import { waehle } from '../lib/app-sprache'
import { formatCurrency } from '../lib/locale'
import texte from '../texte/app/fahrzeuge'

export interface VehicleLimitState {
  /** true, wenn kein weiteres Fahrzeug im Plan enthalten ist */
  reached: boolean
  /** Hinweistext für die Fahrzeugliste in der App-Sprache; leer, wenn nichts zu sagen ist */
  note: string
}

export function vehicleLimit(count: number, plan: Plan | undefined, billingEnabled: boolean): VehicleLimitState {
  const max = plan?.maxVehicles
  if (!billingEnabled || !max || plan?.perVehicle || count < max)
    return { reached: false, note: '' }
  const next = count + 1
  return {
    reached: true,
    note: waehle(texte).grenze(max, formatCurrency(BUSINESS_VEHICLE_YEARLY_CHF), formatCurrency(yearlyPriceChf(next, 'betrieb')), next),
  }
}
