import { backendApi } from '@/services/backendApi'

export interface DevicePushResult {
  enabled: boolean
  message: string
}

export async function enableDevicePush(token: string): Promise<DevicePushResult> {
  const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (!isSecure) {
    return {
      enabled: false,
      message: 'iPhone 通知需要 HTTPS。绑定域名并开启 HTTPS 后，再把小岛添加到主屏幕即可开启。',
    }
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return {
      enabled: false,
      message: 'iPhone 需要 iOS 16.4+，并从主屏幕打开小岛 App 后才能开启通知',
    }
  }

  const config = await backendApi.getPushPublicKey(token)
  if (!config.enabled || !config.publicKey) {
    return {
      enabled: false,
      message: '服务器还没配置推送密钥，先保留应用内提醒',
    }
  }

  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission()

  if (permission !== 'granted') {
    return {
      enabled: false,
      message: '你还没有允许浏览器通知',
    }
  }

  const registration = await navigator.serviceWorker.register('/love-island-sw.js')
  const existingSubscription = await registration.pushManager.getSubscription()
  const subscription = existingSubscription ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(config.publicKey),
  })
  const payload = subscription.toJSON()

  if (!payload.endpoint || !payload.keys?.p256dh || !payload.keys.auth) {
    return {
      enabled: false,
      message: '浏览器没有返回完整通知凭证',
    }
  }

  await backendApi.upsertPushSubscription(token, {
    endpoint: payload.endpoint,
    keys: {
      p256dh: payload.keys.p256dh,
      auth: payload.keys.auth,
    },
    userAgent: navigator.userAgent,
  })

  return {
    enabled: true,
    message: '这台设备已经能接收小岛提醒',
  }
}

export async function disableDevicePush(token: string): Promise<DevicePushResult> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return {
      enabled: false,
      message: '当前浏览器没有本机通知订阅',
    }
  }

  const registrations = await navigator.serviceWorker.getRegistrations()
  const registration = registrations.find((item) => item.active?.scriptURL.endsWith('/love-island-sw.js')) ?? registrations[0]
  const subscription = await registration?.pushManager.getSubscription()

  if (!subscription) {
    return {
      enabled: false,
      message: '这台设备没有开启小岛通知',
    }
  }

  await backendApi.deletePushSubscription(token, subscription.endpoint)
  await subscription.unsubscribe()

  return {
    enabled: false,
    message: '这台设备的小岛通知已关闭',
  }
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = `${value}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const output = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index)
  }

  return output
}
