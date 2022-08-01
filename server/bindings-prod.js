'use strict'

import GoogleAuth from './google-auth.js'
import DokkuClient from './dokku-client.js'

const authConfig = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: `${process.env.DEDICATED_ORIGIN}/login/callback`,
    SESSION_SECRET: process.env.SESSION_SECRET
}

const appStopper = new DokkuClient()
const auth = new GoogleAuth(authConfig)
const quizzesDir = process.env.QUIZZES_DIR
const dedicatedOrigin = process.env.DEDICATED_ORIGIN
const port = process.env.PORT
const gameExpiryTimer = { onTimeout: (callback) => setTimeout(callback, 1000 * 60 * 60 * 3)}
const historyDir = process.env.HISTORY_DIR

export { appStopper, auth, quizzesDir, dedicatedOrigin, port, gameExpiryTimer, historyDir }
