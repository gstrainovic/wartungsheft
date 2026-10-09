import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
}, {
  // Französische Texte brauchen das geschützte Leerzeichen (U+00A0) vor : ; ? ! » und nach « (src/texte/franzoesisch.ts);
  // in Texten und Vorlagen ist es gewollt, im Code bleibt es verboten.
  rules: {
    'no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true }],
    'vue/no-irregular-whitespace': ['error', { skipStrings: true, skipTemplates: true, skipHTMLTextContents: true }],
  },
}, {
  // In Vue-Dateien prüft vue/no-irregular-whitespace (kennt Textinhalte), Ratgeber-Markdown ist reiner Text
  files: ['**/*.vue', '**/*.md'],
  rules: { 'no-irregular-whitespace': 'off' },
}, {
  files: ['**/*.md'],
  rules: { 'vue/no-irregular-whitespace': 'off' },
})
