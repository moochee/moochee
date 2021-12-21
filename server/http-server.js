'use strict'

import http from 'http'
import express from 'express'
import quizSocketServer from './quiz-socket-server.js'
import quizRouter from './quiz-router.js'
import QuizService from './quiz-service.js'

export default function create(auth, directory, dedicatedOrigin) {
    const app = express()

    app.get('/api/v1/status', (req, res) => {
        res.send('ok')
    })

    app.post('/api/v1/stop', (req, res) => {
        // TODO shut down only when all games finished
        // TODO check if this doesn't cause trouble on CF, e.g. CF should not try to re-start on exit code 0
        console.log('received shutdown signal')
        res.status(202).end()
        httpServer.close()
    })

    app.get('/', (req, res, next) => {
        if (req.hostname === new URL(dedicatedOrigin).hostname) {
            next()
        } else {
            res.status(302).set('location', dedicatedOrigin).end()
        }
    })

    const login = auth.setup(app)

    app.use('/public', express.static('web/public'))
    app.use('/play', express.static('web/play'))

    // TODO to be deleted later
    app.get('/api/v1/runningGames', (_, res) => {
        res.set('Content-Type', 'text/plain')
            .status(200)
            .send(String(games.getNumberOfRunningGames()))
    })

    app.use(express.json())
    app.use('/api/v1/quizzes', quizRouter(directory))

    app.use('/', login)

    app.post('/api/v1/games', login, async (req, res) => {
        const game = await games.host(req.body.quizId)
        const url = `${dedicatedOrigin}/${game.id}`
        res.status(201).set('Location', url).end()
    })

    app.use('/', express.static('web/host'))

    const httpServer = http.createServer(app)
    const quizService = new QuizService(directory)
    const games = quizSocketServer(httpServer, quizService).games

    return httpServer
}
