'use strict'

import httpServer from './http-server.js'
import getAuthConfig from './auth-config.js'
import getFSDirectory from './fs-directory.js'

const authConfig = getAuthConfig()
const directory = getFSDirectory()
const server = httpServer(authConfig, directory)
const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Gorilla started at ${port}`))
