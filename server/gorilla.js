'use strict'

import createServer from './create-server.js'
import getAuthConfig from './auth-config.js'
import getFSDirectory from './fs-directory.js'

const authConfig = getAuthConfig()
const directory = getFSDirectory()
const server = createServer(authConfig, directory)
const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Gorilla started at ${port}`))