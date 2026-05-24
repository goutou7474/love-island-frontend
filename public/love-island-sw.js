self.addEventListener('push', (event) => {
  let payload = {
    title: '小岛提醒',
    body: '有新的悄悄消息在等你打开',
    url: '/',
  }

  try {
    payload = {
      ...payload,
      ...event.data?.json(),
    }
  } catch {
    payload.body = event.data?.text() || payload.body
  }

  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: '/island-icon.svg',
    badge: '/island-icon.svg',
    data: {
      url: payload.url || '/',
    },
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    })

    for (const client of windowClients) {
      if ('focus' in client) {
        await client.focus()
        if ('navigate' in client) {
          await client.navigate(targetUrl)
        }
        return
      }
    }

    await self.clients.openWindow(targetUrl)
  })())
})
