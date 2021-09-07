'use strict'

import uWS from 'uWebSockets.js'
import { serveDir } from 'uwebsocket-serve'
import quizSocketServer from './quiz-socket-server.js'

const app = uWS.App()
app.get('/*', serveDir('public'))
app.ws('/*', quizSocketServer(app))

const port = process.env.PORT || 3000
app.listen(port, (listenSocket) => {
    if (listenSocket) {
        console.log(`Server started at ${port}!`)
    }
})