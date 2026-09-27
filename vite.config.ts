import type { Plugin } from 'vite'
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { KNOWN_ACCOUNT_KEY } from './src/lib/known-account.ts'
import { applyMetaToHtml, OEFFENTLICHE_SEITEN } from './src/lib/page-meta.ts'
import { hidePrerendered } from './src/lib/prerender.ts'
import { parseArticle, renderArticlePage, renderIndexPage, sitemapWithArticles } from './src/lib/ratgeber.ts'
import { mitSprache, PRAEFIXE, SPRACHEN } from './src/lib/sprache.ts'

// Vorgerenderter Inhalt (scripts/prerender.ts) bleibt bis zum Mount versteckt, wenn er nicht zur Adresse passt;
// main.ts nimmt die Klasse nach dem Mount weg. Die Regel steht einmal in src/lib/prerender.ts.
const PRERENDER_BOOT = `    <style>.prerender-hidden #app { visibility: hidden; }</style>
    <script>(function () { try {
      var m = document.querySelector('meta[name="prerendered-path"]'); var k = false;
      try { k = !!localStorage.getItem('${KNOWN_ACCOUNT_KEY}') } catch (e) {}
      if ((${hidePrerendered.toString()})(m && m.content, location.pathname, k)) document.documentElement.classList.add('prerender-hidden')
    } catch (e) {} })()</script>`

// Kopf der Startseite in index.html, dazu dist/<pfad>/index.html pro öffentlicher Seite, damit Crawler ohne
// JavaScript den richtigen Titel sehen; Caddy liefert sie über `try_files {path}/index.html` aus.
function pageMetaPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'page-meta',
    configResolved(config) {
      outDir = config.build.outDir
    },
    transformIndexHtml: html => applyMetaToHtml(html, '/').replace('</head>', `${PRERENDER_BOOT}\n  </head>`),
    closeBundle() {
      const index = readFileSync(join(outDir, 'index.html'), 'utf8')
      for (const path of OEFFENTLICHE_SEITEN.filter(p => p !== '/')) {
        mkdirSync(join(outDir, path), { recursive: true })
        writeFileSync(join(outDir, path, 'index.html'), applyMetaToHtml(index, path))
      }
    },
  }
}

// Ratgeber: content/ratgeber/*.md (Deutsch) und content/ratgeber/<fr|it|en>/*.md als fertiges HTML nach
// dist/ratgeber/ bzw. dist/<fr|it|en>/ratgeber/, dazu Einträge in der Sitemap (src/lib/ratgeber.ts)
function ratgeberPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'ratgeber',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const dir = 'content/ratgeber'
      const articles = SPRACHEN.flatMap(({ code }) => {
        const src = code === 'de' ? dir : join(dir, code)
        return readdirSync(src).filter(f => f.endsWith('.md')).map(f => parseArticle(f.replace(/\.md$/, ''), readFileSync(join(src, f), 'utf8'), code))
      })
      for (const article of articles) {
        const target = join(outDir, mitSprache(article.sprache, `/ratgeber/${article.slug}`))
        const fassungen = articles.filter(a => a.slug === article.slug).map(a => a.sprache)
        mkdirSync(target, { recursive: true })
        writeFileSync(join(target, 'index.html'), renderArticlePage(article, fassungen))
      }
      for (const { code } of SPRACHEN) {
        mkdirSync(join(outDir, mitSprache(code, '/ratgeber')), { recursive: true })
        writeFileSync(join(outDir, mitSprache(code, '/ratgeber'), 'index.html'), renderIndexPage(articles, code))
      }
      const sitemap = join(outDir, 'sitemap.xml')
      writeFileSync(sitemap, sitemapWithArticles(readFileSync(sitemap, 'utf8'), articles))
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    pageMetaPlugin(),
    ratgeberPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'Wartungsheft',
        short_name: 'Wartungsheft',
        description: 'Werkstattrechnung fotografieren, Service und MFK im Blick',
        theme_color: '#059669',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // Ratgeber sind eigene HTML-Seiten, nicht die App: der Service Worker darf sie nicht durch index.html ersetzen
        navigateFallbackDenylist: [new RegExp(`^(/(${PRAEFIXE.join('|')}))?/ratgeber(/|$)`)],
      },
    }),
  ],
  server: {
    // Fester Port (5173 kollidiert mit anderen Vite-Projekten); strictPort statt stillem Ausweichen auf den nächsten Port
    port: 6060,
    strictPort: true,
    proxy: {
      // Proxy für InstantDB Self-Hosted Server (HTTP + WebSocket)
      '/instant-api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/instant-api/, ''),
        ws: true,
      },
    },
  },
})
