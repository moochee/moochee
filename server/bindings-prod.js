import AuthorizerAuth from './authorizer-auth.js'

const authConfig = {
    SESSION_SECRET: process.env.SESSION_SECRET,
    AUTHORIZER_CLIENT_ID: process.env.AUTHORIZER_CLIENT_ID,
    AUTHORIZER_CLIENT_SECRET: process.env.AUTHORIZER_CLIENT_SECRET,
    AUTHORIZER_REDIRECT_URI: process.env.APP_URL,
}

const auth = new AuthorizerAuth(authConfig)
const quizzesDir = process.env.QUIZZES_DIR
const appUrl = process.env.APP_URL
const port = process.env.PORT
const gameExpiryTimer = { onTimeout: (callback) => setTimeout(callback, 1000 * 60 * 60 * 3)}
const historyDir = process.env.HISTORY_DIR

export { auth, quizzesDir, appUrl, port, gameExpiryTimer, historyDir }
