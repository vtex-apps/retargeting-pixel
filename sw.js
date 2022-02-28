
<script type="module">
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-messaging.js";
import { onBackgroundMessage } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-messaging-sw.js";

onBackgroundMessage(messaging, ({ notification, data }) => {
  const { title, body, image } = notification ?? {}

  if (!title) {
    return
  }

  self.registration.showNotification(title, {
    body,
    icon: image,
    data
  })
})


self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (!event.notification.data.pathname) return
  const pathname = event.notification.data.pathname
  const url = new URL(pathname, self.location.origin).href

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientsArr) => {
        const hadWindowToFocus = clientsArr.some((windowClient) =>
          windowClient.url === url ? (windowClient.focus(), true) : false
        )

        if (!hadWindowToFocus)
          self.clients
            .openWindow(url)
            .then((windowClient) =>
              windowClient ? windowClient.focus() : null
            )
      })
  )
})


const messaging = getMessaging(app)
deleteToken(messaging)

</script>
