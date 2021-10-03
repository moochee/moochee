'use strict'

import passport from 'passport'
import session from 'express-session'
import { Issuer, Strategy } from 'openid-client'
import dotenv from 'dotenv'

export default function auth(app) {
    dotenv.config()

    passport.serializeUser(function (user, done) {
        done(null, user)
    })
    passport.deserializeUser(function (user, done) {
        done(null, user)
    })

    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    const idp = new Issuer({
        issuer: `${process.env.IDP}/oauth/token`,
        authorization_endpoint: `${process.env.IDP}/oauth/authorize`,
        token_endpoint: `${process.env.IDP}/oauth/token`,
        jwks_uri: `${process.env.IDP}/token_keys`
    })
    const client = new idp.Client({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uris: [process.env.REDIRECT_URI],
        token_endpoint_auth_method: 'client_secret_post' //xsuaa needs this
    })

    passport.use('oidc',
        new Strategy({ client }, (tokenSet, done) => {
            const claims = tokenSet.claims()
            return done(null, {
                id: claims.sub,
                name: claims.first_name + ' ' + claims.last_name,
                claims: claims
            })
        })
    )

    app.get('/login', passport.authenticate('oidc'))

    // TODO: provide a failure url
    app.get('/login/callback', passport.authenticate('oidc', {
        successRedirect: '/',
        failureRedirect: '/'
    }))

    return (req, res, next) => {
        if (!req.isAuthenticated() && req.originalUrl !== '/service-worker.js') {
            return res.redirect('/login')
        }
        next()
    }
}