'use strict'

self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
    const intercept = async () => {
        const cache = await caches.open('static-v1')
        const remoteResponse = fetchAndUpdateCacheIfOnline(event.request, cache)
        const cacheResponse = await cache.match(event.request)
        return cacheResponse || remoteResponse
    }

    // filter funny stuff like chrome-extension:// extensions etc.
    const url = new URL(event.request.url)
    const isSocketReq = (url.pathname.indexOf('socket.io') > -1) && (url.pathname.indexOf('socket.io.min.js') === -1)
    const isRangeReq = event.request.headers.has('range')
    if (['http:', 'https:'].includes(url.protocol) && !isSocketReq && !isRangeReq) {
        event.respondWith(intercept())
    }
})

const fetchAndUpdateCacheIfOnline = async (request, cache) => {
    if (navigator.onLine) {
        try {
            const resp = await fetch(request)
            if (resp.status === 200) {
                await cache.put(request, resp.clone())
            }
            return resp
        } catch (error) {
            console.error(`error on ${request.url}`)
            console.error(error)
        }
    }
}
