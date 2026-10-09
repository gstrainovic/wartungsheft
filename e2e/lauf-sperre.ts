/**
 * Sperre gegen parallele E2E-Läufe. Alle Läufe auf einem Rechner teilen die lokale InstantDB und die Testperson
 * `e2e-test-user`: `clearInstantDB` eines zweiten Laufs löscht die Seeds des ersten, und endet der Lauf, dessen
 * Server ein anderer per `reuseExistingServer` mitnutzt, fehlen diesem Vite oder Proxy (ERR_CONNECTION_REFUSED).
 * `playwright.config.ts` ruft `laufSperren` beim Laden auf: Ein zweiter Lauf wartet, bis der erste fertig ist, statt
 * zufällig an fremden Daten zu scheitern. Worker laden die Konfiguration ebenfalls; ihr Elternprozess hält die Sperre.
 */
import { closeSync, openSync, readFileSync, unlinkSync, writeSync } from 'node:fs'
import process from 'node:process'

export interface SperrOptionen {
  datei: string
  pid?: number
  ppid?: number
  /** Läuft der Prozess noch? */
  lebt?: (pid: number) => boolean
  /** Höchste Wartezeit, danach Abbruch mit Meldung */
  warteMs?: number
  schlafen?: (ms: number) => void
  jetzt?: () => number
  melden?: (text: string) => void
}

const PAUSE_MS = 2000

function prozessLebt(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  }
  catch (e) {
    return (e as NodeJS.ErrnoException).code === 'EPERM'
  }
}

function schlafenSync(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function inhaber(datei: string): number | undefined {
  try {
    const pid = Number.parseInt(readFileSync(datei, 'utf8'), 10)
    return Number.isNaN(pid) ? undefined : pid
  }
  catch {
    return undefined
  }
}

/** Sperre nehmen (wartet synchron, solange ein anderer Lauf lebt). Gibt true zurück, wenn dieser Prozess sie neu hält. */
export function laufSperren(opt: SperrOptionen): boolean {
  const {
    datei,
    pid = process.pid,
    ppid = process.ppid,
    lebt = prozessLebt,
    warteMs = 45 * 60_000,
    schlafen = schlafenSync,
    jetzt = Date.now,
    melden = (text: string) => console.warn(text),
  } = opt
  const start = jetzt()
  let gemeldet = false
  for (;;) {
    try {
      const fd = openSync(datei, 'wx')
      writeSync(fd, String(pid))
      closeSync(fd)
      return true
    }
    catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST')
        throw e
    }
    const anderer = inhaber(datei)
    if (anderer === pid || anderer === ppid)
      return false
    if (anderer === undefined || !lebt(anderer)) {
      try {
        unlinkSync(datei)
      }
      catch {}
      continue
    }
    if (jetzt() - start >= warteMs)
      throw new Error(`Anderer E2E-Lauf (PID ${anderer}) hält ${datei} seit über ${Math.round(warteMs / 60_000)} Minuten, Abbruch`)
    if (!gemeldet) {
      melden(`Warte auf E2E-Lauf PID ${anderer} (gemeinsame Testdatenbank, Sperre ${datei})`)
      gemeldet = true
    }
    schlafen(PAUSE_MS)
  }
}

/** Sperre lösen, aber nur, wenn sie diesem Prozess gehört */
export function laufFreigeben(datei: string, pid = process.pid) {
  if (inhaber(datei) !== pid)
    return
  try {
    unlinkSync(datei)
  }
  catch {}
}
