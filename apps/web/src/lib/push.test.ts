import { describe, expect, it } from 'vitest'

import { urlBase64ToUint8Array } from './push'

describe('urlBase64ToUint8Array', () => {
  it('decodes a base64url VAPID-style key into bytes', () => {
    // 'hello' en base64url
    const bytes = urlBase64ToUint8Array('aGVsbG8')
    expect(Array.from(bytes)).toEqual([104, 101, 108, 108, 111])
  })

  it('handles url-safe characters (- and _) and missing padding', () => {
    // 0xfb 0xef 0xbe encodé base64url → '----' n'est pas valide ; on prend
    // une vraie séquence avec - et _ : [251, 255] → '-_8'
    const bytes = urlBase64ToUint8Array('-_8')
    expect(Array.from(bytes)).toEqual([251, 255])
  })

  it('round-trips a realistic 65-byte uncompressed P-256 public key', () => {
    const raw = new Uint8Array(65).map((_, i) => i)
    let bin = ''
    for (const b of raw) bin += String.fromCharCode(b)
    const b64url = btoa(bin)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
    expect(Array.from(urlBase64ToUint8Array(b64url))).toEqual(Array.from(raw))
  })
})
