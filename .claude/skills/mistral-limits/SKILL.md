---
name: mistral-limits
description: >
  Mistral als AI-Provider: Modelle, OCR-Pipeline, Grenzen, Rate-Limits und Datenschutz für Vision, OCR und die API-Tiers. Use when ein Modell gewählt oder ai.ts geändert wird, oder wenn Bildzahl/Dateigrösse/DPI/Seitenlimits, Rate-Limits (RPS, Tokens/Min), Tier-Wahl (Experiment/Scale) oder Mistral-Datenschutz (Training-Opt-out) zu klären sind.
---

## Modelle und Aufrufe
- Mistral ist der einzige Provider (Vercel AI SDK v6, `@ai-sdk/mistral`); nur Mistral hat die OCR-Pipeline, und bei
  ~0.5 Cent pro Rechnungsscan lohnt sich eigenes GPU-Hosting nicht.
- Welches Modell an welchen Endpunkt gehört, sagt `GET /v1/models`: das Feld `capabilities` unterscheidet
  `completion_chat`, `audio_transcription`, `audio_transcription_realtime` und `audio_speech`. Produktnamen aus der
  Dokumentation sind keine Modell-IDs.
- Chat/Vision-Modell: `mistral-small-latest` (`DEFAULT_MODEL` in `ai.ts`). OCR: `mistral-ocr-latest` per direktem
  Fetch auf `/v1/ocr`.
- Alle Dokument-Parser laufen über die Zwei-Stufen-Pipeline OCR → Chat (`parseWithOcrPipeline`).
- Der Client kennt keinen Mistral-Key: alles läuft über den AI-Proxy (`getModel({ access, model? })`,
  `sendChatMessage(messages, opts)`), der Key steht als `MISTRAL_API_KEY` in `.env` des Proxys.

## Mistral Vision Limits (Chat-Modell: mistral-small-latest)
Quelle: docs.mistral.ai/capabilities/vision
- Max **8 Bilder** pro API-Request
- Max **10 MB** pro Bild, max **10.000×10.000 px**
- Formate: JPEG, PNG, WEBP, GIF (single-frame)
- Mistral Small: intern auf **1540×1540** skaliert → client-seitig auf 1540px resizen spart Bandbreite
- Tokens pro Bild: `(W × H) / 784` ≈ max 3.025 bei 1540×1540
- Client-Resize: `useImageResize.ts` → JPEG 80%, max 1540px longest side

## Mistral OCR Limits (OCR-Modell: mistral-ocr-latest)
Quelle: docs.mistral.ai/capabilities/OCR/basic_ocr/
- Max **50 MB** Dateigröße, max **1.000 Seiten** pro Request
- **Bilder**: PNG, JPEG/JPG, AVIF (per URL oder Base64)
- **Dokumente**: PDF, PPTX, DOCX (per URL, Base64 oder Cloud-Upload)
- Verarbeitung bei **200 DPI** (intern)
- Page-Selection möglich: einzelne Seite, Range, oder Liste (0-basiert)
- Tabellen: `table_format` = `null` | `markdown` | `html`
- Header/Footer-Extraktion optional (`extract_header`, `extract_footer`)
- **Kein** Character-Formatting (bold, italic, underline) — aber Fußnoten (Superscript)
- Pricing (Stand 2026-09-05, docs.mistral.ai/inference/pricing): $4 pro 1.000 Seiten (OCR 4.x); Mistral Small 4: $0.15/M Input, $0.60/M Output
- Rate-Limit: 2.000 Seiten/Minute (Scale-Tier)
- Azure/Foundry: max 30 MB, max 30 Seiten
- Zwei-Stufen-Pipeline (OCR → Chat) ist zuverlässiger als Document Annotation (Ein-Stufe halluziniert)

## Mistral API Tiers & Rate-Limits
- **Experiment (Free)**: 50K Tokens/Min, 4M Tokens/Monat, 1 RPS — verstecktes Vision-Rate-Limit
- **Scale (Paid)**: 2M Tokens/Min, 360 Req/Min — kein separates Vision-Limit
- Dashboard zeigt Scale-Limits auch im Experiment-Plan an (irreführend!)
- Spending-Limit ≠ Tier-Upgrade — man muss explizit auf Scale wechseln
- `maxRetries: 0` auf allen AI SDK Calls — verhindert SDK-interne Retries (default: 2) die Rate-Limit aufbrauchen

## Privacy / Datenschutz (Mistral)
- **Experiment (Free)**: Daten werden standardmäßig für Training verwendet. Opt-out möglich.
- **Scale (Paid)**: kein Training, reine Nutzungsabrechnung ohne Grundgebühr. Für Produktion nötig.
- Standort Frankreich (EU). Vertrag besteht direkt zwischen Nutzer und Mistral (eigener API-Key).
