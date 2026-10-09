/**
 * Auffindbar für KI-Assistenten (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews): Sie zitieren nur, was ihre
 * Crawler lesen dürfen, und übernehmen Preise und Fakten aus llms.txt und dem JSON-LD der Seiten.
 */
import { BUSINESS_VEHICLE_YEARLY_CHF, PRIVATE_MAX_VEHICLES, PRIVATE_YEARLY_CHF } from '@strainovic/ai-proxy/plans'
import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import llms from '../../public/llms.txt?raw'
import robots from '../../public/robots.txt?raw'

const KI_CRAWLER = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot']
const OEFFENTLICH = ['/', '/privathalter', '/betrieb', '/hilfe', '/ratgeber', '/fr', '/it/betrieb', '/en/hilfe']
const RATGEBER = Object.keys(import.meta.glob('../../content/ratgeber/*.md')).map(pfad => pfad.split('/').pop()!.replace('.md', ''))

/** Darf der Crawler den Pfad lesen? RFC 9309: eigene Gruppe, sonst «*»; längste passende Regel, bei Gleichstand Allow */
function darfLesen(text: string, crawler: string, pfad: string): boolean {
  const gruppen: { namen: string[], regeln: { erlaubt: boolean, pfad: string }[] }[] = []
  let vorherAgent = false
  for (const roh of text.split('\n')) {
    const zeile = roh.replace(/#.*/, '').trim()
    if (!zeile.includes(':'))
      continue
    const feld = zeile.slice(0, zeile.indexOf(':')).trim().toLowerCase()
    const wert = zeile.slice(zeile.indexOf(':') + 1).trim()
    if (feld === 'user-agent') {
      if (!vorherAgent)
        gruppen.push({ namen: [], regeln: [] })
      gruppen.at(-1)!.namen.push(wert.toLowerCase())
      vorherAgent = true
      continue
    }
    vorherAgent = false
    if (gruppen.length && (feld === 'allow' || feld === 'disallow') && wert)
      gruppen.at(-1)!.regeln.push({ erlaubt: feld === 'allow', pfad: wert })
  }
  const eigene = gruppen.filter(g => g.namen.includes(crawler.toLowerCase()))
  const regeln = (eigene.length ? eigene : gruppen.filter(g => g.namen.includes('*'))).flatMap(g => g.regeln)
  const treffer = regeln.filter(r => pfad.startsWith(r.pfad))
    .sort((a, b) => b.pfad.length - a.pfad.length || Number(b.erlaubt) - Number(a.erlaubt))
  return treffer[0]?.erlaubt ?? true
}

describe('robots.txt', () => {
  it('nennt jeden KI-Crawler ausdrücklich und lässt ihn auf die öffentlichen Seiten', () => {
    for (const crawler of KI_CRAWLER) {
      expect(robots, crawler).toMatch(new RegExp(`^User-agent: ${crawler}$`, 'm'))
      for (const pfad of OEFFENTLICH)
        expect(darfLesen(robots, crawler, pfad), `${crawler} ${pfad}`).toBe(true)
    }
  })

  it('nennt die Sitemap', () => {
    expect(robots).toMatch(/^Sitemap: https:\/\/wartungsheft\.ch\/sitemap\.xml$/m)
  })
})

describe('llms.txt', () => {
  it('hat die Form nach llmstxt.org: H1, Blockzitat, H2-Abschnitte mit absoluten Links', () => {
    expect(llms.split('\n')[0]).toMatch(/^# \S/)
    expect(llms).toMatch(/^> \S/m)
    const links = [...llms.matchAll(/^- \[[^\]]+\]\(([^)]+)\)/gm)].map(m => m[1])
    expect(links.length).toBeGreaterThan(0)
    for (const link of links)
      expect(link).toMatch(/^https:\/\/wartungsheft\.ch\//)
  })

  it('nennt die Preise aus plans.ts', () => {
    expect(llms).toContain(`Privat: ${PRIVATE_YEARLY_CHF} CHF im Jahr, bis ${PRIVATE_MAX_VEHICLES} Fahrzeuge`)
    expect(llms).toContain(`Betrieb: ${BUSINESS_VEHICLE_YEARLY_CHF} CHF pro Fahrzeug und Jahr`)
  })

  it('verlinkt jeden Ratgeber-Artikel', () => {
    expect(RATGEBER.length).toBeGreaterThan(0)
    for (const slug of RATGEBER)
      expect(llms, slug).toContain(`(https://wartungsheft.ch/ratgeber/${slug})`)
  })

  it('sagt, dass auch die App vier Sprachen spricht', () => {
    expect(llms).not.toMatch(/App selbst ist deutsch/)
    expect(llms).toMatch(/App[^\n]*Deutsch, Französisch, Italienisch und Englisch/)
  })
})

describe('strukturierte Daten (JSON-LD) der Einstiegsseiten', () => {
  it('nennt die Preise aus plans.ts in CHF', () => {
    const block = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)![1]
    const daten = JSON.parse(block)
    const preise = Object.fromEntries(daten.offers.map((o: { name: string, price: string }) => [o.name, Number(o.price)]))
    expect(preise).toEqual({ Privat: PRIVATE_YEARLY_CHF, Betrieb: BUSINESS_VEHICLE_YEARLY_CHF })
    expect(daten.offers.every((o: { priceCurrency: string }) => o.priceCurrency === 'CHF')).toBe(true)
  })
})
