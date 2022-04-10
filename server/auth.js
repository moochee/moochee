'use strict'

import passport from 'passport'
import session from 'express-session'
import { Issuer, Strategy } from 'openid-client'

export default function Auth(config) {
    this.setup = (app) => {
        const OPENID_CONNECT = 'oidc'

        passport.serializeUser(function (user, done) {
            done(null, user)
        })
        passport.deserializeUser(function (user, done) {
            done(null, user)
        })

        app.use(session({
            secret: config.SESSION_SECRET,
            resave: false,
            saveUninitialized: false
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        const idp = new Issuer({
            issuer: `${config.IDP}/oauth/token`,
            authorization_endpoint: `${config.IDP}/oauth/authorize`,
            token_endpoint: `${config.IDP}/oauth/token`,
            jwks_uri: `${config.IDP}/token_keys`
        })
        const client = new idp.Client({
            client_id: config.CLIENT_ID,
            client_secret: config.CLIENT_SECRET,
            redirect_uris: [config.REDIRECT_URI],
            token_endpoint_auth_method: 'client_secret_post' //xsuaa needs this
        })

        passport.use(OPENID_CONNECT,
            new Strategy({ client }, (tokenSet, done) => {
                const claims = tokenSet.claims()
                return done(null, {
                    id: claims.sub,
                    name: claims.first_name + ' ' + claims.last_name,
                    claims: claims
                })
            })
        )

        app.get('/login', passport.authenticate(OPENID_CONNECT))

        app.get('/login/callback',
            passport.authenticate(OPENID_CONNECT, { failureRedirect: '/' }),
            (req, res) => res.redirect(req.session.originalUrl))

        return (req, res, next) => {
            if (req.originalUrl === '/service-worker.js') return next()
            if (req.originalUrl === '/favicon.ico') return res.status(204).end()
            if (!req.isAuthenticated()) {
                req.session.originalUrl = req.originalUrl
                return res.redirect('/login')
            }
            next()
        }
    }
}
