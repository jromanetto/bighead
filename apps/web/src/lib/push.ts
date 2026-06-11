import { getBrowserClient } from '#/lib/supabase/client'

/**
 * Web push (PWA) : abonnement au rappel quotidien. Tout est client-only —
 * chaque fonction garde contre l'absence des APIs (SSR, Safari ancien,
 * permission refusée). La clé publique VAPID vient de l'env build-time.
 */
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as
  | string
  | undefined

export type PushStatus =
  | 'unsupported'
  | 'denied'
  | 'subscribed'
  | 'unsubscribed'

/** Décode une clé VAPID base64url en bytes pour `pushManager.subscribe`. */
export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(normalized)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

/** Whether this browser can do web push at all (and a key is configured). */
export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    !!VAPID_PUBLIC_KEY
  )
}

/** Current status, without prompting the user for anything. */
export async function getPushStatus(): Promise<PushStatus> {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  return subscription ? 'subscribed' : 'unsubscribed'
}

/**
 * Prompts for permission, subscribes the browser, and stores the subscription
 * server-side (RLS: own rows). Returns the resulting status.
 */
export async function subscribeToPush(lang: 'fr' | 'en'): Promise<PushStatus> {
  if (!pushSupported() || !VAPID_PUBLIC_KEY) return 'unsupported'

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return 'denied'

  const registration = await navigator.serviceWorker.ready
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        VAPID_PUBLIC_KEY,
      ) as BufferSource,
    }))

  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error('incomplete push subscription')
  }

  const supabase = getBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('not authenticated')

  const { error } = await supabase.from('web_push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      lang,
    },
    { onConflict: 'endpoint' },
  )
  if (error) throw error

  return 'subscribed'
}

/** Unsubscribes the browser and removes the row server-side. */
export async function unsubscribeFromPush(): Promise<PushStatus> {
  if (!pushSupported()) return 'unsupported'
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return 'unsubscribed'

  const endpoint = subscription.endpoint
  await subscription.unsubscribe()

  const supabase = getBrowserClient()
  await supabase.from('web_push_subscriptions').delete().eq('endpoint', endpoint)

  return 'unsubscribed'
}
