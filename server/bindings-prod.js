'use strict'

import GoogleAuth from './google-auth.js'
import DokkuClient from './dokku-client.js'

const authConfig = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: `${process.env.DEDICATED_ORIGIN}/login/callback`,
    SESSION_SECRET: process.env.SESSION_SECRET
}

export default {
    auth: new GoogleAuth(authConfig),
    appStopper: new DokkuClient(),
    privateQuizzesDir: process.env.QUIZZES_DIR,
    dedicatedOrigin: process.env.DEDICATED_ORIGIN,
    port: process.env.PORT,
    historyDir: process.env.HISTORY_DIR
}
