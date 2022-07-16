'use strict'

import { exec } from 'child_process'

const FakeAuth = function () {
    this.setup = (app) => {
        app.use((req, res, next) => {
            req.isAuthenticated = () => true
            req.user = { id: 'john.doe@acme.org' }
            next()
        })
        return (req, res, next) => {
            next()
        }
    }
}

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
    auth: new FakeAuth(),
    appStopper: new LocalProcessStopper(),
    quizzesDir: 'quizzes',
    dedicatedOrigin: 'http://localhost:3000',
    port: 3000,
    historyDir: 'history'
}
