import {
  ClientsConfig,
  LRUCache,
  method,
  Service,
  ServiceContext,
  Cached
} from '@vtex/api'

const TIMEOUT_MS = 800

const memoryCache = new LRUCache<string, Cached>({ max: 5000 })

metrics.trackCache('status', memoryCache)

// This is the configuration for clients available in `ctx.clients`.
const clients: ClientsConfig = {
  // We pass our custom implementation of the clients bag, containing the Status client.
  options: {
    // All IO Clients will be initialized with these options, unless otherwise specified.
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
    // This key will be merged with the default options and add this cache to our Status client.
    firebaseWorker: {
      memoryCache,
    },
  },
}

async function worker(ctx: ServiceContext, next: () => Promise<unknown>) {
  ctx.status = 200
  console.log("Test here")
  ctx.set('content-type', 'application/javascript; charset=utf-8')
  ctx.set('cache-control', 'public, max-age=7200')
  // const arrayImports = [
  //   `importScripts('https://www.gstatic.com/firebasejs/9.4.0/firebase-app-compat.js');`,
  //   `importScripts('https://www.gstatic.com/firebasejs/9.4.0/firebase-messaging-compat.js');`,
  //   `importScripts('https://retargeting.app/push/firebase.js');`]
  //ctx.body = arrayImports.join(' ')
  ctx.body = `importScripts('https://www.gstatic.com/firebasejs/9.4.0/firebase-app-compat.js');
              importScripts('https://www.gstatic.com/firebasejs/9.4.0/firebase-messaging-compat.js');
              importScripts('https://retargeting.app/push/firebase.js')`

  await next()
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  routes: {
    firebaseWorker: method({
      GET: [worker],
    })
  },
})
