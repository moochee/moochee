import AuthorizerAuth from './authorizer-auth.js'

const authConfig = {
    AUTHORIZER_URL: process.env.AUTHORIZER_URL,
    AUTHORIZER_REDIRECT_URL: process.env.DEDICATED_ORIGIN,
    AUTHORIZER_CLIENT_ID: process.env.AUTHORIZER_CLIENT_ID,
}

const auth = new AuthorizerAuth(authConfig)
const quizzesDir = process.env.QUIZZES_DIR
const dedicatedOrigin = process.env.DEDICATED_ORIGIN
const port = process.env.PORT
const gameExpiryTimer = { onTimeout: (callback) => setTimeout(callback, 1000 * 60 * 60 * 3)}
const historyDir = process.env.HISTORY_DIR

export { auth, quizzesDir, dedicatedOrigin, port, gameExpiryTimer, historyDir }
