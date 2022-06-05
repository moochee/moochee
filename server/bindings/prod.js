'use strict'

import GoogleAuth from '../auths/google.js'
import FakeAuth from '../auths/fake.js'
import CFClient from './cf-client.js'

const dedicatedOrigin = process.env.DEDICATED_ORIGIN
const authConfig = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: `${dedicatedOrigin}/login/callback`,
    SESSION_SECRET: process.env.SESSION_SECRET
}

const quizzesDir = process.env.QUIZZES_DIR
console

export default {
    auths: { anonymous: new FakeAuth(), google: new GoogleAuth(authConfig) },
    appStopper: new CFClient(null),
    privateQuizzesDir: quizzesDir,
    dedicatedOrigin: dedicatedOrigin,
    port: process.env.PORT
}