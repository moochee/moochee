const FakeAuth = function () {
    this.setup = (app) => {
        app.use((req, res, next) => {
            req.isAuthenticated = () => true
            req.user = { id: 'john.doe@acme.org' }
            next()
        })
        return (req, res, next) => {
            next()
        }
    }
}

const auth = new FakeAuth()
const quizzesDir = 'quizzes'
const dedicatedOrigin = 'http://localhost:3000'
const port = 3000
const gameExpiryTimer = { onTimeout: (callback) => setTimeout(callback, 1000 * 60 * 60 * 3)}
const historyDir = 'history'

const stripeConfig = {
    API_KEY: 'sk_test_51MN3vWJmwGA69B9A9nQkInPGAHYYUCR3au5DXs1IPsPW2QsuU1do5RnsPVRAVZA8dsdMX6DXhiAYzyg1iQ2CxuVK00251VO2IN',
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
}

export { auth, quizzesDir, dedicatedOrigin, port, gameExpiryTimer, historyDir, stripeConfig }
