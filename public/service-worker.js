'use strict'

self.addEventListener('install', () => {
    self.skipWaiting()
    self.importScripts('./lib/babel.min.js')
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
    // TODO check if service worker even considers foreign origins, e.g. if we load stuff from unpkg, and if so, if we want to also consider these (I think yes)
    const url = new URL(event.request.url)
    const isSocketReq = (url.pathname.indexOf('socket.io') > -1) && (url.pathname.indexOf('socket.io.min.js') === -1)
    const isRangeReq = event.request.headers.has('range')
    if (['http:', 'https:'].includes(url.protocol) && !isSocketReq && !isRangeReq) {
        event.respondWith(intercept())
    }
})

// REVISE Add source mapping for debugging - or should we just leave it? The compiled js is maybe suitable for debugging since it doesn't do minification etc
const jsxToJsResponse = async (jsxResp) => {
    const text = await jsxResp.text()
    // eslint-disable-next-line no-undef
    const compiledCode = Babel.transform(text, { presets: ['react'] }).code
    const headers = new Headers(jsxResp.headers)
    headers.set('Content-Type', 'application/javascript; charset=UTF-8')
    return new Response(compiledCode, { status: 200, statusText: 'OK', headers })
}

const fetchAndUpdateCacheIfOnline = async (request, cache) => {
    if (navigator.onLine) {
        try {
            let resp = await fetch(request)
            const isJsx = (resp.headers.get('content-type').indexOf('text/jsx') > -1)
            resp = isJsx ? await jsxToJsResponse(resp) : resp
            // TODO update cache only if status = 2XX
            await cache.put(request, resp.clone())
            return resp
        } catch (error) {
            console.error(`error on ${request.url}`)
            console.error(error)
        }
    }
}
