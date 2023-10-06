import GoogleAuth from './google-auth.js'

const authConfig = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: `${process.env.DEDICATED_ORIGIN}/login/callback`,
    SESSION_SECRET: process.env.SESSION_SECRET
}

const auth = new GoogleAuth(authConfig)
const quizzesDir = process.env.QUIZZES_DIR
const dedicatedOrigin = process.env.DEDICATED_ORIGIN
const port = process.env.PORT
const gameExpiryTimer = { onTimeout: (callback) => setTimeout(callback, 1000 * 60 * 60 * 3)}
const historyDir = process.env.HISTORY_DIR

const stripeConfig = {
    API_KEY: process.env.STRIPE_API_KEY,
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
}

export { auth, quizzesDir, dedicatedOrigin, port, gameExpiryTimer, historyDir, stripeConfig }
