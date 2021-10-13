'use strict'

import createServer from './create-server.js'

const server = createServer()
const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Gorilla started at ${port}`))