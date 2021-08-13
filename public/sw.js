self.addEventListener('install', (event) => {
    self.importScripts('./lib/babel.min.js')
})

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim())
    console.log('activated')
})

self.addEventListener('fetch', (event) => {
    console.log(event.request)
    // REVISE below if is of course prototypical - I think we should consider
    //        use the serviceworker scope on registration, e.g. only consider /components
    //        filter for file suffix - everything else than .jsx just gets plain-fetched
    if (event.request.url.indexOf('main.js') > -1) {
        console.log('compile & serve')
        event.respondWith(fetch(event.request).then(res => res.text()).then(text => {
            const compiledCode = Babel.transform(text, { presets: ['react'] }).code
            return new Response(compiledCode, {
                status: 200,
                statusText: 'OK',
                headers: {'Content-Type': 'application/javascript'}
            })
        }))
    } else {
        console.log('just serve')
        event.respondWith(fetch(event.request))
    }
})
