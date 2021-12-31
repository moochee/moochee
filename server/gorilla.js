'use strict'

import httpServer from './http-server.js'
import getAuthConfig from './auth-config.js'
import getFSDirectory from './fs-directory.js'
import Auth from './auth.js'

// REVISE check if with newer Node.js version we can use top-level await
const init = async () => {
    const client = await import(process.argv[2])
    const directory = getFSDirectory()
    const server = httpServer(client.default(), new Auth(getAuthConfig()), directory, process.env.DEDICATED_ORIGIN)
    const port = process.env.PORT || 3000
    server.listen(port, () => console.log(`Gorilla started at ${port}`))
}

init()
