'use strict'

import pkg from 'uWebSockets.js'
const { App } = pkg
import { serveDir } from 'uwebsocket-serve'
// import quizSocketServer from './quiz-socket-server.js'
import QuizRepo from './quiz-repo.js'

const quizRepo = new QuizRepo()

// // uWebSockets.js is binary by default
// import { StringDecoder } from 'string_decoder'
// const decoder = new StringDecoder('utf8')

App()
    .ws('/*', {
        // message: (socket, message, isBinary) => {
        //     // parse JSON and perform the action
        //     //let json = JSON.parse(decoder.write(Buffer.from(message)))
        // }
    })
    .get('/*', serveDir('public'))
    .get('/api/v1/quizzes', async (res) => {
        res.onAborted(() => { res.aborted = true })
        let r = await quizRepo.getAll()
        if (!res.aborted) {
            res.end(JSON.stringify(r))
        }
    })
    .listen(process.env.PORT || 3000, (listenSocket) => {
        if (listenSocket) {
            console.log('Server started!')
        }
    })

//quizSocketServer().attach(server)