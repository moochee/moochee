'use strict'

import http from 'http'
import express from 'express'
import quizSocketServer from './quiz-socket-server.js'
import quizRouter from './quiz-router.js'
import QuizService from './quiz-service.js'

export default function create(client, auths, directory, dedicatedOrigin, gameExpiryTimer) {
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

    app.get('/', (req, res, next) => {
        if (req.hostname === new URL(dedicatedOrigin).hostname) {
            next()
        } else {
            res.status(302).set('location', `${dedicatedOrigin}${req.url}`).end()
        }
    })

    const anonymousLogin = auths.anonymous.setup(app)
    const googleLogin = auths.google.setup(app)

    app.use('/public', express.static('web/public'))
    app.use('/play', express.static('web/play'))
    app.use('/lib/htm/preact/standalone.module.js', express.static('./node_modules/htm/preact/standalone.module.js'))

    app.use(express.json())
    app.use('/api/v1/quizzes', quizRouter(directory))

    app.use('/tryout', anonymousLogin, express.static('web/host'))
    app.use('/', googleLogin)

    app.post('/api/v1/games', async (req, res) => {
        const game = await games.host(req.body.quizId)
        const url = `${dedicatedOrigin}/${game.id}`
        res.status(201).set('Location', url).end()
    })

    app.use('/', express.static('web/host'))

    const httpServer = http.createServer(app)
    const quizService = new QuizService(directory)
    const games = quizSocketServer(httpServer, quizService, gameExpiryTimer).games

    return httpServer
}
