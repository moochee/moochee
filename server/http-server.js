'use strict'

import http from 'http'
import express from 'express'
import quizSocketServer from './quiz-socket-server.js'
import quizRouter from './quiz-router.js'
import TryoutAuth from './tryout-auth.js'

export default function create(client, auth, quizService, dedicatedOrigin, gameExpiryTimer, historyService) {
    const app = express()

    app.get('/api/v1/status', (req, res) => {
        res.send('ok')
    })

    app.post('/api/v1/stop', (req, res) => {
        res.status(202).end()
        games.onNoRunningGames(() => client.stop())
    })

    process.on('SIGTERM', () => {
        console.log('sigterm received')
        httpServer.close()
    })

    const login = auth.setup(app)

    app.use('/public', express.static('web/public'))
    app.use('/play', express.static('web/play'))
    app.use('/lib/htm/preact/standalone.module.js', express.static('./node_modules/htm/preact/standalone.module.js'))

    app.use('/tryout', express.static('web/host'))

    app.use(express.json())
    const tryoutAuth = (new TryoutAuth()).setup()
    app.use('/api/v1/quizzes', tryoutAuth, quizRouter(quizService.dir))

    app.post('/api/v1/games', tryoutAuth, async (req, res) => {
        const game = await games.host(req.body.quizId, req.user?.id)
        const url = `${dedicatedOrigin}/${game.id}`
        res.status(201).set('Location', url).end()
    })

    app.use('/', login)
    app.use('/', express.static('web/host'))

    const httpServer = http.createServer(app)
    const socketServer = quizSocketServer(httpServer, quizService, gameExpiryTimer, historyService)
    const games = socketServer.games

    httpServer.games = games
    httpServer.close = () => socketServer.close()

    return httpServer
}
