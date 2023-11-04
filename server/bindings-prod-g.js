import GoogleAuth from './google-auth.js'

const authConfig = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: `${process.env.APP_URL}/login/callback`,
    SESSION_SECRET: process.env.SESSION_SECRET
}

const auth = new GoogleAuth(authConfig)
const quizzesDir = process.env.QUIZZES_DIR
const appUrl = process.env.APP_URL
const port = process.env.PORT
const gameExpiryTimer = { onTimeout: (callback) => setTimeout(callback, 1000 * 60 * 60 * 3)}
const historyDir = process.env.HISTORY_DIR

export { auth, quizzesDir, appUrl, port, gameExpiryTimer, historyDir }
