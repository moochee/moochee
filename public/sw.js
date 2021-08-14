self.addEventListener('install', () => {
    self.importScripts('./lib/babel.min.js')
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
    const intercept = async () => {
        const cache = await caches.open('static-v1')
        const cacheResponse = await cache.match(event.request)
        return cacheResponse || fetchAndUpdateCacheIfOnline(event.request, cache).catch(console.error)
    }

    // filter funny stuff like Chrome extensions etc.
    // TODO check if service worker even considers foreign origins, e.g. if we load stuff from unpkg, and if so, if we want to also consider these (I think yes)
    // TODO check that we don't intercept API requests, hopefully it's fine since we're using web sockets, but since service worker seems to also intercept other protocols like chrome://, we better double-check...
    if (['http:', 'https:'].includes(new URL(event.request.url).protocol)) {
        event.respondWith(intercept())
    }
})

const jsxToJs = async (resp) => {
    const text = await resp.text()
    // eslint-disable-next-line no-undef
    const compiledCode = Babel.transform(text, { presets: ['react'] }).code
    const headers = new Headers(resp.headers)
    headers.set('Content-Type', 'application/javascript; charset=UTF-8')
    return new Response(compiledCode, { status: 200, statusText: 'OK', headers })
}

const fetchAndUpdateCacheIfOnline = async (request, cache) => {
    if (navigator.onLine) {
        let resp = await fetch(request)
        resp = (resp.headers.get('content-type').indexOf('text/jsx') > -1) ? await jsxToJs(resp) : resp
        // TODO update cache only if status = 2XX
        await cache.put(request, resp.clone())
        return resp
    }
}
