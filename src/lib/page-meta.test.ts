import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import publicSitemap from '../../public/sitemap.xml?raw'
import { sitemapUrls } from '../services/indexnow'
import { applyMetaToHtml, OEFFENTLICHE_SEITEN, PAGE_META, PAGE_META_SPRACHEN, pageMeta, SITE_URL } from './page-meta'
import { alleFassungen, ohneSprache, spracheAusPfad, SPRACHEN } from './sprache'

describe('pageMeta', () => {
  it('hat für jede Seite der Sitemap eigenen Titel und eigene Beschreibung', () => {
    const paths = sitemapUrls(publicSitemap).map(url => new URL(url).pathname)
    for (const path of paths)
      expect(PAGE_META_SPRACHEN[spracheAusPfad(path)][ohneSprache(path)], path).toBeDefined()
    const titles = SPRACHEN.flatMap(s => Object.values(PAGE_META_SPRACHEN[s.code]).map(meta => meta.title))
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('führt jede öffentliche Seite in jeder Sprache in der Sitemap', () => {
    const paths = sitemapUrls(publicSitemap).map(url => new URL(url).pathname)
    expect(OEFFENTLICHE_SEITEN).toEqual(alleFassungen(Object.keys(PAGE_META)))
    for (const path of OEFFENTLICHE_SEITEN)
      expect(paths, path).toContain(path)
  })

  it('hat in jeder Sprache dieselben Seiten', () => {
    for (const s of SPRACHEN)
      expect(Object.keys(PAGE_META_SPRACHEN[s.code]), s.code).toEqual(Object.keys(PAGE_META))
  })

  it('liefert Übersetzungen mit Sprache, eigener kanonischer Adresse und Verweisen auf alle Fassungen', () => {
    const meta = pageMeta('/fr/betrieb')
    expect(meta.title).toBe(PAGE_META_SPRACHEN.fr['/betrieb']!.title)
    expect(meta.lang).toBe('fr-CH')
    expect(meta.canonical).toBe(`${SITE_URL}/fr/betrieb`)
    expect(meta.alternates).toEqual([
      { hreflang: 'de-CH', href: `${SITE_URL}/betrieb` },
      { hreflang: 'fr-CH', href: `${SITE_URL}/fr/betrieb` },
      { hreflang: 'it-CH', href: `${SITE_URL}/it/betrieb` },
      { hreflang: 'en', href: `${SITE_URL}/en/betrieb` },
      { hreflang: 'x-default', href: `${SITE_URL}/betrieb` },
    ])
    expect(pageMeta('/it').canonical).toBe(`${SITE_URL}/it`)
    expect(pageMeta('/betrieb').lang).toBe('de-CH')
  })

  it('fällt für unbekannte Pfade auf die Startseite der Sprache zurück', () => {
    const meta = pageMeta('/en/impressum')
    expect(meta.title).toBe(PAGE_META_SPRACHEN.en['/']!.title)
    expect(meta.canonical).toBe(`${SITE_URL}/en`)
    expect(meta.lang).toBe('en')
  })

  it('nennt auf den Einstiegsseiten das Schweizer Wort «Serviceheft»', () => {
    for (const path of ['/', '/privathalter', '/betrieb', '/hilfe']) {
      expect(PAGE_META[path]!.title, path).toMatch(/Serviceheft/)
      expect(PAGE_META[path]!.description, path).toMatch(/Serviceheft/)
    }
  })

  it('nennt auf Startseite und Privathalter-Seite «Servicebuch», das in der Schweiz meistgesuchte Wort', () => {
    for (const path of ['/', '/privathalter']) {
      expect(PAGE_META[path]!.title, path).toMatch(/Servicebuch/)
      expect(PAGE_META[path]!.description, path).toMatch(/Servicebuch/)
    }
  })

  it('hält Titel und Beschreibung in der Länge, die Google anzeigt', () => {
    for (const s of SPRACHEN) {
      for (const [path, meta] of Object.entries(PAGE_META_SPRACHEN[s.code])) {
        expect(meta.title.length, `${s.code}${path}`).toBeLessThanOrEqual(65)
        expect(meta.description.length, `${s.code}${path}`).toBeLessThanOrEqual(160)
      }
    }
  })

  it('fällt für unbekannte Pfade auf die Startseite zurück, ohne kanonische Adresse auf den Pfad', () => {
    const meta = pageMeta('/dashboard')
    expect(meta.title).toBe(PAGE_META['/']!.title)
    expect(meta.canonical).toBe(`${SITE_URL}/`)
    expect(meta.alternates).toEqual([])
    expect(pageMeta('/betrieb').canonical).toBe(`${SITE_URL}/betrieb`)
  })
})

describe('applyMetaToHtml', () => {
  it('ersetzt Titel, Beschreibung und Open Graph und setzt die kanonische Adresse', () => {
    const html = applyMetaToHtml(indexHtml, '/betrieb')
    const meta = PAGE_META['/betrieb']!
    expect(html).toContain(`<title>${meta.title}</title>`)
    expect(html).toContain(`<meta name="description" content="${meta.description}" />`)
    expect(html).toContain(`<meta property="og:title" content="${meta.title}" />`)
    expect(html).toContain(`<meta property="og:description" content="${meta.description}" />`)
    expect(html).toContain(`<meta property="og:url" content="${SITE_URL}/betrieb" />`)
    expect(html).toContain(`<link rel="canonical" href="${SITE_URL}/betrieb" />`)
    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html.match(/rel="canonical"/g)).toHaveLength(1)
  })

  it('lässt sich wiederholt anwenden, ohne Tags zu verdoppeln', () => {
    const twice = applyMetaToHtml(applyMetaToHtml(indexHtml, '/'), '/hilfe')
    expect(twice.match(/rel="canonical"/g)).toHaveLength(1)
    expect(twice.match(/property="og:url"/g)).toHaveLength(1)
    expect(twice.match(/hreflang=/g)).toHaveLength(5)
    expect(twice).toContain(`<title>${PAGE_META['/hilfe']!.title}</title>`)
  })

  it('setzt Sprache und hreflang für Übersetzungen', () => {
    const html = applyMetaToHtml(applyMetaToHtml(indexHtml, '/'), '/it/betrieb')
    expect(html).toContain('<html lang="it-CH">')
    expect(html).toContain(`<title>${PAGE_META_SPRACHEN.it['/betrieb']!.title}</title>`)
    expect(html).toContain(`<link rel="canonical" href="${SITE_URL}/it/betrieb" />`)
    expect(html).toContain(`<link rel="alternate" hreflang="fr-CH" href="${SITE_URL}/fr/betrieb" />`)
    expect(html).toContain(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/betrieb" />`)
    expect(html.match(/hreflang=/g)).toHaveLength(5)
  })
})
