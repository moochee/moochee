'use strict'

import passport from 'passport'
import session from 'cookie-session'
import { Issuer, Strategy } from 'openid-client'

export default function GoogleAuth(config) {
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
            issuer: config.IDP,
            authorization_endpoint: `${config.IDP}/o/oauth2/v2/auth`,
            token_endpoint: 'https://oauth2.googleapis.com/token',
            jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs'
        })
        const client = new idp.Client({
            client_id: config.CLIENT_ID,
            client_secret: config.CLIENT_SECRET,
            redirect_uris: [config.REDIRECT_URI]
        })

        passport.use(OPENID_CONNECT,
            new Strategy({ client }, (tokenSet, done) => {
                const claims = tokenSet.claims()
                return done(null, {
                    id: claims.sub,
                    claims: claims
                })
            })
        )

        app.get('/login', passport.authenticate(OPENID_CONNECT))

        app.get('/login/callback',
            passport.authenticate(OPENID_CONNECT, { failureRedirect: '/' }),
            (req, res) => res.redirect(req.session.originalUrl))

        return (req, res, next) => {
            if (req.originalUrl === '/favicon.ico') return res.status(204).end()
            if (!req.isAuthenticated()) {
                req.session.originalUrl = req.originalUrl
                return res.redirect('/login')
            }
            next()
        }
    }
}
