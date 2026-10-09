import type { Sprache } from '../lib/sprache'

/** Tutorial «So startest du mit Wartungsheft» auf der Hilfe (components/TutorialVideo.vue), Länge de 102 s, fr 95 s, it 79 s, en 94 s */
export interface TutorialTexte { titel: string, hinweis: string }

const de: TutorialTexte = {
  titel: 'So startest du mit Wartungsheft',
  hinweis: 'Gut anderthalb Minuten, mit Ton und Untertiteln, die du ausschalten kannst. Der Film startet erst auf Klick und zeigt die App mit erfundenen Beispieldaten.',
}

export default {
  de,
  fr: {
    titel: 'Premiers pas avec Wartungsheft',
    hinweis: 'Une minute et demie, avec le son et des sous-titres que vous pouvez désactiver. La vidéo démarre seulement au clic et montre l’application avec des données d’exemple fictives.',
  },
  it: {
    titel: 'Come iniziare con Wartungsheft',
    hinweis: 'Poco più di un minuto, con audio e sottotitoli che puoi disattivare. Il video parte solo al clic e mostra l’app con dati di esempio inventati.',
  },
  en: {
    titel: 'Getting started with Wartungsheft',
    hinweis: 'About a minute and a half, with sound and subtitles you can turn off. The video starts only when you click and shows the app with made-up sample data.',
  },
} satisfies Record<Sprache, TutorialTexte>
