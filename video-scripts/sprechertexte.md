# Sprechertexte FR, IT, EN

Inhalt und Bogen wie die deutschen Drehbücher (`privat-video-script.md`, `betrieb-video-script.md`), natürlich
übersetzt, nicht Wort für Wort. Massgebend für den Film ist die Fassung in `scripts/werbefilm.ts`
(`PRIVAT_TEXT`, `BETRIEB_TEXT`); diese Datei hält fest, warum die Sätze so lauten. Regie in eckigen Klammern wie bei
Andres (`[warm]`, `[excited]`, `[enthusiastic]`, `[curious]`, `[sighs]`, `[delighted]`), sie wird nicht gesprochen.

Regeln für alle drei Sprachen:

- Anrede wie die App (Skill `texte-und-sprachen`): FR «tu», IT «tu», EN neutral mit britischer Schreibweise. Die
  öffentlichen Seiten siezen auf Französisch, der Film folgt der App, weil er die App zeigt.
- Schweizer Varianten: «francs», «franchi», nicht EUR; Betrag als Zahl, der Sprecher liest ihn aus.
- Webadresse gesprochen «wartungsheft point c h», «punto ci acca», «dot c h», im Untertitel `wartungsheft.ch`.
  Valentino liest «punto c h» als «ca»; Nathan verschluckt «Essaie» zu «et c'est», darum der Abspann ohne Imperativ.
- Französisch: geschütztes Leerzeichen vor `? ! :` (`franz()` im Skript), damit kein Satzzeichen allein auf eine
  Zeile rutscht. Keine Guillemets im Untertitel, das Leerzeichen dahinter würde den Satz teilen.
- Keine Zeitangaben, keine Zahlen, die nicht in `plans.ts` oder `trial.ts` stehen.
- Begriffe aus der App: Serviceheft = «carnet d'entretien», «libretto di manutenzione», «service book»;
  Übersicht = «aperçu», «panoramica», «overview»; Werkstatt = «garage», «officina», «garage».

## Privat

| Nr. | Bild | FR | IT | EN |
|---|---|---|---|---|
| 1 | Käufer fragt | Tu veux vendre ta voiture. L'acheteur demande : il y a un carnet d'entretien ? | Vuoi vendere la tua auto. L'acquirente chiede: «C'è il libretto di manutenzione?» | You want to sell your car. The buyer asks: “Is there a service book?” |
| 2 | Schachtel | Et tu cherches. | E tu cerchi. | And you start searching. |
| 3 | Rechnung fotografieren | À partir d'aujourd'hui, c'est fini : une photo de la facture suffit ! Garage, date, montant et travaux, tout est rempli ! | Da oggi non più: basta una foto della fattura! Officina, data, importo e lavori sono già compilati! | Not any more: a photo of the invoice is all it takes! Garage, date, amount and work, all filled in! |
| 4 | Fälligkeit | Wartungsheft te prévient avant la prochaine échéance ! | Wartungsheft ti avvisa prima della prossima scadenza! | Wartungsheft reminds you before the next job is due! |
| 5 | Kosten, PDF | Et au moment de vendre, tout est sur la table : le carnet d'entretien complet en PDF ! | E quando vendi, è tutto sul tavolo: il libretto di manutenzione completo in PDF! | And when you sell, everything's on the table: the complete service book as a PDF! |
| 6 | Käufer mit Antwort | Tout est là ! | «C'è tutto!» | “It's all here!” |
| 7 | Abspann | 25 francs par an. 30 jours d'essai gratuit, sur wartungsheft.ch ! | 25 franchi all'anno. Prova gratis per 30 giorni, su wartungsheft.ch! | 25 francs a year. Try it free for 30 days, at wartungsheft.ch! |

Gezeichnete Szenen (`szenen/privat-kaeufer.html`, `privat-problem.html`, Parameter `?sprache=`): Sprechblase
«Il y a un carnet d'entretien ?», «C'è il libretto di manutenzione?», «Is there a service book?»; Antwort «Tout est
là.», «C'è tutto.», «It's all here.».

## Betrieb

Die freigegebenen Hörproben aus dem Skill `werbefilm`, ohne Anrede, auf die Szenen verteilt. Der erste Satz steigt
ruhig ein (`[warm]`, «ein ganz normaler Montagmorgen»), die Begeisterung beginnt erst mit der Übersicht:

| Nr. | Bild | FR | IT | EN |
|---|---|---|---|---|
| 1 | Lieferwagen ohne Status | Un lundi matin comme les autres dans l'entreprise. Quelle camionnette doit passer au service ? | Un lunedì mattina come tanti in azienda. Quale furgone deve andare in officina? | Just another Monday morning at the company. Which van is due for a service? |
| 2 | Übersicht | Un coup d'œil sur l'aperçu, et tout est clair : ce qui est à faire, pour chaque véhicule ! | Uno sguardo alla panoramica, ed è tutto chiaro: cosa è in scadenza, per ogni veicolo! | One look at the overview, and it's all clear: what's coming up, for every vehicle! |
| 3 | Rechnung vom Fahrer | Le chauffeur photographie la facture du garage. Et elle est déjà saisie ! | L'autista fotografa la fattura dell'officina. Ed è già registrata! | The driver snaps a photo of the garage invoice. And it's already recorded! |
| 4 | Kosten pro Fahrzeug | En fin d'année : les coûts par véhicule, en fichier pour la comptabilité. | A fine anno: i costi per veicolo, in un file per la contabilità. | At year end: costs per vehicle, as a file for the accountant. |
| 5 | Lieferwagen mit Status | Et la question du lundi matin ? Elle se règle toute seule ! | E la domanda del lunedì mattina? Si risolve da sola! | And Monday's question? It answers itself! |
| 6 | Abspann | 36 francs par véhicule et par an. 30 jours d'essai gratuit ! | 36 franchi per veicolo all'anno. 30 giorni di prova gratuita! | 36 francs per vehicle per year. Try it free for 30 days! |

## Von einem Muttersprachler zu prüfen

- Alle: Nathan und Valentino sprechen «Wartungsheft» wie «Vartung-Chef»; ob das als Markenname durchgeht.
- FR: «Et tu cherches.» und «tout est rempli» (Privat); Westschweizer Ohr für «camionnette» und «aperçu».
- IT: «basta una foto della fattura», «Si risolve da sola» (Tessiner Sprachgebrauch).
- EN: «Not any more» als Einstieg von Szene 3, «snaps a photo» neben dem App-Wort «photograph».
