'use strict'

import httpServer from './http-server.js'

// REVISE maybe this could also be moved to the bindings
const gameExpiryTimer = {
    onTimeout: (callback) => setTimeout(callback, 1000 * 60 * 60 * 3)
}
const { appStopper, auth, privateQuizzesDir, dedicatedOrigin, port } = (await import(process.argv[2])).default
const server = httpServer(appStopper, auth, privateQuizzesDir, dedicatedOrigin, gameExpiryTimer)
server.listen(port, () => console.log(`Gorilla started at ${server.address().port}`))
