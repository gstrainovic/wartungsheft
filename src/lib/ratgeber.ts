/**
 * Ratgeber-Artikel als fertiges HTML: Markdown aus `content/ratgeber/<adresse>.md` wird beim Build zu
 * `dist/ratgeber/<adresse>/index.html` (Vite-Plugin in `vite.config.ts`), Übersetzungen aus
 * `content/ratgeber/<fr|it|en>/<adresse>.md` zu `dist/<fr|it|en>/ratgeber/<adresse>/index.html` (src/lib/sprache.ts).
 * Anders als die App-Seiten brauchen diese Seiten kein JavaScript, damit Suchmaschinen und KI-Crawler den ganzen
 * Text lesen. Bewusst ohne Browser- und Vite-Abhängigkeit, `vite.config.ts` importiert die Datei.
 */
import type { Sprache } from './sprache.ts'
import { marked } from 'marked'
import { formatDate } from './locale.ts'
import { SITE_URL } from './page-meta.ts'
import { mitSprache, SPRACHEN, sprachTag } from './sprache.ts'

export interface Article {
  slug: string
  sprache: Sprache
  title: string
  description: string
  date: string
  body: string
}

/** Kampagne in `CAMPAIGNS` (src/stores/events.ts): zählt den Weg vom Artikel in die Testzeit. */
const CTA_PATH = '/ratgeber-test'

const TEXTE: Record<Sprache, {
  ratgeber: string
  hilfe: string
  impressum: string
  cta: string
  knopf: string
  indexTitel: string
  indexBeschreibung: string
}> = {
  de: {
    ratgeber: 'Ratgeber',
    hilfe: 'Hilfe',
    impressum: 'Impressum',
    cta: '<strong>Serviceheft auf dem Handy:</strong> Werkstattrechnung fotografieren, Wartungsheft trägt Datum,\n        Kilometerstand und Arbeiten ein und erinnert vor Service und MFK.',
    knopf: '30 Tage gratis testen',
    indexTitel: 'Ratgeber: Serviceheft, Wartung und Occasion | Wartungsheft',
    indexBeschreibung: 'Ratgeber für Autohalter in der Schweiz: Serviceheft führen, Wartung planen, Occasion verkaufen.',
  },
  fr: {
    ratgeber: 'Guide',
    hilfe: 'Aide',
    impressum: 'Mentions légales',
    cta: '<strong>Le carnet d’entretien sur le téléphone :</strong> photographiez la facture du garage, Wartungsheft\n        enregistre la date, le kilométrage et les travaux et vous rappelle le service et l’expertise.',
    knopf: 'Essayer 30 jours gratuitement',
    indexTitel: 'Guide : carnet d’entretien, entretien et occasion | Wartungsheft',
    indexBeschreibung: 'Guide pour les détenteurs de voitures en Suisse : tenir le carnet d’entretien, planifier l’entretien, vendre une occasion.',
  },
  it: {
    ratgeber: 'Guida',
    hilfe: 'Aiuto',
    impressum: 'Note legali',
    cta: '<strong>Il libretto di manutenzione sul telefono:</strong> fotografa la fattura dell\'officina, Wartungsheft\n        registra data, chilometraggio e lavori e ti ricorda servizio e collaudo.',
    knopf: 'Prova gratis per 30 giorni',
    indexTitel: 'Guida: libretto di manutenzione, manutenzione e usato | Wartungsheft',
    indexBeschreibung: 'Guida per i detentori di auto in Svizzera: tenere il libretto di manutenzione, pianificare la manutenzione, vendere l\'usato.',
  },
  en: {
    ratgeber: 'Guide',
    hilfe: 'Help',
    impressum: 'Legal notice',
    cta: '<strong>Your service book on your phone:</strong> photograph the garage invoice, Wartungsheft records the date,\n        mileage and work done and reminds you before servicing and the MFK inspection.',
    knopf: 'Try free for 30 days',
    indexTitel: 'Guide: service book, maintenance and used cars | Wartungsheft',
    indexBeschreibung: 'Guide for car owners in Switzerland: keeping a service book, planning maintenance, selling a used car.',
  },
}

export function parseArticle(slug: string, source: string, sprache: Sprache = 'de'): Article {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source)
  const head: Record<string, string> = {}
  for (const line of (match?.[1] ?? '').split('\n')) {
    const i = line.indexOf(':')
    if (i > 0)
      head[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  for (const key of ['title', 'description', 'date']) {
    if (!head[key])
      throw new Error(`Ratgeber ${sprache}/${slug}: ${key} fehlt im Kopf`)
  }
  return { slug, sprache, title: head.title!, description: head.description!, date: head.date!, body: (match?.[2] ?? '').trim() }
}

function escape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const STYLE = `
  :root { color-scheme: light dark; --accent: #059669; --text: #1f2937; --muted: #6b7280; --bg: #ffffff; --soft: #ecfdf5; }
  @media (prefers-color-scheme: dark) { :root { --text: #e5e7eb; --muted: #9ca3af; --bg: #111827; --soft: #064e3b; } }
  * { box-sizing: border-box; }
  body { margin: 0; font: 17px/1.65 system-ui, -apple-system, 'Segoe UI', sans-serif; color: var(--text); background: var(--bg); }
  header, main, footer { max-width: 44rem; margin: 0 auto; padding: 0 16px; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 16px; padding-bottom: 16px; }
  header a.brand { display: flex; align-items: center; gap: 8px; color: var(--text); text-decoration: none; font-weight: 700; }
  header img { width: 32px; height: 32px; }
  header nav { display: flex; gap: 12px; align-items: center; }
  header nav .lang { font-size: 0.85rem; color: var(--muted); text-decoration: none; }
  a { color: var(--accent); }
  h1 { font-size: 1.9rem; line-height: 1.25; margin: 1.5rem 0 0.5rem; }
  h2 { font-size: 1.3rem; margin-top: 2rem; }
  .meta { color: var(--muted); font-size: 0.9rem; }
  .cta { background: var(--soft); border-radius: 12px; padding: 20px; margin: 2.5rem 0; }
  .cta p { margin: 0 0 12px; }
  .button { display: inline-block; background: var(--accent); color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  ul.list { padding: 0; list-style: none; }
  ul.list li { margin: 0 0 1.5rem; }
  footer { color: var(--muted); font-size: 0.9rem; padding-top: 24px; padding-bottom: 32px; }
`

interface Fassung { sprache: Sprache, path: string }

function page(opts: { sprache: Sprache, title: string, description: string, path: string, fassungen: Fassung[], jsonLd: object, content: string }): string {
  const canonical = `${SITE_URL}${opts.path}`
  const t = TEXTE[opts.sprache]
  const pfad = (ziel: string) => mitSprache(opts.sprache, ziel)
  const deutsch = opts.fassungen.find(f => f.sprache === 'de')
  const alternates = opts.fassungen.length > 1
    ? [
        ...opts.fassungen.map(f => `    <link rel="alternate" hreflang="${sprachTag(f.sprache)}" href="${SITE_URL}${f.path}" />`),
        ...(deutsch ? [`    <link rel="alternate" hreflang="x-default" href="${SITE_URL}${deutsch.path}" />`] : []),
      ].join('\n')
    : ''
  // Sprachwahl: dieselbe Seite in den anderen vorhandenen Sprachen
  const sprachwahl = opts.fassungen
    .filter(f => f.sprache !== opts.sprache)
    .map(f => `<a class="lang" href="${f.path}" hreflang="${sprachTag(f.sprache)}" lang="${sprachTag(f.sprache)}">${f.sprache.toUpperCase()}</a>`)
    .join(' ')
  return `<!doctype html>
<html lang="${sprachTag(opts.sprache)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escape(opts.title)}</title>
    <meta name="description" content="${escape(opts.description)}" />
    <link rel="canonical" href="${canonical}" />
${alternates}
    <meta property="og:title" content="${escape(opts.title)}" />
    <meta property="og:description" content="${escape(opts.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="article" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <script type="application/ld+json">
${JSON.stringify(opts.jsonLd, null, 2)}
    </script>
    <style>${STYLE}</style>
  </head>
  <body>
    <header>
      <a class="brand" href="${pfad('/')}"><img src="/favicon.svg" alt="" />Wartungsheft</a>
      <nav>${sprachwahl} <a href="${pfad('/ratgeber')}">${t.ratgeber}</a></nav>
    </header>
    <main>
${opts.content}
    </main>
    <footer>
      <a href="${pfad('/')}">Wartungsheft</a> · <a href="${pfad('/hilfe')}">${t.hilfe}</a> · <a href="${pfad('/impressum')}">${t.impressum}</a> ·
      <a href="mailto:info@wartungsheft.ch">info@wartungsheft.ch</a>
    </footer>
  </body>
</html>
`
}

function articlePath(sprache: Sprache, slug: string): string {
  return mitSprache(sprache, `/ratgeber/${slug}`)
}

/** `fassungen`: Sprachen, in denen es den Artikel gibt (für hreflang und die Sprachwahl) */
export function renderArticlePage(article: Article, fassungen: Sprache[] = [article.sprache]): string {
  const t = TEXTE[article.sprache]
  const path = articlePath(article.sprache, article.slug)
  const content = `      <article>
        <h1>${escape(article.title)}</h1>
        <p class="meta">${formatDate(article.date)}</p>
${marked.parse(article.body, { async: false })}
      </article>
      <aside class="cta">
        <p>${t.cta}</p>
        <a class="button" href="${mitSprache(article.sprache, CTA_PATH)}">${t.knopf}</a>
      </aside>`
  return page({
    sprache: article.sprache,
    title: `${article.title} | Wartungsheft`,
    description: article.description,
    path,
    fassungen: SPRACHEN.filter(s => fassungen.includes(s.code)).map(s => ({ sprache: s.code, path: articlePath(s.code, article.slug) })),
    content,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.title,
      'description': article.description,
      'datePublished': article.date,
      'inLanguage': sprachTag(article.sprache),
      'mainEntityOfPage': `${SITE_URL}${path}`,
      'publisher': { '@type': 'Organization', 'name': 'Wartungsheft', 'url': SITE_URL },
    },
  })
}

function newestFirst(articles: Article[]): Article[] {
  return [...articles].sort((a, b) => b.date.localeCompare(a.date))
}

export function renderIndexPage(articles: Article[], sprache: Sprache = 'de'): string {
  const t = TEXTE[sprache]
  const items = newestFirst(articles.filter(a => a.sprache === sprache)).map(a => `        <li>
          <a href="${articlePath(sprache, a.slug)}"><strong>${escape(a.title)}</strong></a><br />
          ${escape(a.description)}
        </li>`).join('\n')
  const path = mitSprache(sprache, '/ratgeber')
  return page({
    sprache,
    title: t.indexTitel,
    description: t.indexBeschreibung,
    path,
    fassungen: SPRACHEN.map(s => ({ sprache: s.code, path: mitSprache(s.code, '/ratgeber') })),
    content: `      <h1>${t.ratgeber}</h1>
      <ul class="list">
${items}
      </ul>`,
    jsonLd: { '@context': 'https://schema.org', '@type': 'CollectionPage', 'name': `Wartungsheft ${t.ratgeber}`, 'url': `${SITE_URL}${path}`, 'inLanguage': sprachTag(sprache) },
  })
}

export function sitemapWithArticles(sitemap: string, articles: Article[]): string {
  const entries = SPRACHEN.filter(s => articles.some(a => a.sprache === s.code)).flatMap(s => [
    `  <url>\n    <loc>${SITE_URL}${mitSprache(s.code, '/ratgeber')}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    ...newestFirst(articles.filter(a => a.sprache === s.code)).map(a =>
      `  <url>\n    <loc>${SITE_URL}${articlePath(s.code, a.slug)}</loc>\n    <lastmod>${a.date}</lastmod>\n    <priority>${s.code === 'de' ? '0.7' : '0.6'}</priority>\n  </url>`),
  ])
  return sitemap.replace('</urlset>', `${entries.join('\n')}\n</urlset>`)
}
