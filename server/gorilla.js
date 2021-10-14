'use strict'

import createServer from './create-server.js'
import config from './auth-config.js'

const server = createServer(config)
const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Gorilla started at ${port}`))