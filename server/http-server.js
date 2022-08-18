import http from 'http'
import express from 'express'
import quizSocketServer from './quiz-socket-server.js'
import quizRouter from './quiz-router.js'
import historyRouter from './history-router.js'
import qr from 'qr-image'

export default function create(client, auth, quizService, dedicatedOrigin, gameExpiryTimer, historyService) {
    const app = express()

    app.get('/api/v1/status', (req, res) => {
        res.send('ok')
    })

    app.post('/api/v1/stop', (req, res) => {
        res.status(202).end()
        games.onNoRunningGames(() => client.stop())
    })

    const login = auth.setup(app)

    app.use('/web/public', express.static('web/public'))
    app.use('/web/play', express.static('web/play'))
    app.use('/play', express.static('web/play'))
    app.use('/node_modules/htm/preact/standalone.mjs', express.static('node_modules/htm/preact/standalone.mjs'))
    app.get('/qr-code', (req, res) => res.send(qr.imageSync(req.query.url, { type: 'svg' })))
    app.use(express.json())
    app.use('/api/v1/quizzes', quizRouter(quizService.dir))

    app.use('/', login)

    app.post('/api/v1/games', async (req, res) => {
        const game = await games.host(req.body.quizId, req.user?.id)
        const url = `${dedicatedOrigin}/${game.id}`
        res.status(201).set('Location', url).end()
    })

    app.use('/api/v1/history', historyRouter(historyService))

    app.use('/web/host', express.static('web/host'))
    app.use('/', express.static('web/host'))

    const httpServer = http.createServer(app)
    const socketServer = quizSocketServer(httpServer, quizService, gameExpiryTimer, historyService)
    const games = socketServer.games
    
    // REVISE maybe the sigterm handling should be outside, it will likely also eliminate the issue with the listeners piling up during tests
    const onSigterm = () => httpServer.close()
    httpServer.on('close', () => process.removeListener('SIGTERM', onSigterm))
    process.on('SIGTERM', onSigterm)
    // REVISE check why in some tests we will see multiple handlers, ideally maxListeners should be 1, not higher
    // console.log(process.rawListeners('SIGTERM'))
    process.setMaxListeners(8)

    return httpServer
}
