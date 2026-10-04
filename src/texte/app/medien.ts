import type { Sprache } from '../../lib/sprache'

// Vollbild-Ansicht von Rechnungsbild, PDF und OCR-Text (components/MediaViewer.vue)
const de = {
  bild: 'Bild',
  pdf: 'PDF',
  ocr: 'OCR-Text',
  optimiert: 'Bilder werden automatisch optimiert: auf 1540 px verkleinert, gedreht und als WebP gespeichert.',
}

export default {
  de,
  fr: {
    bild: 'Image',
    pdf: 'PDF',
    ocr: 'Texte OCR',
    optimiert: 'Les images sont optimisées automatiquement : réduites à 1540 px, pivotées et enregistrées en WebP.',
  },
  it: {
    bild: 'Immagine',
    pdf: 'PDF',
    ocr: 'Testo OCR',
    optimiert: 'Le immagini vengono ottimizzate automaticamente: ridotte a 1540 px, ruotate e salvate in WebP.',
  },
  en: {
    bild: 'Image',
    pdf: 'PDF',
    ocr: 'OCR text',
    optimiert: 'Images are optimised automatically: scaled down to 1540 px, rotated and saved as WebP.',
  },
} satisfies Record<Sprache, typeof de>
