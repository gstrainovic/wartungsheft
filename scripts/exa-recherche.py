#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///
"""
Recherche für einen Ratgeber per Exa: wenige Treffer, nur kurze Ausschnitte (highlights), damit die Datei klein bleibt
und ein Modell sie billig lesen kann. Schlüssel: ~/.config/exa/key.

    scripts/exa-recherche.py SLUG "Suchanfrage" ["weitere Suchanfrage" ...] [--n 5]

Schreibt content/recherche/SLUG.json (rohe Antwort) und content/recherche/SLUG.md (Titel, URL, Ausschnitte).
"""
import argparse
import json
import pathlib
import urllib.request

SCHLUESSEL = pathlib.Path.home() / ".config/exa/key"
ZIEL = pathlib.Path(__file__).resolve().parent.parent / "content/recherche"


def exa_suchen(anfrage: str, n: int) -> dict:
    body = {"query": anfrage, "numResults": n, "type": "auto",
            "contents": {"highlights": {"numSentences": 3, "highlightsPerUrl": 3}}}
    req = urllib.request.Request("https://api.exa.ai/search", data=json.dumps(body).encode(), headers={
        "x-api-key": SCHLUESSEL.read_text().strip(), "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def als_markdown(antworten: dict[str, dict]) -> str:
    zeilen = []
    for anfrage, antwort in antworten.items():
        zeilen.append(f"# {anfrage}\n")
        for t in antwort.get("results", []):
            zeilen.append(f"## {t.get('title') or '(ohne Titel)'}\n{t['url']}\n")
            zeilen += [f"> {h.strip()}\n" for h in t.get("highlights", [])]
    return "\n".join(zeilen)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("slug")
    p.add_argument("anfragen", nargs="+")
    p.add_argument("--n", type=int, default=5)
    a = p.parse_args()
    antworten = {q: exa_suchen(q, a.n) for q in a.anfragen}
    ZIEL.mkdir(parents=True, exist_ok=True)
    (ZIEL / f"{a.slug}.json").write_text(json.dumps(antworten, indent=1, ensure_ascii=False))
    md = als_markdown(antworten)
    (ZIEL / f"{a.slug}.md").write_text(md)
    kosten = sum(x.get("costDollars", {}).get("total", 0) for x in antworten.values())
    print(f"{ZIEL / a.slug}.md: {len(md.split())} Wörter, Exa-Kosten ${kosten:.4f}")


if __name__ == "__main__":
    main()
