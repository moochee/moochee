'use strict'

import passport from 'passport'
import session from 'express-session'

export default function auth(app) {
    passport.serializeUser(function (user, done) {
        done(null, user)
    })
    passport.deserializeUser(function (user, done) {
        done(null, user)
    })

    app.use(session({
        secret: 'super secret string',
        resave: false,
        saveUninitialized: false
    }))

    app.use(passport.initialize())
    app.use(passport.session())
}