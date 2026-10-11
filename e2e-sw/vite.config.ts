import process from 'node:process'
import { mergeConfig } from 'vite'
import basis from '../vite.config.ts'

// Produktions-Build mit Kennung im Kopf von index.html, damit zwei Builds als zwei Deploys unterscheidbar sind
export default mergeConfig(basis, {
  plugins: [{
    name: 'sw-test-stand',
    transformIndexHtml: (html: string) => html.replace('</head>', `<meta name="sw-test-stand" content="${process.env.SW_TEST_STAND}"></head>`),
  }],
})
