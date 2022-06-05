'use strict'

import { exec } from 'child_process'
import FakeAuth from '../auths/fake.js'

const LocalProcessStopper = function () {
    this.stop = () => {
        return new Promise((resolve, reject) => {
            exec(`kill ${process.pid}`, (error) => {
                return error ? reject(error) : resolve()
            })
        })
    }
}

export default {
    auths: { google: new FakeAuth(), anonymous: new FakeAuth() },
    appStopper: new LocalProcessStopper(),
    privateQuizzesDir: 'quizzes',
    dedicatedOrigin: 'http://localhost:3000',
    port: 3000
}
