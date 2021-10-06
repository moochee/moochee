'use strict'

self.addEventListener('install', () => {
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
    const intercept = async () => {
        const cache = await caches.open('static-v2')
        const remoteResponse = fetchAndUpdateCacheIfOnline(event.request, cache)
        const cacheResponse = await cache.match(event.request)
        return cacheResponse || remoteResponse
    }

    // ignore any protocols other than http(s) (e.g. chrome-extension://, wss://) + range requests (e.g. audio, service worker does not support ranged queries)
    const url = new URL(event.request.url)
    const isRangeReq = event.request.headers.has('range')
    if (['http:', 'https:'].includes(url.protocol) && !isRangeReq) {
        event.respondWith(intercept())
    }
})

const fetchAndUpdateCacheIfOnline = async (request, cache) => {
    if (navigator.onLine) {
        try {
            const resp = await fetch(request)
            if (resp.status === 200 && resp.type === 'basic') {
                await cache.put(request, resp.clone())
            }
            return resp
        } catch (error) {
            console.error(`error on ${request.url}`)
            console.error(error)
        }
    }
}
