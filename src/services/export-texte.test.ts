import { afterEach, describe, expect, it, vi } from 'vitest'
import { setAppSprache } from '../lib/app-sprache'
import { deleteWholeAccount } from './account-delete'
import { importDatabase } from './db-export'

vi.mock('../lib/instantdb', () => ({ db: {}, tx: {} }))
vi.mock('./ai-access', () => ({ deleteAccount: vi.fn() }))

describe('meldungen von Datensicherung und Kontolöschung', () => {
  afterEach(() => {
    setAppSprache('de')
    vi.unstubAllGlobals()
  })

  it('meldet ein ungültiges Export-Format in der App-Sprache', async () => {
    await expect(importDatabase('{}')).rejects.toThrow('Ungültiges Export-Format')
    setAppSprache('it')
    await expect(importDatabase('{}')).rejects.toThrow('Formato di esportazione non valido')
  })

  it('verlangt offline eine Verbindung, in der App-Sprache', async () => {
    vi.stubGlobal('navigator', { onLine: false })
    await expect(deleteWholeAccount()).rejects.toThrow('Offline: Zum Löschen des Kontos braucht es eine Verbindung.')
    setAppSprache('fr')
    await expect(deleteWholeAccount()).rejects.toThrow('Hors ligne\u00A0: pour supprimer le compte, il faut une connexion.')
  })
})
