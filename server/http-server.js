import http from 'http'
import express from 'express'
import quizSocketServer from './quiz-socket-server.js'
import quizRouter from './quiz-router.js'
import historyRouter from './history-router.js'
import qr from 'qr-image'
import Stripe from 'stripe'

export default function create(auth, quizService, dedicatedOrigin, gameExpiryTimer, historyService, stripeConfig) {
    const app = express()

    app.get('/api/v1/status', (req, res) => {
        res.status(200).json({numberOfGames: games.getNumberOfGames()}).end()
    })

    app.post('/api/v1/webhook', express.raw({type: 'application/json'}), (req, res) => {
        const stripe = new Stripe(stripeConfig.API_KEY)
        const payload = req.body
        const signature = req.headers['stripe-signature']
        const webhookSecret = stripeConfig.WEBHOOK_SECRET
        let event
        try {
            event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
        } catch (err) {
            console.error(`Error message: ${err.message}`)
            return res.status(400).send(`Webhook Error: ${err.message}`)
        }
        if (event.type === 'checkout.session.completed') {
            //const session = event.data.object
            //TODO: mark the email as premium customer
        }
        res.status(200).end()
    })

    const login = auth.setup(app)

    app.use('/web/public', express.static('web/public'))
    app.use('/web/play', express.static('web/play'))
    app.use('/play', express.static('web/play'))
    app.use('/node_modules/htm/preact/standalone.mjs', express.static('node_modules/htm/preact/standalone.mjs'))
    app.get('/qr-code', (req, res) => res.send(qr.imageSync(req.query.url, { type: 'svg' })))

    app.use('/', login)

    app.use(express.json())
    app.use('/api/v1/quizzes', quizRouter(quizService.dir))
    app.use('/api/v1/history', historyRouter(historyService))
    app.post('/api/v1/games', async (req, res) => {
        const game = await games.host(req.body.quizId, req.user?.id)
        const url = `${dedicatedOrigin}/${game.id}`
        res.status(201).set('Location', url).end()
    })

    app.use('/web/host', express.static('web/host'))
    app.use('/', express.static('web/host'))

    const httpServer = http.createServer(app)
    const socketServer = quizSocketServer(httpServer, quizService, gameExpiryTimer, historyService)
    const games = socketServer.games

    return httpServer
}
