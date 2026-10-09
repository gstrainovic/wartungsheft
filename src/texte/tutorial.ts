import type { Sprache } from '../lib/sprache'

/** Tutorial «So startest du mit Wartungsheft» auf der Hilfe (components/TutorialVideo.vue), Länge knapp zwei Minuten */
export interface TutorialTexte { titel: string, hinweis: string }

const de: TutorialTexte = {
  titel: 'Video-Anleitung',
  hinweis: 'Knapp zwei Minuten, mit Ton und Untertiteln. Gezeigt wird die App mit erfundenen Beispieldaten.',
}

export default {
  de,
  fr: {
    titel: 'Tutoriel vidéo',
    hinweis: 'Moins de deux minutes, avec son et sous-titres. On y voit l’app avec des données d’exemple inventées.',
  },
  it: {
    titel: 'Video tutorial',
    hinweis: 'Meno di due minuti, con audio e sottotitoli. Mostra l’app con dati di esempio inventati.',
  },
  en: {
    titel: 'Video guide',
    hinweis: 'Under two minutes, with sound and subtitles. It shows the app with made-up sample data.',
  },
} satisfies Record<Sprache, TutorialTexte>
