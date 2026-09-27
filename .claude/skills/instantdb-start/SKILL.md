---
name: instantdb-start
description: >
  InstantDB starten/stoppen/Status lokal, Konfiguration, Integrationstests, Entwickeln ohne Docker (Dev-Instanz per SSH-Tunnel) — plus Betrieb, Produktion und Auth der self-hosted InstantDB. Use when der lokale Server verwaltet wird, auf einem PC ohne Podman entwickelt wird oder Infomaniak/Produktion, PostgreSQL-Debug, Google-Login, Magic-Code-Auth (Resend), Anmelde-Einstieg oder InstantDB-Eigenheiten (UUIDs, Offline) gebraucht werden.
---

Verwalte den lokalen InstantDB Server.

## Starten
```bash
cd ~/instant/server && podman-compose -f docker-compose-dev.yml up -d
```

## Stoppen
```bash
cd ~/instant/server && podman-compose -f docker-compose-dev.yml down
```

## Status prüfen
```bash
podman ps | grep -E "postgres|server"
```

## PostgreSQL Debug-Zugriff
```bash
podman exec server_postgres_1 psql -U instant -d instant -c "SELECT * FROM apps;"
```

## Ports
- HTTP API: `localhost:8888` (via Vite-Proxy: `/instant-api`)
- WebSocket: `ws://localhost:8888/runtime/session`

## Konfiguration (lokal)
- App-ID: `cd7e6912-773b-4ee1-be18-4d95c3b20e9f` (`LOCAL_APP_ID`)
- HTTP API: via Vite-Proxy `/instant-api → localhost:8888`
- WebSocket: `ws://localhost:8888/runtime/session`
- Server-Config: `~/instant/server/resources/config/override.edn`
- DevTools deaktiviert (`devtool: false`), der Toggle-Button blockiert UI-Klicks auch in Tests

## Troubleshooting
- Container nicht gefunden: `podman-compose` statt `docker-compose` auf Fedora

## Integrationstests (Repo ai-proxy)
- `src/stores/instant.test.ts` und `src/auth/instant.test.ts` laufen gegen den lokalen InstantDB-Server und werden
  übersprungen, wenn er nicht läuft. Test-Token: `db.auth.createToken(email)` (Admin-SDK 0.22).

## Entwickeln ohne Docker: Dev-InstantDB auf Infomaniak per SSH-Tunnel

Alles im Repo spricht InstantDB nur über `localhost:8888` an (`instant-config.ts`, Vite-Proxy `/instant-api`, `scripts/dev.sh`,
Playwright, die Offline-Fixture). Darum reicht auf einem PC ohne Docker oder Podman ein SSH-Tunnel zu einer Dev-Instanz;
am Code ändert sich nichts.

- **Instanz** `wartungsheft-dev` im selben OpenStack-Projekt wie die Produktion (PCP-CTPZLR8, dc3-a, Flavor
  `a2-ram4-disk50-perf1`, Debian 13, Docker CE), Zugriff `ssh debian@195.15.207.253` mit dem Key `claude-laptop`.
  Security Group `default`: nur 22, 80 und 443 offen; der Stack bindet 8888 ausschliesslich auf `127.0.0.1`.
- **Stack** in `/opt/instant`: `docker-compose.dev.yml` (Postgres 17, MinIO, `ghcr.io/instantdb/server:latest` mit 2-GB-Heap,
  gleiche Images wie Produktion, ohne Caddy und Dashboard), Passwörter in `/opt/instant/.env`, AEAD-Schlüssel des
  Servers im Volume `instant_server_config` (`override.edn`, derselbe wie im lokalen Dev-Checkout, damit der Dump lesbar bleibt).
- **Daten**: Dump der lokalen Dev-Datenbank, also dieselbe App `cd7e6912-773b-4ee1-be18-4d95c3b20e9f`
  (`LOCAL_APP_ID`) mit demselben Admin-Token wie in `.env`. Die E2E-Tests leeren die App vor jedem Test, Daten dort sind Wegwerfdaten.
- **Ablauf auf dem anderen PC** (braucht Node, Git, Playwright-Browser, den SSH-Key und `.env` aus der Mail an sich selbst):

  ```bash
  ssh -N -L 8888:localhost:8888 debian@195.15.207.253 &   # Tunnel, läuft im Hintergrund
  npm run dev          # dev.sh sieht «InstantDB already running», startet nur Vite und AI-Proxy
  npm run test:e2e     # Playwright übernimmt den laufenden Port 8888 (reuseExistingServer)
  ```

  Kein Podman, kein `~/instant`-Checkout nötig. Offline-Tests funktionieren, sie blockieren `localhost:8888` im Browser.
- **Stack bedienen** (auf der Instanz, in `/opt/instant`): `docker compose -f docker-compose.dev.yml --env-file .env ps|logs|restart server`.
  Nach `up -d` dauert es rund eine Minute, bis 8888 antwortet; `curl localhost:8888/health/system` muss `{"wal":"ok"}` liefern.
- **Kosten**: läuft sie, kostet sie wie die Produktion (rund 13 CHF im Monat mit IPv4). Wird sie länger nicht gebraucht:
  `openstack --os-cloud PCP-CTPZLR8-dc3-a server shelve wartungsheft-dev` (kein CPU/RAM/Disk mehr, nur Snapshot und IPv4,
  IP bleibt), zurück mit `server unshelve`, danach `up -d` läuft dank `restart: unless-stopped` von selbst.
  Der Kostenwächter `~/.local/bin/wartungsheft-cost-watch` rechnet geshelvte Instanzen ohne Compute, Limit 30 CHF.
- **Neu aufsetzen**: Dump der lokalen Dev-DB (`podman exec server_postgres_1 pg_dump -U instant -Fc instant > dev.dump`)
  nach `/opt/instant`, dann `pg_restore -U instant -d instant --no-owner < dev.dump` in den laufenden Postgres,
  `truncate attr_sketches, wal_aggregator_status, wal_logs` (abgeleitete Daten, sonst stirbt der Serverstart an
  Duplikaten, siehe README «Backup») und `delete from config where k = 'wal-errors'` (der Dump trägt sonst den
  WAL-Fehler eines längst toten Prozesses mit, `/health/system` bleibt dann auf `{"wal":"error"}`), dann `up -d`.
- **Nicht**: die Produktionsinstanz für Entwicklung mitnutzen. 4 GB RAM sind mit dem 2-GB-Heap der Produktion belegt,
  und ein zweiter Stack auf derselben Maschine gefährdet die Kundendaten.

### Produktion (Infomaniak Public Cloud, wartungsheft.ch)
- Anleitung: `README.md` → "Produktion". Instanz `wartungsheft` (OpenStack-Projekt PCP-CTPZLR8, Region dc3-a,
  Debian 13, 2 vCPU/4 GB), Zugriff `ssh debian@195.15.207.47` mit dem lokalen Key, OpenStack-CLI über
  `~/.config/openstack/clouds.yaml` (Application Credential). Der Infomaniak-Token in `~/.config/infomaniak/token` hat keine DNS-Rechte
  (`dns:read`/`domain` fehlen); DNS-Einträge im Infomaniak-Manager unter Domain → DNS-Zone setzen.
- InstantDB-Stack in `/opt/instant` (offizieller VPS-Guide + `docker-compose.override.yml`: 2-GB-Heap, Neustart,
  MinIO von quay.io, Caddy importiert `/opt/auto-service/deploy/Caddyfile` und bedient `/opt/auto-service/deploy/dist`).
  AI-Proxy in `/opt/auto-service/deploy` im Netz `instant_default`. Produktions-App-ID steht in `.env.production`.
- Frontend-URIs kommen aus `VITE_INSTANT_*` (Modus selfhosted, `.env.production`), nicht aus dem Quellcode.
- Perms: `instant-cli push perms` scheitert gegen die eigene Instanz mit «Record not found: instant-user»
  (CLI 1.0.67 gegen Server-Image `latest`); Perms deshalb als JSON im Dashboard einfügen
  (`node -e "import('./instant.perms.ts').then(m=>console.log(JSON.stringify(m.default,null,2)))"`).
- Kosten: Infomaniak Public Cloud hat keine Budget-Alarme oder Ausgabenstopps, nur Ressourcen-Quotas (Level 1: 10 Instanzen,
  20 vCPU, 64 GB, 1 TB Volumes). Deshalb ruft der tägliche Claude-Lauf auf dem Laptop (`~/projects/find-jobs/AGENTS.md`,
  «Tagescheck Wartungsheft») das Skript `~/.local/bin/wartungsheft-cost-watch` auf (`--force` sendet immer): schätzt die
  Monatskosten aus Instanzen, IPv4 und Snapshots und mailt über Resend bei > 25 CHF, bei unbekannten Flavors, Volumes oder
  Floating IPs und ab 1.12.2026 wegen Guthabenende. Kein systemd-Timer: Goran will Claude als Akteur, nicht Skripte im Hintergrund.
  Ein zweites, nur lesendes Application Credential für einen Server-Cron ist nicht möglich: Keystone verweigert das Anlegen
  von Application Credentials mit einem Application Credential.
- Backup: täglich 03:00 `/opt/backup/backup.sh` (pg_dump + MinIO-Tar nach `/opt/backups`, 14 Tage; Kopie per TempURL
  in den Swift-Container `wartungsheft-backups`, 30 Tage, Laptop-Zugriff über Cloud `PCP-CTPZLR8-backup`). Snapshot
  vor riskanten Änderungen: `openstack --os-cloud PCP-CTPZLR8-dc3-a server image create --name <name> wartungsheft`.
- Admin-SDK `@instantdb/admin` ist auf **0.22.121** gepinnt (gleiche Version wie `@instantdb/core` und der
  lokale Server-Checkout vom Feb 2026). npm-latest ist 1.x → nur zusammen mit Server + Core upgraden.
  Produktion läuft mit Server-Image `ghcr.io/instantdb/server:latest`; der 0.22-Client funktioniert dagegen.

### Google-Login (Redirect-Flow von InstantDB)
- Login-Seite: Link «Mit Google anmelden» aus `db.auth.createAuthorizationURL({ clientName: 'google-web', redirectURL })`
  (`useAuth().googleAuthUrl()`), führt auf `https://api.wartungsheft.ch/runtime/oauth/start`, das Backend legt die Session an
  und leitet auf `/dashboard`. Gleiche E-Mail wie beim Magic Code ergibt denselben Nutzer.
- Google Cloud: Projekt `auto-service` (`gen-lang-client-0650867108`), OAuth-Client
  «Wartungsheft Web» (Typ Webanwendung, JavaScript-Quelle `https://wartungsheft.ch`, Redirect-URI
  `https://api.wartungsheft.ch/runtime/oauth/callback`), Zustimmungsbildschirm «Wartungsheft», Zielgruppe Extern,
  Status **In Produktion** (nur Scopes email/openid, darum keine Google-Prüfung nötig). Konsole: console.cloud.google.com/auth.
- Instant-Dashboard → Auth: Client `google-web` (Web, eigene Credentials), Redirect Origin `wartungsheft.ch`.
  Client-Secret liegt nur bei Google und in InstantDB, nicht im Repo.
- E2E `google-login.spec.ts` prüft nur den Link auf `/runtime/oauth/start` (Google selbst wird nicht durchlaufen).
- Apple («Sign in with Apple», 99 USD/Jahr Apple Developer Program) und GitHub bewusst nicht eingebaut.

### Anmelde-Einstieg (kein getrenntes Registrieren)
- Magic Code und Google legen das Konto beim ersten Anmelden an; `/login` ist eine Seite für neue und bestehende Konten.
- Nach jeder Anmeldung merkt sich der Browser die E-Mail (`auth:knownEmail`, `src/lib/known-account.ts`), auch nach
  dem Abmelden. `useAuthEntry` entscheidet für Kopf, Startseite und Hypothesen-Seiten: eingeloggt «Zur Übersicht»,
  bekanntes Konto nur «Anmelden» (E-Mail vorausgefüllt), sonst Link «Anmelden» plus «30 Tage gratis testen».
  Nur der Klick in die Testzeit zählt in `events`. «Andere E-Mail» auf `/login` vergisst die Adresse.
- Lokaler Modus: `auth:localSignedOut = '1'` im localStorage spielt den abgemeldeten Zustand, «Abmelden» setzt es,
  der Magic Code nimmt jeden Code an. E2E `auth-entry.spec.ts` und `landing-pages.spec.ts` starten so abgemeldet.

### Auth (Magic Codes via Resend)
- Kontaktadresse des Produkts ist `info@wartungsheft.ch` (Infomaniak-Postfach, Impressum, Datenschutz, Einstellungen,
  Antwortadresse der Erinnerungen); Claude liest und schreibt dort mit `~/.local/bin/mailbox wartungsheft …`.
- Produktion sendet über **Resend** (Region eu-west-1, Absender `login@wartungsheft.ch`); `RESEND_TOKEN` steht in
  `/opt/instant/.env`, NICHT in auto-service/.env. Lokal ohne Token: Codes stehen im Server-Log
  (`docker compose … logs server | grep postmark/send-disabled`, der Log-Name stammt aus dem Postmark-Erbe).
- Self-hosted InstantDB kennt nur Postmark, SendGrid oder Resend, kein SMTP (geprüft in `server/src/instant/config.clj`).
- DKIM-Einträge unter `_domainkey.wartungsheft.ch` liefert Infomaniak nur aus, wenn sie im Manager als Typ «DKIM» angelegt
  sind; per API (Typ TXT) angenommene Einträge bleiben stumm. CNAMEs (`rsend`, `send`) gehen per API. MX und SPF der
  Hauptdomain bleiben bei Infomaniak, Resend-Empfang ist aus. `mail.wartungsheft.ch` ist bei Resend als Reserve verifiziert.
- Free Tier: 100 Mails/Monat (reicht für Entwicklung + Solo-Nutzung)
- Magic Code: 6-stellig, 24h TTL, Einmal-Verwendung
- Frontend-SDK: `db.auth.sendMagicCode()`, `db.auth.signInWithMagicCode()`, `db.useAuth()`
- Erweiterbar: Google/Apple/GitHub OAuth eingebaut, Passkeys via Custom Auth

### InstantDB-Eigenheiten
- **Entity-IDs müssen UUIDs sein** — keine beliebigen Strings (z.B. SHA-256 Hashes); `id()` verwenden, Hashes als
  eigenes Feld speichern. OCR-Cache: `tx.ocrcache[id()].update({ hash, markdown, ... })` statt `tx.ocrcache[hash].update(...)`
- **Schemaless** — keine Schema-Definition nötig, Felder werden dynamisch erstellt
- **Echtzeit-Sync** — Änderungen werden sofort an alle Clients gepusht
- **Offline-First** — Daten in IndexedDB, Lesen+Schreiben funktionieren offline, Sync via CRDT bei Reconnect
