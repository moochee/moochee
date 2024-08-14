import passport from 'passport'
import session from 'express-session'
import memorystore from 'memorystore'
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

        const MemoryStore = memorystore(session)
        const twentyFourHours = 86400000
        app.use(session({
            cookie: { maxAge: twentyFourHours },
            store: new MemoryStore({ checkPeriod: twentyFourHours }),
            resave: false,
            saveUninitialized: false,
            secret: config.SESSION_SECRET
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        const idp = new Issuer({
            issuer: 'https://accounts.google.com',
            authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
            token_endpoint: 'https://oauth2.googleapis.com/token',
            jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs'
        })
        const client = new idp.Client({
            client_id: config.CLIENT_ID,
            client_secret: config.CLIENT_SECRET,
            redirect_uris: [config.REDIRECT_URI]
        })

        passport.use(OPENID_CONNECT,
            new Strategy({ client, params: { scope: 'email profile' } }, (tokenSet, done) => {
                const claims = tokenSet.claims()
                return done(null, { id: claims.email })
            })
        )

        app.get('/login', passport.authenticate(OPENID_CONNECT))

        app.get('/login/callback', passport.authenticate(OPENID_CONNECT, { 
            successRedirect: '/', 
            failureRedirect: '/login/error' }
        ))

        app.get('/login/error', (req, res) => {
            res.status(500).send('Authentication error')
        })

        app.get('/logout', (req, res) => {
            req.logout({}, (err) => {
                if (err) {
                    console.error(err)
                    return res.status(500).send('An error occurred during logout')
                }
                res.redirect('/')
            })
        })

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
