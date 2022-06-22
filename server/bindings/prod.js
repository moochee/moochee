'use strict'

import GoogleAuth from '../google-auth.js'

const dedicatedOrigin = process.env.DEDICATED_ORIGIN
const authConfig = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: 'https://app.moochee.us/login/callback',
    SESSION_SECRET: process.env.SESSION_SECRET
}

const FakeAppStopper = function () {
    this.stop = () => {
        console.log('App stopper to be implemented!')
    }
}

const quizzesDir = process.env.QUIZZES_DIR

export default {
    auth: new GoogleAuth(authConfig),
    appStopper: new FakeAppStopper(),
    privateQuizzesDir: quizzesDir,
    dedicatedOrigin: dedicatedOrigin,
    port: process.env.PORT
}