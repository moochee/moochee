import http from 'http'
import express from 'express'
import quizSocketServer from './quiz-socket-server.js'
import quizRouter from './quiz-router.js'
import historyRouter from './history-router.js'
import qr from 'qr-image'

export default async function create(auth, quizService, appUrl, gameExpiryTimer, historyService) {
    const app = express()

    app.get('/api/v1/status', (req, res) => {
        res.status(200).json({numberOfGames: games.getNumberOfGames()}).end()
    })

    const login = await auth.setup(app)

    app.use('/web', express.static('web'))
    app.use('/node_modules/htm/preact/standalone.mjs', express.static('node_modules/htm/preact/standalone.mjs'))
    app.use('/node_modules/canvas-confetti/dist/confetti.module.mjs', express.static('node_modules/canvas-confetti/dist/confetti.module.mjs'))
    app.get('/qr-code', (req, res) => res.set('Content-Type', 'image/svg+xml').send(qr.imageSync(req.query.url, { type: 'svg' })))
    app.use('/', login, express.static('web/host'))

    app.use('/api/v1/quizzes', express.json(), quizRouter(quizService.dir))
    app.use('/api/v1/history', express.json(), historyRouter(historyService))
    app.post('/api/v1/games', express.json(), async (req, res) => {
        const game = await games.host(req.body.quizId, req.user?.id)
        const url = `${appUrl}/${game.id}`
        res.status(201).set('Location', url).end()
    })

    const httpServer = http.createServer(app)
    const games = quizSocketServer(httpServer, quizService, gameExpiryTimer, historyService).games

    return httpServer
}
