---
name: mistral-limits
description: >
  Mistral im Wartungsheft: Modellwahl in ai.ts, OCR-Pipeline, AI-Proxy, Bildverkleinerung, Wiederholungen und Tarif. Use when ein Modell gewählt oder ai.ts geändert wird, oder wenn Bildzahl/Dateigrösse/Seitenlimits, Rate-Limits oder Tarif (Experiment/Scale) im Wartungsheft zu klären sind. Allgemeine Grenzen, Preise und Tarife stehen im globalen Skill mistral-api.
---

Grenzen für Vision und OCR, Preise, Tarife und Training-Opt-out: globaler Skill `mistral-api`. Hier nur, was das
Wartungsheft daraus macht.

## Modelle und Aufrufe

- Mistral ist der einzige Provider (Vercel AI SDK v6, `@ai-sdk/mistral`); nur Mistral hat die OCR-Pipeline, und bei
  rund einem halben Cent pro Rechnungsscan lohnt sich eigenes GPU-Hosting nicht.
- Chat/Vision-Modell: `mistral-small-latest` (`DEFAULT_MODEL` in `src/services/ai.ts`). OCR: `mistral-ocr-latest`
  per direktem Fetch auf `/v1/ocr`.
- Alle Dokument-Parser laufen über die Zwei-Stufen-Pipeline OCR → Chat (`parseWithOcrPipeline`).
- Der Client kennt keinen Mistral-Key: alles läuft über den AI-Proxy (`getModel({ access, model? })`,
  `sendChatMessage(messages, opts)`), der Key steht als `MISTRAL_API_KEY` in `.env` des Proxys.

## Grenzen im Code

- Bilder verkleinert `src/composables/useImageResize.ts` auf höchstens 1540 px (Grösse, ab der Mistral Small
  ohnehin intern skaliert), Graustufen-WebP mit 75 % Qualität.
- AI-SDK-Aufrufe in `ai.ts` und `chat.ts` setzen `maxRetries: 0`; Wiederholungen bei Ratenlimit macht nur
  `withRetry` in `ai.ts` mit Wartezeit.

## Tarif

- Produktion braucht den Scale-Tarif: kein verstecktes Vision-Limit und kein Training mit Kundendaten.
- Standort Frankreich (EU); der Vertrag mit Mistral läuft über den eigenen API-Key.
