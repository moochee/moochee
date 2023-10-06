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

    app.use('/web', express.static('web'))
    app.use('/node_modules/htm/preact/standalone.mjs', express.static('node_modules/htm/preact/standalone.mjs'))
    app.get('/qr-code', (req, res) => res.set('Content-Type', 'image/svg+xml').send(qr.imageSync(req.query.url, { type: 'svg' })))
    app.use('/', login, express.static('web/host'))

    app.use('/api/v1/quizzes', express.json(), quizRouter(quizService.dir))
    app.use('/api/v1/history', express.json(), historyRouter(historyService))
    app.post('/api/v1/games', express.json(), async (req, res) => {
        const game = await games.host(req.body.quizId, req.user?.id)
        const url = `${dedicatedOrigin}/${game.id}`
        res.status(201).set('Location', url).end()
    })

    const httpServer = http.createServer(app)
    const games = quizSocketServer(httpServer, quizService, gameExpiryTimer, historyService).games

    return httpServer
}
