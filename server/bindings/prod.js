'use strict'

import GoogleAuth from '../google-auth.js'
import DokkuClient from '../dokku-client.js'

const dedicatedOrigin = process.env.DEDICATED_ORIGIN
const authConfig = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: 'https://app.moochee.us/login/callback',
    SESSION_SECRET: process.env.SESSION_SECRET
}

const quizzesDir = process.env.QUIZZES_DIR

export default {
    auth: new GoogleAuth(authConfig),
    appStopper: new DokkuClient(),
    privateQuizzesDir: quizzesDir,
    dedicatedOrigin: dedicatedOrigin,
    port: process.env.PORT
}