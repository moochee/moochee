'use strict'

import httpServer from './http-server.js'

// REVISE check if with newer Node.js version we can use top-level await
const init = async () => {
    // REVISE maybe this could also be moved to the bindings
    const gameExpiryTimer = {
        onTimeout: (callback) => setTimeout(callback, 1000 * 60 * 60 * 3)
    }
    const { appStopper, auth, privateQuizzesDir, dedicatedOrigin, port } = (await import(process.argv[2])).default
    const server = httpServer(appStopper, auth, privateQuizzesDir, dedicatedOrigin, gameExpiryTimer)
    server.listen(port, () => console.log(`Gorilla started at ${port}`))
}

init()
