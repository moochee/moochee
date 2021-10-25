'use strict'

import createServer from './create-server.js'
import getAuthConfig from './auth-config.js'

const authConfig = getAuthConfig()
const server = createServer(authConfig)
const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Gorilla started at ${port}`))