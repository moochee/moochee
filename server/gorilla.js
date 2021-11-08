'use strict'

import httpServer from './http-server.js'
import getAuthConfig from './auth-config.js'
import getFSDirectory from './fs-directory.js'
import Auth from './auth.js'

const directory = getFSDirectory()
const server = httpServer(new Auth(getAuthConfig()), directory, process.env.DEDICATED_BASE_URL)
const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Gorilla started at ${port}`))
