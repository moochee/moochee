import httpServer from './http-server.js'

const { appStopper, auth, privateQuizzesDir, dedicatedOrigin, port, gameExpiryTimer }
    = (await import(process.argv[2]))
const server = httpServer(appStopper, auth, privateQuizzesDir, dedicatedOrigin, gameExpiryTimer)
server.listen(port, () => console.log(`Gorilla started at ${server.address().port}`))
