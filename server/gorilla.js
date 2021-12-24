'use strict'

import httpServer from './http-server.js'
import getAuthConfig from './auth-config.js'
import getFSDirectory from './fs-directory.js'
import Auth from './auth.js'
import Client from './cf-client.js'
// import { exec }  from 'child_process'

const username = process.env['CF_USER']
const password = process.env['CF_PW']
const client = new Client('https://api.cf.sap.hana.ondemand.com', username, password)

// const localClient = {
//     stop: () => {
//         exec(`kill ${process.pid}`)
//     }
// }
const directory = getFSDirectory()
const server = httpServer(client, new Auth(getAuthConfig()), directory, process.env.DEDICATED_ORIGIN)
const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Gorilla started at ${port}`))
